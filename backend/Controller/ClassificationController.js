const con = require("../db.js");
const multer = require("multer");

const path = require("path");
const fs = require("fs");

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure that the 'uploads' directory exists
    cb(null, "./uploads/streamimag/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Insert classification with image upload (single file)
exports.insertclsifction = async (req, res) => {
  try {
    // Destructure input from request body
    const { clinic_id, classification, clfcolor, addtime, adddate } = req.body;
    const clfimg = req.file ? req.file.filename : null;

    // Handle date and time formatting for South Africa timezone (if needed)
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

    const formattedDate = `${southAfricaTime[4].value.padStart(
      2,
      "0"
    )}-${southAfricaTime[2].value.padStart(2, "0")}-${
      southAfricaTime[0].value
    }`;
    const formattedTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;

    // Set addtime and adddate if not provided
    const finalAdddate = adddate || formattedDate;
    const finalAddtime = addtime || formattedTime;

    // SQL query to insert classification data
    const insertVitalQuery = `
      INSERT INTO public.classification(clinic_id, classification, clfcolor, clfimg, addtime, adddate)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;

    // Execute the query
    await con.query(insertVitalQuery, [
      clinic_id,
      classification,
      clfcolor,
      clfimg,
      finalAddtime,
      finalAdddate,
    ]);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Classification inserted successfully!",
    });
  } catch (err) {
    // Handle errors
    console.error("Error inserting classification data:", err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to insert classification data",
      error: err.message,
    });
  }
};

exports.upload = upload.single("clfimg");

exports.fetchclassification = (req, res) => {
  const get_query = `
    SELECT 
  c.clinicid AS clinic_id,
  c.clinicname,
  clf.classification,
  clf.clfcolor,
  clf.id,
  clf.clfimg,
  clf.addtime,
  clf.adddate
FROM 
  public.classification AS clf
JOIN 
  public.clinics AS c 
ON 
  c.clinicid = clf.clinic_id`;

  con.query(get_query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result.rows);
      res.json({ classification: result.rows });
    }
  });
};

exports.updateclsifiction = (req, res) => {
  const { id } = req.params; // Extract ID from route parameters
  const { clinic_id, classification, clfcolor, clfimg, addtime, adddate } =
    req.body;

  const update_query = `
     UPDATE public.classification 
     SET 
       "clinic_id" = $1, 
       "classification" = $2, 
       "clfcolor" = $3, 
       "clfimg" = $4, 
       "addtime" = $5, 
       "adddate" = $6
        WHERE "id" = $7
   `;

  con.query(
    update_query,
    [clinic_id, classification, clfcolor, clfimg, addtime, adddate, id],
    (err, result) => {
      if (err) {
        console.error("Error updating classification:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the classification.",
          error: err,
        });
      }

      if (result.rowCount === 0) {
        // No rows affected implies the classification ID was not found
        return res.status(404).json({
          success: false,
          message: "Classification not found.",
        });
      }

      // Successful update
      console.log(`Classification with ID ${id} updated successfully.`);
      res.status(200).json({
        success: true,
        message: `Classification with ID ${id} updated successfully.`,
      });
    }
  );
};

//to delete a classification
exports.deleteclassification = (req, res) => {
  const { id } = req.params;

  // Delete query for the regions table
  const delete_query = `
    DELETE FROM public.classification
    WHERE "id" = $1
  `;

  // Execute the delete query
  con.query(delete_query, [id], (err, result) => {
    if (err) {
      // If there's an error, send a 500 status with the error message
      console.error("Database Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete classification",
        details: err,
      });
    }

    // If the deletion is successful, send a success message
    return res.status(200).json({
      success: true,
      message: "classification deleted successfully!",
    });
  });
};

exports.viewclassification = (req, res) => {
  const { id } = req.params;
  const get_query = `
 SELECT 
    c.*, 
    cl.clinicname AS clinic_name
FROM 
    public.classification c
JOIN 
    public.clinics cl 
ON 
    c.clinic_id = cl.clinicid
WHERE 
    c.id = $1;

  `;

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("Record not found");
    } else {
      res.json({ classifications: result.rows[0] });
    }
  });
};

exports.getstreambyclinicId = (req, res) => {
  const { clinicid } = req.params;

  const get_query = `
SELECT
    cl.*,
    c.clinicname
FROM
    public.classification AS cl
LEFT JOIN
    public.clinics AS c
    ON cl.clinic_id = c.clinicid
WHERE
    cl.clinic_id = $1;

`;

  con.query(get_query, [clinicid], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("No classifications found for the selected clinic");
    } else {
      res.json({ classifications: result.rows });
    }
  });
};

//streamclassification
exports.insertStreamClassification = (req, res) => {
  const { clinic_id, classifid, classifid_reason, adddate, addtime } = req.body;

  // Log the request data
  console.log("Request Data:", {
    clinic_id,
    classifid,
    classifid_reason,
    adddate,
    addtime,
  });

  const insertQuery = `
    INSERT INTO public.classification_reason (clinic_id, classifid, classifid_reason, adddate, addtime)
    VALUES ($1, $2, $3, $4, $5)
  `;

  con.query(
    insertQuery,
    [clinic_id, classifid, classifid_reason, adddate, addtime],
    (err, result) => {
      if (err) {
        console.error("Error inserting stream classification data:", err.stack);
        return res.status(500).json({
          success: false,
          message: "Failed to insert stream classification data.",
          error: err.message,
        });
      }
      res.status(200).json({
        success: true,
        message: "Stream classification inserted successfully!",
      });
    }
  );
};

exports.liststreamClassification = (req, res) => {
  // const get_query = `
  //   SELECT
  //     clr.*,
  //     // c.clinicname,
  //     // // cl.id,
  //     // // cl.clinic_id,
  //     // // cl.classification
  //   FROM public.classification_reason clr
  //   // JOIN public.clinics c ON c.clinicid = clr.clinic_id
  //   // JOIN public.classification cl ON cl.id = clr.classifid;
  // `;

  const get_clsreson_query = `
  SELECT clr.*,
   c.clinicname,
    cl.id,
    cl.clinic_id,
    cl.classification
     FROM public.classification_reason clr
      JOIN public.clinics c ON c.clinicid = clr.clinic_id
      JOIN public.classification cl ON cl.id = clr.classifid;`; 
      
  // Execute the query
  con.query(get_clsreson_query, (err, result) => {
    if (err) {
      // Handle any errors
      res.status(500).send(err);
    } else {
      // Send the result as a JSON response
      console.log(result.rows);
      res.json({ stremclassifiction: result.rows });
    }
  });
};

exports.classificationclinic = (req, res) => {
  const clinicId = req.params.id;  // Get clinicId from URL params

  // Check if clinicId is provided
  if (!clinicId) {
    return res.status(400).send('Clinic ID is required');  // Return error if clinicId is missing
  }

  const get_query = `
    SELECT 
      c.clinicid AS clinic_id,
      c.clinicname,
      clf.classification,
      clf.clfcolor,
      clf.clfimg,
       clf.id,
      clf.addtime,
      clf.adddate
    FROM 
      public.classification AS clf
    JOIN 
      public.clinics AS c 
    ON 
      c.clinicid = clf.clinic_id
    WHERE 
      c.clinicid = $1`;  // Use parameterized query to avoid SQL injection

  // Run the query
  con.query(get_query, [clinicId], (err, result) => {
    if (err) {
      return res.status(500).send(err);  // Handle any SQL or connection errors
    }

    if (result.rows.length === 0) {
      return res.send('No classification data found for this clinic');  // Send only a message if no data is found
    }

    // Send back the classification data as JSON
    res.json({ classifications: result.rows });
  });
};
