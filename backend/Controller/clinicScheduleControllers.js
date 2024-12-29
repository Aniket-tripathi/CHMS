const con = require("../db");
const moment = require("moment");


// INSERT SCHEDULE
exports.insertSchedule = async (req, res) => {
  const { month, clinicid, apsolts ,added_by,
    added_userid} = req.body;

  // Validate input
  if (!month || !apsolts || !clinicid) {
    return res.status(400).json({
      err: true,
      status: 400,
      message: "Month, clinic ID, and number of appointments are required.",
    });
  }

  // Validate the month format (YYYY-MM)
  if (!moment(month, "YYYY-MM", true).isValid()) {
    return res.status(400).json({
      err: true,
      status: 400,
      message: "Invalid month format. Please use 'YYYY-MM'.",
    });
  }

  // Get the selected month's start and end dates
  const selectedMonth = moment(month, "YYYY-MM");
  const startDate = moment().isAfter(selectedMonth.clone().startOf("month"))
    ? moment()
    : selectedMonth.clone().startOf("month");
  const endDate = selectedMonth.clone().endOf("month");
  const fromToDate = `${startDate.format("DD-MM-YYYY")} to ${endDate.format("DD-MM-YYYY")}`;

  try {
    // Check if schedule already exists for the selected month
    const existingScheduleQuery = `
      SELECT * FROM clinic_schedule WHERE clinicid = $1 AND month = $2
    `;
    const existingSchedule = await con.query(existingScheduleQuery, [clinicid, selectedMonth.format("MMMM")]);

    if (existingSchedule.rows.length > 0) {
      return res.status(400).json({
        err: true,
        status: 400,
        message: `Schedule for ${selectedMonth.format("MMMM")} already exists.`,
      });
    }

    // Insert schedule into the `clinic_schedule` table
    const insertScheduleQuery = `
      INSERT INTO clinic_schedule (clinicid, clinic_sch_dt, type, time, date, month, from_to_date,added_by,added_userid)
      VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9)
      RETURNING csid
    `;
    const now = moment();
    const formattedDate = now.format("DD-MM-YYYY");
    const formattedTime = now.format("HH:mm:ss");

    const insertScheduleResult = await con.query(insertScheduleQuery, [
      clinicid,
      formattedDate,
      "monthly",
      formattedTime,
      formattedDate,
      selectedMonth.format("MMMM"),
      fromToDate,
      added_by,
      added_userid
    ]);

    const scheduleId = insertScheduleResult.rows[0].csid;

    // Insert working hours into `clinic_working_hours` table
    const timeSlots = [
      { from: "07:30", to: "09:00" },
      { from: "09:00", to: "11:00" },
      { from: "11:00", to: "13:00" },
      { from: "13:00", to: "16:00" },
    ];

    const diagnosticsQuery = `SELECT ap_reasonid, ap_reason_name FROM appointment_reason`;
    const diagnosticsResult = await con.query(diagnosticsQuery);
    const reasons = diagnosticsResult.rows;

    let currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(endDate)) {
      const scheduleDate = currentDate.format("DD-MM-YYYY");

      for (const slot of timeSlots) {
        for (const reason of reasons) {
          const insertWorkingHoursQuery = `
            INSERT INTO clinic_working_hours (
              cwhdate, cwhfrom, cwhto, noofappointment, app_reasonid, app_reason_name, clinic_sch_id, clinicid, action, date, time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `;
          await con.query(insertWorkingHoursQuery, [
            scheduleDate,
            slot.from,
            slot.to,
            apsolts,
            reason.ap_reasonid,
            reason.ap_reason_name,
            scheduleId,
            clinicid,
            "monthly",
            formattedDate,
            formattedTime,
          ]);
        }
      }

      currentDate.add(1, "day");
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: `Schedule for ${selectedMonth.format("MMMM")} added successfully.`,
    });
  } catch (error) {
    console.error("Error inserting schedule:", error);
    return res.status(500).json({
      err: true,
      status: 500,
      message: "An error occurred while inserting the schedule. Please try again later.",
    });
  }
};







exports.getSchedule = (req, res) => {
  try {
    const { type, userid, clinicid } = req.query;

    // Base SQL query to join clinic_schedule with clinics table
    let query = `
    SELECT 
      cs.*, 
      c.*, 
      s.*
    FROM public.clinic_schedule cs
    LEFT JOIN public.clinics c ON cs."clinicid" = c."clinicid"
    LEFT JOIN public.staff s ON cs."added_userid" = s."id"
  `;


    // Add conditions based on user type
    if (type === "superadmin") {
      query += " ORDER BY cs.csid DESC;";
    } else if (type === "cadmin") {
      query += ` WHERE cs.clinicid = '${clinicid}' ORDER BY cs.csid DESC;`;
    } else if (type === "cstaff") {
      query += ` WHERE cs.added_userid = '${userid}' ORDER BY cs.csid DESC;`;
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Execute the query
    con.query(query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database query failed", details: err });
      }

      // Return the result as JSON
      console.log("Query result:", result.rows);
      return res.status(200).json({ schedules: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err });
  }
};




// Helper function to fetch the schedule for a given clinic and date
const getScheduleForDate = async (clinicid, date) => {
  try {
    // Format the date into a database-compatible format (DD-MM-YYYY)
    const formattedDate = moment(date, 'DD/MM/YYYY').format('DD-MM-YYYY');

    // SQL query to fetch the schedule
    const query = `
      SELECT clinicid, cwhdate, cwhfrom, cwhto
      FROM clinic_working_hours
      WHERE clinicid = $1
      AND cwhdate = $2
      ORDER BY cwhfrom;
    `;

    const values = [clinicid, formattedDate];
    const result = await con.query(query, values);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "No schedule found for the given clinic and date.",
      };
    }

    // Filter out duplicate time slots
    const uniqueTimeSlots = [];
    const processedTimeSlots = new Set();

    result.rows.forEach((slot) => {
      const timeSlotKey = `${slot.cwhfrom}-${slot.cwhto}`;
      if (!processedTimeSlots.has(timeSlotKey)) {
        uniqueTimeSlots.push(slot);
        processedTimeSlots.add(timeSlotKey);
      }
    });

    return {
      success: true,
      data: uniqueTimeSlots,
    };
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching the schedule.",
    };
  }
};

// Route to handle GET request for fetching the schedule
exports.gettimeslot = async (req, res) => {
  const { clinicid, dates } = req.params;  // Access query parameters

  // Validate input
  if (!clinicid || !dates) {
    return res.status(400).json({
      success: false,
      message: "Clinic ID and date are required.",
    });
  }

  try {
    // Fetch the schedule using the helper function
    const scheduleData = await getScheduleForDate(clinicid, dates);

    if (scheduleData.success) {
      return res.status(200).json(scheduleData);
    } else {
      return res.status(404).json(scheduleData);
    }
  } catch (error) {
    console.error("Error processing gettimeslot:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};


exports.getScheduleReason = async (req, res) => {
  const { clinic, appdate, timefrom, timeto } = req.params;

  if (!clinic || !appdate || !timefrom || !timeto) {
    return res.status(400).json({ error: "Missing required query parameters." });
  }

  try {
    // Use `appdate` directly as it is in DD-MM-YYYY format
    const formattedDate = appdate;

    // Query clinic working hours
    const workingHoursQuery = `
      SELECT *
      FROM clinic_working_hours
      WHERE clinicid = $1 AND cwhdate = $2 AND cwhfrom = $3 AND cwhto = $4
    `;

    const workingHoursResult = await con.query(workingHoursQuery, [
      clinic,
      formattedDate,
      timefrom,
      timeto,
    ]);
    const workingHours = workingHoursResult.rows;

    if (workingHours.length === 0) {
      return res.status(404).json({ message: "No working hours found for the given criteria." });
    }

    // Extract diagnostic IDs from the working hours
    const diagnosticIds = workingHours.map((row) => row.app_reasonid);

    // Query diagnostics based on extracted IDs
    const diagnosticsQuery = `
      SELECT *
      FROM appointment_reason
      WHERE ap_reasonid = ANY($1)
    `;
    const diagnosticsResult = await con.query(diagnosticsQuery, [diagnosticIds]);
    const diagnostics = diagnosticsResult.rows;

    // Group working hours by reason ID and map them to their respective diagnostics
    const diagnosticsWithWorkingHours = diagnostics.map((diagnostic) => {
      // Find matching working hours for each diagnostic
      const relatedWorkingHours = workingHours.filter(
        (wh) => wh.app_reasonid === diagnostic.ap_reasonid
      );

      // If no working hours found, set an empty array
      return {
        ...diagnostic,
        workingHours: relatedWorkingHours.length > 0 ? relatedWorkingHours : [],
      };
    });

    // Return the response with diagnostics and working hours
    res.status(200).json({
      diagnostics: diagnosticsWithWorkingHours,
    });
  } catch (error) {
    console.error("Error fetching schedule timeslot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

  exports.getScheduleReason = async (req, res) => {
    const { clinic, appdate, timefrom, timeto } = req.params;

    if (!clinic || !appdate || !timefrom || !timeto) {
      return res.status(400).json({ success: false, message: "Missing required query parameters." });
    }

    try {
      // Since the database already uses DD-MM-YYYY format, no conversion is needed
      const formattedDate = appdate; // Use `appdate` directly

      // Query clinic working hours
      const workingHoursQuery = `
        SELECT *
        FROM clinic_working_hours
        WHERE clinicid = $1 AND cwhdate = $2 AND cwhfrom = $3 AND cwhto = $4
      `;

      const workingHoursResult = await con.query(workingHoursQuery, [
        clinic,
        formattedDate,
        timefrom,
        timeto,
      ]);
      const workingHours = workingHoursResult.rows;

      if (workingHours.length === 0) {
        return res.status(200).json({ success: false, message: "No working hours found for the given criteria." });
      }

      // Extract diagnostic IDs from the working hours
      const diagnosticIds = workingHours.map((row) => row.app_reasonid);

      // Query diagnostics based on extracted IDs
      const diagnosticsQuery = `
        SELECT *
        FROM appointment_reason
        WHERE ap_reasonid = ANY($1)
      `;

      const diagnosticsResult = await con.query(diagnosticsQuery, [diagnosticIds]);
      const diagnostics = diagnosticsResult.rows;

      // Group working hours by reason ID and map to their respective diagnostics
      const diagnosticsWithWorkingHours = diagnostics.map((diagnostic) => {
        // Filter the working hours for the current diagnostic reason
        const relatedWorkingHours = workingHours.filter(
          (wh) => wh.app_reasonid === diagnostic.ap_reasonid
        );

        return {
          workingHours: relatedWorkingHours,
          ...diagnostic,
        };
      });

      if (diagnosticsWithWorkingHours.length === 0) {
        return res.status(200).json({ success: false, message: "No diagnostic data found." });
      }

      // Return the response with diagnostics including working hours
      res.status(200).json({
        success: true,
        data: {
          workingHoursdiag: diagnosticsWithWorkingHours,
        },
      });
    } catch (error) {
      console.error("Error fetching schedule timeslot:", error);
      res.status(500).json({ success: false, error: "Internal server error." });
    }
  };


  // GET SCHEDULE Data BY ID
  exports.getScheduleById = (req, res) => {
    try {
      // Extract `id` from request parameters
      const { id } = req.params;
  
      // Validate if the `id` parameter is provided
      if (!id) {
        return res.status(400).json({ error: 'Schedule ID is required' });
      }
  
      // SQL query to fetch a specific schedule by ID
      const query = `
        SELECT 
          cs.*, 
          c.*
        FROM public.clinic_schedule cs
        LEFT JOIN public.clinics c ON cs.clinicid = c.clinicid
        WHERE cs.csid = $1
      `;
  
      // Execute the query with the provided `id`
      con.query(query, [id], (err, result) => {
        if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ error: 'Database query failed', details: err });
        }
  
        // Check if the schedule exists
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Schedule not found' });
        }
  
        // Return the schedule details as JSON
        console.log('Query result:', result.rows[0]);
        return res.status(200).json({ schedules: result.rows[0] });
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err });
    }
  };



//getschedule list by id 
// Get Schedule List By ID
exports.getSchedulelistbyid = async (req, res) => {
  try {
    const clinicId = req.params.clinicid;
    const csid = req.params.csid;

    // Validate input
    if (!clinicId || !csid) {
      return res.status(400).json({ error: 'clinicid and csid are required' });
    }

    const todayDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Query clinic working hours
    const query = `
   SELECT * 
FROM public.clinic_working_hours AS cwh
INNER JOIN public.clinics AS c 
  ON cwh.clinicid = c.clinicid 
WHERE cwh.clinic_sch_id = $1 
  AND TO_DATE(cwh.cwhdate, 'DD-MM-YYYY') >= $2::DATE 
  AND cwh.clinicid = $3
ORDER BY TO_DATE(cwh.cwhdate, 'DD-MM-YYYY'), cwh.cwhfrom;
  `;
  
  
    const clinicWorkHrs = await con.query(query, [csid, todayDate, clinicId]);

    // Group records by date and time slot
    const groupedRecords = {};
    clinicWorkHrs.rows.forEach((record) => {
      const date = record.cwhdate;
      const timeSlot = `${record.cwhfrom} - ${record.cwhto}`;
      if (!groupedRecords[date]) {
        groupedRecords[date] = {};
      }
      if (!groupedRecords[date][timeSlot]) {
        groupedRecords[date][timeSlot] = [];
      }
      groupedRecords[date][timeSlot].push(record);
    });

    // Fetch diagnostic reasons
    const diagnosticQuery = 'SELECT * FROM public.appointment_reason;';
    const diagnostics = await con.query(diagnosticQuery);

    // Prepare the JSON response
    const response = [];
    for (const [date, timeSlots] of Object.entries(groupedRecords)) {
      const timeSlotData = [];
      for (const [timeSlot, records] of Object.entries(timeSlots)) {
        const [startTime, endTime] = timeSlot.split(' - ');

        const reasons = diagnostics.rows.map((reason) => {
          const matchedRecord = records.find(r => r.app_reasonid === reason.ap_reasonid);
          return {
            appreasonId: reason.ap_reasonid,
            appreasonName: reason.ap_reason_name,
            appreasoncolor:reason.ap_reason_dignscolor,
            appreasonshortname:reason.ap_reason_shortname,

            appointmentCount: matchedRecord ? matchedRecord.noofappointment : 0,
            cwhrecordId: matchedRecord ? matchedRecord.cwhid : null,
          };
        });

        timeSlotData.push({
          timeFrom: startTime,
          timeTo: endTime,
          reasons,
        });
      }

      

      response.push({
        date,
        timeSlots: timeSlotData,
      });
    }

    // Send the JSON response
    res.json({ schedules: response });
  } catch (err) {
    console.error('Error fetching clinic schedule:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};




//count total number of records for pagination 

exports.getTotalSchedulelistCount = async (req, res) => {
  try {
    const clinicId = req.params.clinicid;
    const csid = req.params.csid;

    // Validate input
    if (!clinicId || !csid) {
      return res.status(400).json({ error: 'clinicid and csid are required' });
    }

    const todayDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Query clinic working hours to get total count
    const query = `
    SELECT COUNT(*) 
    FROM public.clinic_working_hours 
    WHERE clinic_sch_id = $1 
      AND TO_DATE(cwhdate, 'DD-MM-YYYY') >= $2::DATE 
      AND clinicid = $3;
  `;
  
    const result = await con.query(query, [csid, todayDate, clinicId]);
    const totalSchedules = result.rows[0].count;

    // Send the JSON response with total schedule count
    res.json({ totalSchedules });
  } catch (err) {
    console.error('Error fetching total schedule count:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};





  







