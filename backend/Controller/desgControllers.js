const con = require("../db");
// const redisClient = require("../redis.js");

// Function to insert data
exports.insertDesg = (req, res) => {
  const { clinic_id, designation } = req.body;

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

  const adddate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const addtime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const status = "Active";

  const insert_query = `
    INSERT INTO public.designation(clinic_id, designation, adddate, addtime) 
    VALUES ($1, $2, $3, $4)
  `;

  con.query(
    insert_query,
    [clinic_id, designation, adddate, addtime],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message:
            "An error occurred while inserting the designation. Please try again later.",
          error: err.message || "Unknown error",
        });
      }

      res.json({
        success: true,
        message: "Designation Data Inserted Successfully!",
        insertedData: {
          clinic_id,
          designation,
          adddate,
          addtime,
          status,
        },
      });
    }
  );
};

// Function to get data by ID
exports.getDesgById = (req, res) => {
  const { id } = req.params;
  const get_query = "SELECT * FROM public.designation WHERE id = $1";

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(result.rows);
      res.json(result.rows[0]);
    }
  });
};

// Function to update data
exports.updateDesg = (req, res) => {
  const { id } = req.params;
  const { clinic_id, designation } = req.body;

  // Ensure the required fields are provided
  if (!designation || !clinic_id) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. 'designation' and 'clinic_id' are required.",
    });
  }

  const update_query = `
    UPDATE public.designation 
    SET 
      "clinic_id" = $1, 
      "designation" = $2
    WHERE "id" = $3
  `;

  con.query(update_query, [clinic_id, designation, id], (err, result) => {
    if (err) {
      console.error("Error updating designation:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the designation.",
        error: err.message || "Unknown error",
      });
    }

    if (result.rowCount === 0) {
      // No rows affected implies the designation ID was not found
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    // Successful update
    console.log(`Designation with ID ${id} updated successfully.`);
    res.status(200).json({
      success: true,
      message: `Designation with ID ${id} updated successfully.`,
    });
  });
};

exports.deleteDesg = (req, res) => {
  const { id } = req.params;
  const delete_query = "DELETE FROM public.designation WHERE id = $1";

  con.query(delete_query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the designation.",
        error: err.message || "Unknown error",
      });
    } else if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Designation deleted successfully.`,
        deletedData: {
          id,
        },
      });
    }
  });
};

//get all designations
exports.getdesignations = (req, res) => {
  try {
    // SQL query to join the roles table with the clinics table on clinic_id
    const get_query = `
          SELECT d.*, c.* 
          FROM public.designation d
          LEFT JOIN public.clinics c ON d.clinic_id = c.clinicid
      `;

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ designations: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};
