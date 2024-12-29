const con = require("../db");
const redisClient = require("../redis.js");

// Function to insert data into the roles table
exports.insertRole = (req, res) => {
  const { rolename, roleclinicid } = req.body;

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
  const roledate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const roletime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const rolestatus = "Active";

  // Insert query for roles table
  const insert_role_query = `
    INSERT INTO public.roles(rolename, roleclinicid, roleStatus, roleDate, roleTime)
    VALUES ($1, $2, $3, $4, $5)
  `;

  // Execute the insert query
  con.query(
    insert_role_query,
    [rolename, roleclinicid, rolestatus, roledate, roletime],
    (err, result) => {
      if (err) {
        // If there's an error, send a 500 status with the error message
        return res.status(500).send(err);
      } else {
        // If the insertion is successful, send a success message
        console.log(result);
        // If the insertion is successful, send a proper JSON success response
        res.status(200).json({
          success: true,
          message: "Role Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getroles = (req, res) => {
  try {
    // SQL query to join the roles table with the clinics table on clinic_id
    const get_query = `
          SELECT r.*, c.* 
          FROM public.roles r
          LEFT JOIN public.clinics c ON r."roleclinicid" = c."clinicid"
      `;

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ roles: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

//get clinic wise  roles

exports.getclinicroles = (req, res) => {
  try {
    const { clinic_id } = req.params; // Extract clinic_id from the route parameters

    // Check if clinic_id is provided
    if (!clinic_id) {
      return res.status(400).json({ error: "clinic_id is required" });
    }

    // Query to get roles for a specific clinic
    const get_query = `SELECT * FROM public.roles WHERE roleclinicid = $1`;

    con.query(get_query, [clinic_id], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ roles: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

// Function to update role
exports.updateRole = (req, res) => {
  const { id } = req.params; // Extract the role ID from the URL parameter
  const { rolename, roleclinicid } = req.body; // Extract role data from the request body

  // Ensure the required fields are provided
  if (!rolename || !roleclinicid) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. 'rolename' and 'roleclinicid' are required.",
    });
  }

  // Update query for the roles table
  const update_role_query = `
        UPDATE public.roles
        SET 
            "rolename" = $1,
            "roleclinicid" = $2
        WHERE "roleid" = $3
    `;

  // Execute the query, passing the values to the query parameters
  con.query(update_role_query, [rolename, roleclinicid, id], (err, result) => {
    if (err) {
      console.error("Error updating role:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the role.",
        error: err,
      });
    }

    if (result.rowCount === 0) {
      // No rows affected implies the role ID was not found
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    // Successful update
    console.log(`Role with ID ${id} updated successfully.`);
    res.status(200).json({
      success: true,
      message: `Role with ID ${id} updated successfully.`,
    });
  });
};

// Function to delete a role
exports.deleterole = (req, res) => {
  const { id } = req.params; // Corrected to use "id" to align with the Angular service call

  // Delete query for the regions table
  const delete_role_query = `
    DELETE FROM public.roles
    WHERE "roleid" = $1
  `;

  // Execute the delete query
  con.query(delete_role_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete role",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Role deleted successfully!",
    });
  });
};

// Function to get a role by roleId

exports.getRoleById = (req, res) => {
  const { rid } = req.params;
  const get_query = "SELECT * FROM public.roles WHERE roleid = $1";

  con.query(get_query, [rid], (err, result) => {
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
