const con = require("../db");
const redisClient = require("../redis.js");

exports.insertWard = (req, res) => {
  const { wardName, wardClinicId, wardRegionId } = req.body;

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
  const wardDate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const wardTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const wardStatus = "Active";

  // Insert query for regions table
  const insert_ward_query = `
          INSERT INTO public.ward("wardName", "wardClinicId", "wardRegionId", "wardStatus", "wardDate", "wardTime")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

  // Execute the insert query
  con.query(
    insert_ward_query,
    [wardName, wardClinicId, wardRegionId, wardStatus, wardDate, wardTime],
    (err, result) => {
      if (err) {
        // If there's an error, send a 500 status with the error message
        return res.status(500).send(err);
      } else {
        // If the insertion is successful, send a success message
        res.status(200).json({
          success: true,
          message: "Ward Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getward = (req, res) => {
  try {
    const get_query = `
    SELECT  w.*,   r.* 
    FROM  public.ward w
    LEFT JOIN public.regions r ON  w."wardRegionId" = r."regionId";
  `;

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ wards: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

exports.updateWard = (req, res) => {
  const { id } = req.params; // Ward ID from the URL params
  const { wardName, wardRegionId, wardStatus } = req.body; // New values to update

  // Ensure the required fields are provided (excluding wardClinicId)
  if (!wardName || !wardRegionId || !wardStatus) {
    return res.status(400).json({
      success: false,
      message:
        "'wardName', 'wardRegionId' and 'wardStatus' are required fields.",
    });
  }

  const update_query = `
    UPDATE public.ward 
    SET 
      "wardName" = $1, 
      "wardRegionId" = $2, 
      "wardStatus" = $3
    WHERE "wardId" = $4
  `;

  con.query(
    update_query,
    [wardName, wardRegionId, wardStatus, id],
    (err, result) => {
      if (err) {
        console.error("Error updating ward:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the ward.",
          error: err.message || "Unknown error",
        });
      }

      if (result.rowCount === 0) {
        // No rows affected implies the ward ID was not found
        return res.status(404).json({
          success: false,
          message: "Ward not found.",
        });
      }

      // Successful update
      console.log(`Ward with ID ${id} updated successfully.`);
      res.status(200).json({
        success: true,
        message: `Ward with ID ${id} updated successfully.`,
      });
    }
  );
};

exports.deleteWard = (req, res) => {
  const { id } = req.params; // Corrected to use "id" to align with the Angular service call

  // Delete query for the regions table
  const delete_ward_query = `
    DELETE FROM public.ward
    WHERE "wardId" = $1
  `;

  // Execute the delete query
  con.query(delete_ward_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete ward",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Ward deleted successfully!",
    });
  });
};
