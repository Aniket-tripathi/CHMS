const con = require("../db"); // Database connection

// Function to insert an appointment
exports.insertAppointment = async (req, res) => {
    const {
        clinic_wkh_id,
        apnt_clinicid,
        clinic_schd_id,
        patient_mpi,
        patient_idno,
        patient_dob,
        app_nationality,
        app_passport,
        patient_name,
        gender,
        email,
        mobileno,
        // staff_doctorid,
        appointment_date,
        appointment_time,
        apt_reason_id,
        apnt_start_time,
        apnt_end_time,
        apnt_type,
        apnt_reminder,
        notes,
        selected_ap_reasonid,
        apnt_reason_name,
        selected_cwhid,
        selected_clinicsch_id,
        apnt_visitid,
        apnt_consultid,
        filestatus,
        filenote,
        patientstatus,
        patientnote,
        comments,
    } = req.body;

    try {
        // Step 1: Get the current maximum appointment number
      

        const resMaxNumber = await con.query('SELECT MAX(appointment_no) FROM "appointments"');
        const maxNumber = resMaxNumber.rows[0].max || 'APPOI110000'; // Default to 'APPOI110000' if no existing appointment

        // Extract numeric part from the appointment number
        const lastNumber = parseInt(maxNumber.substring(8), 10); // Get the number after 'APPOI11000'

        // Generate new appointment number
        let newNumber = lastNumber + 1;
        let appointment_no = 'APPOI11000' + newNumber;

        // Step 2: Check if the appointment number already exists
        let appointmentExists = true;
        while (appointmentExists) {
            const checkQuery = 'SELECT appointment_no FROM "appointments" WHERE appointment_no = $1';
            const result = await con.query(checkQuery, [appointment_no]);

            if (result.rowCount === 0) {
                appointmentExists = false; // No conflict, we can use this number
            } else {
                newNumber += 1; // Increment and check again
                appointment_no = 'APPOI11000' + newNumber;
            }
        }

        // Step 3: Prepare date and time in South Africa timezone (as per your requirement)
        const now = new Date();
        const southAfricaTime = new Intl.DateTimeFormat("en-ZA", {
            timeZone: "Africa/Johannesburg",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).formatToParts(now);

        const date = `${southAfricaTime[4].value.padStart(2, "0")}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
        const time = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
        const source= 'offline';
        const status= 'Approved';

        // Step 4: Insert data into the database
        const insert_query = `
        INSERT INTO public.appointments (
            clinic_wkh_id, apnt_clinicid, clinic_schd_id, appointment_no, patient_mpi, patient_idno, app_passport,
            patient_dob, app_nationality, patient_name, gender, email, mobileno,
            appointment_date, appointment_time, apt_reason_id,
            apnt_type, apnt_reminder, notes, source, appointment_status, apnt_visitid, apnt_consultid,
            bookapnt_date, filestatus, filenote, patientstatus, patientnote, comments, date, time, apnt_reason_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,$31,$32);
    `;
    
    const values = [
        selected_cwhid, apnt_clinicid, selected_clinicsch_id, appointment_no, patient_mpi, patient_idno, app_passport,
        patient_dob, app_nationality, patient_name, gender, email, mobileno,
        appointment_date, appointment_time, selected_ap_reasonid,
        apnt_type, apnt_reminder, notes, source, status,apnt_visitid, apnt_consultid,date,filestatus, filenote, patientstatus, patientnote, comments, date, time, apnt_reason_name
    ];
    
    

        const result = await con.query(insert_query, values);

        res.status(200).json({ success: true, message: "Appointment added successfully!", appointment_no });

    } catch (err) {
        console.error("Error inserting appointment:", err);
        res.status(500).json({ success: false, message: "Database Error", error: err });
    } finally {
        // Close the database connection
    }
};

// Function to fetch all appointments
exports.getAppointments = (req, res) => {
    const query = `
       SELECT 
    appt.*, 
    c.*, 
    app_reason.*, 
    patientregister.mpino
    FROM 
        public.appointments appt
    LEFT JOIN 
        public.clinics c ON appt."apnt_clinicid" = c."clinicid"
    LEFT JOIN 
        public.appointment_reason app_reason ON appt."apt_reason_id" = app_reason."ap_reasonid"
    LEFT JOIN 
        public.patientregister 
        ON CAST(appt."patient_mpi" AS TEXT) = CAST(patientregister."patientregid" AS TEXT)

    `;



   
    con.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching appointments:", err);
            return res.status(500).json({ success: false, message: "Database Error", error: err });
        }
        res.json({ success: true, Appointments: result.rows });
    });
};

// Function to fetch a single appointment by ID
exports.getAppointmentById = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT * FROM public.appointments WHERE appointment_id = $1
    `;
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching appointment:", err);
            return res.status(500).json({ success: false, message: "Database Error", error: err });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        res.json({ success: true, appointment: result.rows[0] });
    });
};


// Function to update an appointment
exports.updateAppointment = (req, res) => {
    const { id } = req.params; // Appointment ID from URL parameter
    const {
        clinic_wkh_id,
        apnt_clinicid,
        clinic_schd_id,
        appointment_no,
        patient_mpi,
        patient_idno,
        patient_dob,
        app_nationality,
        patient_name,
        gender,
        email,
        mobileno,
        staff_doctorid,
        appointment_date,
        appointment_time,
        apt_reason_id,
        apnt_start_time,
        apnt_end_time,
        apnt_type,
        apnt_reminder,
        source,
        appointment_status,
        apnt_visitid,
        apnt_consultid,
        filestatus,
        filenote,
        patientstatus,
        patientnote,
        comments,
    } = req.body;

    // Update query
    const query = `
        UPDATE public.appointments
        SET clinic_wkh_id = $1,
            apnt_clinicid = $2,
            clinic_schd_id = $3,
            appointment_no = $4,
            patient_mpi = $5,
            patient_idno = $6,
            patient_dob = $7,
            app_nationality = $8,
            patient_name = $9,
            gender = $10,
            email = $11,
            mobileno = $12,
            staff_doctorid = $13,
            appointment_date = $14,
            appointment_time = $15,
            apt_reason_id = $16,
            apnt_start_time = $17,
            apnt_end_time = $18,
            apnt_type = $19,
            apnt_reminder = $20,
            source = $21,
            appointment_status = $22,
            apnt_visitid = $23,
            apnt_consultid = $24,
            filestatus = $25,
            filenote = $26,
            patientstatus = $27,
            patientnote = $28,
            comments = $29
        WHERE appointment_id = $30
    `;

    // Execute the query
    con.query(
        query,
        [
            clinic_wkh_id,
            apnt_clinicid,
            clinic_schd_id,
            appointment_no,
            patient_mpi,
            patient_idno,
            patient_dob,
            app_nationality,
            patient_name,
            gender,
            email,
            mobileno,
            staff_doctorid,
            appointment_date,
            appointment_time,
            apt_reason_id,
            apnt_start_time,
            apnt_end_time,
            apnt_type,
            apnt_reminder,
            source,
            appointment_status,
            apnt_visitid,
            apnt_consultid,
            filestatus,
            filenote,
            patientstatus,
            patientnote,
            comments,
            id,
        ],
        (err, result) => {
            if (err) {
                console.error("Error updating appointment:", err);
                return res
                    .status(500)
                    .json({ success: false, message: "Database Error", error: err });
            }
            if (result.rowCount === 0) {
                return res
                    .status(404)
                    .json({ success: false, message: "Appointment not found" });
            }
            res.json({
                success: true,
                message: "Appointment updated successfully",
            });
        }
    );
};


// Function to delete an appointment
exports.deleteAppointment = (req, res) => {
    const { id } = req.params;
    const query = `
        DELETE FROM public.appointments WHERE appointment_id = $1
    `;
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting appointment:", err);
            return res.status(500).json({ success: false, message: "Database Error", error: err });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        res.json({ success: true, message: "Appointment deleted successfully" });
    });
};


//count total number of appointemnts
exports.getTotalAppointmentsCount = async (req, res) => {
    try {
      // SQL query to count the total number of clinics
      const countQuery = `SELECT COUNT(*) AS total FROM public.appointments`;
  
      // Execute the query
      con.query(countQuery, (err, result) => {
        if (err) {
          console.error('Error while counting appointments:', err);
          return res.status(500).json({ error: 'Internal Server Error', details: err });
        }
  
        // Extract the total count from the result
        const totalAppointments = result.rows[0].total;
        return res.json({ totalAppointments });
      });
    } catch (err) {
      console.error('Error in getTotalAppointmentsCount:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err });
    }
  };
