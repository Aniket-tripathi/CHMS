const con = require("../db");
const redisClient = require("../redis.js");

// Function to insert data
exports.insertDept = (req, res) => {
  const { clinic_id, deptname, deptdesc } = req.body;

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
    INSERT INTO public.department(clinic_id, deptname, deptdesc, status, adddate, addtime) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  con.query(
    insert_query,
    [clinic_id, deptname, deptdesc, status, adddate, addtime],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        console.log(result);

        // If the insertion is successful, send a proper JSON success response
        res.status(200).json({
          success: true,
          message: "Department Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getd = (req, res) => {
  try {
    // SQL query to join the roles table with the clinics table on clinic_id
    const get_query = `
          SELECT d.*, c.* 
          FROM public.department d
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
      return res.json({ departments: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

// Function to get data by ID
exports.getDeptById = (req, res) => {
  const { id } = req.params;
  const get_query = "SELECT * FROM public.department WHERE id = $1";

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
// Function to update data
exports.updateDept = (req, res) => {
  const { id } = req.params;
  const { clinic_id, deptname, deptdesc, status } = req.body;

  // Ensure the required fields are provided
  if (!deptname || !clinic_id) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. 'deptname' and 'clinic_id' are required.",
    });
  }

  const update_query = `
    UPDATE public.department 
    SET 
      "clinic_id" = $1, 
      "deptname" = $2, 
      "deptdesc" = $3, 
      "status" = $4
    WHERE "id" = $5
  `;

  con.query(
    update_query,
    [clinic_id, deptname, deptdesc, status, id],
    (err, result) => {
      if (err) {
        console.error("Error updating department:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the department.",
          error: err,
        });
      }

      if (result.rowCount === 0) {
        // No rows affected implies the department ID was not found
        return res.status(404).json({
          success: false,
          message: "Department not found.",
        });
      }

      // Successful update
      console.log(`Department with ID ${id} updated successfully.`);
      res.status(200).json({
        success: true,
        message: `Department with ID ${id} updated successfully.`,
      });
    }
  );
};

exports.deleteDept = (req, res) => {
  const { id } = req.params; // Corrected to use "id" to align with the Angular service call

  // Delete query for the regions table
  const delete_dept_query = `
    DELETE FROM public.department
    WHERE "id" = $1
  `;

  // Execute the delete query
  con.query(delete_dept_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete department",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Department deleted successfully!",
    });
  });
};
