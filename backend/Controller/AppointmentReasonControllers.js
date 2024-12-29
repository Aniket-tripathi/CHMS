const con = require("../db");
const redisClient = require("../redis.js");

// Function to insert data into the appointment_reason table (Create)
exports.insertAppointmentReason = (req, res) => {
  const {
    ap_reason_name,
    ap_reason_desc,
    ap_reason_shortname,
    ap_reason_dignscolor,

    apr_clinic,
  } = req.body;

  // Get the current date and time in South Africa timezone
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

  // Format date and time for the database
  const formattedDate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const formattedTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const status = "Active";

  // Insert query for appointment_reason table
  const insert_appointment_reason_query = `
    INSERT INTO public.appointment_reason(
      ap_reason_name, ap_reason_desc, ap_reason_shortname, ap_reason_dignscolor, ap_reason_status, date, time, apr_clinic)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  // Execute the insert query
  con.query(
    insert_appointment_reason_query,
    [
      ap_reason_name,
      ap_reason_desc,
      ap_reason_shortname,
      ap_reason_dignscolor,
      status,
      formattedDate,
      formattedTime,
      apr_clinic,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.status(200).json({
          success: true,
          message: "Appointment Reason Data Inserted Successfully!",
        });
      }
    }
  );
};

// Function to get all appointment reasons (Read)
// exports.getAppointmentReasons = (req, res) => {
//   const get_query = "SELECT * FROM public.appointment_reason";
//   con.query(get_query, (err, result) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "Database query failed", details: err });
//     }
//     res.json({ appointmentReasons: result.rows });
//   });
// };

exports.getAppointmentReasons = (req, res) => {
  try {
    const get_query = "SELECT * FROM public.appointment_reason";

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ appointmentreasons: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

// Function to get a single appointment reason by its ID (Read by ID)
exports.getAppointmentReasonById = (req, res) => {
  const { id } = req.params;
  const get_query =
    "SELECT * FROM public.appointment_reason WHERE ap_reasonid = $1";

  con.query(get_query, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else if (result.rows.length === 0) {
      return res.status(404).send("Appointment Reason not found");
    } else {
      res.json(result.rows[0]);
    }
  });
};

// Function to update an appointment reason (Update)
exports.updateAppointmentReason = (req, res) => {
  const { id } = req.params; // Extract the appointment reason ID from the URL parameter
  const {
    ap_reason_name,
    ap_reason_desc,
    ap_reason_shortname,
    ap_reason_dignscolor,
    ap_reason_status,
    apr_clinic,
  } = req.body;

  // Ensure the required fields are provided
  if (!ap_reason_name || !ap_reason_desc || !ap_reason_shortname) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input. 'ap_reason_name', 'ap_reason_desc', and 'ap_reason_shortname' are required.",
    });
  }

  // Update query for the appointment_reason table
  const update_appointment_reason_query = `
    UPDATE public.appointment_reason
    SET 
      ap_reason_name = $1,
      ap_reason_desc = $2,
      ap_reason_shortname = $3,
      ap_reason_dignscolor = $4,
      ap_reason_status = $5,
      apr_clinic = $6
    WHERE ap_reasonid = $7
  `;

  // Execute the query, passing the values to the query parameters
  con.query(
    update_appointment_reason_query,
    [
      ap_reason_name,
      ap_reason_desc,
      ap_reason_shortname,
      ap_reason_dignscolor,
      ap_reason_status,
      apr_clinic,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating appointment reason:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the appointment reason.",
          error: err,
        });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment reason not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: `Appointment Reason updated successfully.`,
      });
    }
  );
};

// Function to delete an appointment reason (Delete)
exports.deleteAppointmentReason = (req, res) => {
  const { id } = req.params; // Corrected to use "id" to align with the Angular service call

  // Delete query for the regions table
  const delete_ward_query =
    "DELETE FROM public.appointment_reason WHERE ap_reasonid = $1";

  // Execute the delete query
  con.query(delete_ward_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete appointment reason",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Appointment Reason deleted successfully!",
    });
  });
};
