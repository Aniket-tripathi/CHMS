const con = require("../db");

exports.insertlevel = (req, res) => {
  const { levelName } = req.body;

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
  const addDate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const addTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const status = "Active";

  // Insert query for regions table
  const insert_level_query = `
              INSERT INTO public.level( "levelName", "addDate", "addTime", "status")
              VALUES ($1, $2, $3, $4)
            `;

  // Execute the insert query
  con.query(
    insert_level_query,
    [levelName, addDate, addTime, status],
    (err, result) => {
      if (err) {
        // If there's an error, send a 500 status with the error message
        return res.status(500).send(err);
      } else {
        // If the insertion is successful, send a success message
        res.status(200).json({
          success: true,
          message: "Level Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getLevel = (req, res) => {
  try {
    const get_query = `SELECT * FROM public.level`;

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ levels: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

exports.updateLevel = (req, res) => {
  const { id } = req.params;
  const { levelName } = req.body;

  // Ensure the required field is provided
  if (!levelName) {
    return res.status(400).json({
      success: false,
      message: "'levelName' is a required field.",
    });
  }

  // SQL query to update the level table
  const update_query = `
        UPDATE public.level
        SET 
          "levelName" = $1
        WHERE "levelId" = $2
      `;

  // Execute the update query
  con.query(update_query, [levelName, id], (err, result) => {
    if (err) {
      console.error("Error updating level:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the level.",
        error: err.message || "Unknown error",
      });
    }

    if (result.rowCount === 0) {
      // No rows affected implies the level ID was not found
      return res.status(404).json({
        success: false,
        message: "Level not found.",
      });
    }

    // Successful update
    console.log(`Level updated successfully.`);
    res.status(200).json({
      success: true,
      message: "Level updated successfully.",
    });
  });
};

exports.deleteLevel = (req, res) => {
  const { id } = req.params;

  // Delete query for the level table
  const delete_level_query = `
      DELETE FROM public.level
      WHERE "levelId" = $1
    `;

  // Execute the delete query
  con.query(delete_level_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete Level",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Level deleted successfully!",
    });
  });
};
