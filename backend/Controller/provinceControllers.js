const con = require("../db");

exports.insertprovince = (req, res) => {
  const { countryId, provinceName } = req.body;

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
  const Status = "Active";

  // Insert query for regions table
  const insert_province_query = `
            INSERT INTO public.province("countryId", "provinceName", "addDate", "addTime", "Status")
            VALUES ($1, $2, $3, $4, $5)
          `;

  // Execute the insert query
  con.query(
    insert_province_query,
    [countryId, provinceName, addDate, addTime, Status],
    (err, result) => {
      if (err) {
        // If there's an error, send a 500 status with the error message
        return res.status(500).send(err);
      } else {
        // If the insertion is successful, send a success message
        res.status(200).json({
          success: true,
          message: "Province Data Inserted Successfully!",
        });
      }
    }
  );
};

exports.getProvince = (req, res) => {
  try {
    const get_query = `
    SELECT  p.*,   c.* 
    FROM  public.province p
    LEFT JOIN public.country c ON  p."countryId" = c."countryId";
    `;
    con.query(get_query, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err });
      }
      console.log("Query result:", result.rows);
      return res.json({ provinces: result.rows });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err });
  }
};

exports.updateProvince = (req, res) => {
  const { id } = req.params;
  const { countryId, provinceName } = req.body;

  // Ensure the required fields are provided
  if (!countryId || !provinceName) {
    return res.status(400).json({
      success: false,
      message: "'countryId' and 'provinceName' are required fields.",
    });
  }

  const update_query = `
    UPDATE public.province
    SET 
      "countryId" = $1, 
      "provinceName" = $2
    WHERE "provinceId" = $3
  `;

  con.query(update_query, [countryId, provinceName, id], (err, result) => {
    if (err) {
      console.error("Error updating province:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the province.",
        error: err.message || "Unknown error",
      });
    }

    if (result.rowCount === 0) {
      // No rows affected implies the province ID was not found
      return res.status(404).json({
        success: false,
        message: "Province not found.",
      });
    }

    // Successful update
    console.log(`Province updated successfully.`);
    res.status(200).json({
      success: true,
      message: `Province updated successfully.`,
    });
  });
};

exports.deleteProvince = (req, res) => {
  const { id } = req.params;

  // Delete query for the province table
  const delete_province_query = `
    DELETE FROM public.province
    WHERE "provinceId" = $1
  `;

  // Execute the delete query
  con.query(delete_province_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete Province",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "Province deleted successfully!",
    });
  });
};
