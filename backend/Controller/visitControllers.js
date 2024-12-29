const con = require('../db');

exports.vstregister = (req, res) => {
  const {
    visit_clinicid = null,
    patient_id = null,
    hdccat = null,
    appointmentid = null,
    roomid = null,
    visit_date = null,
    visit_time = null,
    vststart = null,
    vstend = null,
    visit_type = null,
    referred_by = null,
    pcategory = null,
    status = null,
    age = null,
    emailv = null,
    authentication_note,
    visit_tokenid = null,
    visit_token_start = null,
    visit_token_end = null,
    prescordesp = null,
    hct = null,
    pres_note = null,
    visitstatus = null,
    added_by = null,
    added_userid = null,
    vststream_data = [],
  } = req.body;

  const today = new Date();
  const formattedVisitDate = visit_date ? new Date(visit_date) : today;
  const visit_date_str = formattedVisitDate.toISOString().split('T')[0];
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const visitDatePrefix = `VST${year}${month}${day}`;

  const countQuery = `
   SELECT COUNT(*) AS visit_count 
   FROM public.visit_registration
   WHERE visit_clinicid = $1 
   AND TO_DATE(visit_date, 'YYYY-MM-DD') = CURRENT_DATE;
 `;

  con.query(countQuery, [visit_clinicid], (err, result) => {
    if (err) {
      console.error("Error counting visits:", err.stack);
      return res.status(500).json({
        message: "Error counting visits",
        error: err.message,
      });
    }
    const visitCount = parseInt(result.rows[0].visit_count, 10) + 1;
    const visitNo = `${visitDatePrefix}-${String(visitCount).padStart(2, '0')}`;
    const roomid = 1;
    const status = 1;
    const insertVisitQuery = `
     INSERT INTO public.visit_registration (
       visit_clinicid, visit_no, patient_id, hdccat, appointmentid, roomid, visit_date, visit_time,
       vststart, vstend, visit_type, referred_by, pcategory, status, age, emailv, authentication_note,
       visit_tokenid, visit_token_start, visit_token_end, prescordesp, hct, pres_note, visitstatus, added_by,added_userid
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25,$26)
     RETURNING vid, visit_no;
   `;

    const visitValues = [
      visit_clinicid,
      visitNo,  // Use the generated visit_no
      patient_id,
      hdccat,
      appointmentid,
      roomid,
      visit_date_str,
      visit_time,
      vststart,
      vstend,
      visit_type,
      referred_by,
      pcategory,
      status,
      age,
      emailv,
      authentication_note,
      visit_tokenid,
      visit_token_start,
      visit_token_end,
      prescordesp,
      hct,
      pres_note,
      visitstatus,
      added_by,
      added_userid,
    ];

    con.query(insertVisitQuery, visitValues, (err, visitResult) => {
      if (err) {
        console.error("Error inserting visit data:", err.stack);
        return res.status(500).json({
          message: "Database error while inserting visit data",
          error: err.message,
        });
      }

      const visitId = visitResult.rows[0].vid;
      const streamValues = [];
      const valuePlaceholders = [];

      vststream_data.forEach((stream, index) => {
        streamValues.push(
          stream.vststream_id || null,
          visit_clinicid,
          visitId,
          patient_id,
          stream.vststream_streamid || null,
          stream.vststream_classifid || null,
          stream.vststream_subclsfct_id || null,
          stream.vststream_dts || null,
          stream.substrm_id || null
        );

        const offset = index * 9;
        valuePlaceholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
        );
      });

      const insertStreamQuery = `
       INSERT INTO public.vststrem_allocation (
         vststream_id, vststream_clinicid, vststream_visitid, vststream_ptnid,
         vststream_streamid, vststream_classifid, vststream_subclsfct_id, vststream_dts, substrm_id
       ) VALUES ${valuePlaceholders.join(", ")};`;

      if (vststream_data.length > 0) {
        con.query(insertStreamQuery, streamValues, (err, streamResult) => {
          if (err) {
            console.error("Error inserting stream data:", err.stack);
            return res.status(500).json({
              message: "Database error while inserting stream data",
              error: err.message,
            });
          }

          res.status(201).json({
            message: "Data inserted successfully",
            visitData: visitResult.rows[0],
            streamData: streamResult.rowCount,
          });
        });
      } else {
        res.status(201).json({
          message: "Visit data inserted successfully, no stream data provided.",
          visitData: visitResult.rows[0],
          streamData: 0,
        });
      }
    });
  });
};

exports.getVisit = (req, res) => {
  const { type, userid, clinicid } = req.query;

  // SQL query to join the tables
  let get_query = `
    SELECT 
      v.*,   
      c.clinicname, 
      p.fullname, 
      p.patientpno, 
      p.patientemail
    FROM public.visit_registration v
    JOIN public.clinics c ON c.clinicid = v.visit_clinicid
    JOIN public.patientregister p ON p.patientregid = v.patient_id
  `;

  // Adjust the query based on the user type
  if (type === "superadmin") {
    get_query += " ORDER BY v.vid DESC;";
  } else if (type === "cadmin") {
    // Ensure WHERE is correctly added
    get_query += ` WHERE v.visit_clinicid = '${clinicid}' ORDER BY v.vid DESC;`;
  } else if (type === "cstaff") {
    // Ensure WHERE is correctly added
    get_query += ` WHERE v.added_userid = '${userid}' ORDER BY v.vid DESC;`;
  } else {
    get_query = "";
  }

  // Execute the query
  con.query(get_query, (err, result) => {
    if (err) {
      // Log the error with additional details
      console.error("Database error: ", err.message);
      console.error("Query that caused the error: ", get_query);
      res.status(500).send({ error: err.message });
    } else {
      // Log the result rows for debugging
      console.log("Query result: ", result.rows);
      res.json({ visits: result.rows });
    }
  });
};



exports.getVisitById = (req, res) => {
  const { id } = req.params;
  const get_query = `
    SELECT 
      v.*, 
      c.clinicname, 
      p.fullname, 
      p.patientpno, 
      p.patientemail,
      p.agep
    FROM public.visit_registration v
    JOIN public.clinics c ON c.clinicid = v.visit_clinicid
    JOIN public.patientregister p ON p.patientregid = v.patient_id
    WHERE v.vid = $1;  -- Filter by visit ID using a parameterized query
  `;
  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send('Visit not found');
    } else {
      console.log(result.rows);
      res.json({ visits: result.rows[0] });
    }
  });
};

exports.getptnById = (req, res) => {
  const { id } = req.params;
  const get_query = 'SELECT * FROM public.patientregister WHERE patientregid = $1';

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(result.rows);
      res.json({ patients: result.rows[0] });
    }
  });
};

exports.getVisitByClinic = (req, res) => {
  const { id } = req.params;
  const get_query = `SELECT * FROM public.visit_registration WHERE "visit_clinicid" = $1`;

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result.rows);
      res.json({ visits: result.rows });
    }
  });
};

exports.getptnById = (req, res) => {
  const { id } = req.params;
  const get_query = 'SELECT * FROM public.patientregister WHERE patientregid = $1';

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(result.rows);
      res.json({ patients: result.rows[0] });
    }
  });
};

exports.getvisitdata = (req, res) => {
  const { id } = req.params;

  const get_query = `
    SELECT 
      v.*, 
      p.patientregid, 
      p.fullname,
      p.title,
      p.agep,
      p.mpino,
      p.gender
    FROM 
      public.visit_registration v
    JOIN 
      public.patientregister p 
    ON 
      p.patientregid = v.patient_id
    WHERE 
      v.vid = $1
  `;
  con.query(get_query, [id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send(err);
    } else {
      console.log('Query result:', result.rows);
      res.json({ visits: result.rows[0] });
    }
  });
}; 