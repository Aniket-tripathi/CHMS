const con = require("../db");
const redisClient = require("../redis.js");

exports.insertRegion = (req, res) => {
  const { regionName, regionClinicId } = req.body;

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
  const regionDate = `${southAfricaTime[4].value.padStart(
    2,
    "0"
  )}-${southAfricaTime[2].value.padStart(2, "0")}-${southAfricaTime[0].value}`;
  const regionTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const regionStatus = "Active";

  // Insert query for regions table
  const insert_region_query = `
        INSERT INTO public.regions("regionName", "regionClinicId", "regionStatus", "regionDate", "regionTime")
        VALUES ($1, $2, $3, $4, $5)
      `;

  // Execute the insert query
  con.query(
    insert_region_query,
    [regionName, regionClinicId, regionStatus, regionDate, regionTime],
    (err, result) => {
      if (err) {
        // If there's an error, send a 500 status with the error message
        return res.status(500).send(err);
      } else {
        // If the insertion is successful, send a success message
        res.status(200).json({
          success: true,
          message: "Region Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getregion = (req, res) => {
  try {
    // SQL query to join the roles table with the clinics table on clinic_id

    const get_query = `
    SELECT r.*, c.* 
    FROM public.regions r
    LEFT JOIN public.clinics c ON r."regionClinicId" = c.clinicid
`;

    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ regions: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

exports.updateRegion = (req, res) => {
  const { id } = req.params;
  const { regionName, regionClinicId, regionStatus } = req.body;

  // Ensure the required fields are provided
  if (!regionName || !regionClinicId || !regionStatus) {
    return res.status(400).json({
      success: false,
      message:
        "'regionName', 'regionClinicId' and 'regionStatus' are required fields.",
    });
  }

  const update_query = `
    UPDATE public.regions 
    SET 
      "regionName" = $1, 
      "regionClinicId" = $2, 
      "regionStatus" = $3
    WHERE "regionId" = $4
  `;

  con.query(
    update_query,
    [regionName, regionClinicId, regionStatus, id],
    (err, result) => {
      if (err) {
        console.error("Error updating region:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the region.",
          error: err.message || "Unknown error",
        });
      }

      if (result.rowCount === 0) {
        // No rows affected implies the region ID was not found
        return res.status(404).json({
          success: false,
          message: "Region not found.",
        });
      }

      // Successful update
      console.log(`Region with ID ${id} updated successfully.`);
      res.status(200).json({
        success: true,
        message: `Region with ID ${id} updated successfully.`,
      });
    }
  );
};

exports.deleteRegion = (req, res) => {
  const { id } = req.params; // Corrected to use "id" to align with the Angular service call

  // Delete query for the regions table
  const delete_region_query = `
    DELETE FROM public.regions
    WHERE "regionId" = $1
  `;

  // Execute the delete query
  con.query(delete_region_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete region",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Region deleted successfully!",
    });
  });
};
