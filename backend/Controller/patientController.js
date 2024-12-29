const express = require('express');  // Add this line to import express
const con = require('../db');
const fs = require('fs');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');

// Increase the request body size limit for JSON requests
app.use(bodyParser.json({ limit: '50mb' }));  // Adjust the limit here

// Function to insert data
const insertPatient = async (req, res) => {
  const {
    clinicid, oldfileno, fileno, title, agep, guardian_mpino, firstname, lastname, fullname, idnumber, dob,
    passportno, expdt, gender, race, language, maritalstatus, citizenship, religion,
    patient_category, bill_address, bill_suburd, bill_city, bill_areacode, bill_region, bill_ward,
    patientpno, nationality, patientclassification, patientemail,
    patientextra, kin_detail, status, addate, addtime, appointmentsid,
    regstart, regend, chld_name, chld_age, chld_dob, chld_weight, child_id, patient_tokenid,
    patient_token_start, patient_token_end, medicalfund, medicalfundname, medicalfundno,
    pempstatus, pemployer, pempaddress, pempcountry, pempprovince, pempsuburb, pempcity, pempcode, pempcontact,
    pempemail, patientbarcode, ptype, left_thumb_template_base64, left_thumb,
    left_index_template_base64, left_index, right_thumb_template_base64, right_thumb, right_index_template_base64,
    right_index, pemployed, pnextofkin, patientdependant, added_by, added_userid
  } = req.body;

  try {
    // Step 1: Get the clinic name
    const clinicQuery = 'SELECT "clinicname" FROM clinics WHERE clinicid = $1';  // Make sure the column is correctly referenced
    const clinicResult = await con.query(clinicQuery, [clinicid]);

    if (clinicResult.rowCount === 0) {
      return res.status(404).send('Clinic not found.');
    }

    // Check if clinicname exists before accessing it
    const clinicname = clinicResult.rows[0].clinicname;

    if (!clinicname) {
      return res.status(500).send('Clinic name is missing or undefined.');
    }

    // Step 2: Process the clinicname safely
    const prefix = clinicname.substring(0, 3).toUpperCase();

    // Step 3: Get the count of patients for this clinic
    const countQuery = 'SELECT COUNT(*) AS patientCount FROM patientregister WHERE clinicid = $1';
    const countResult = await con.query(countQuery, [clinicid]);

    const patientCount = parseInt(countResult.rows[0].patientcount, 10);
    const newPatientNumber = patientCount + 1;

    // Step 4: Generate the MPI number
    const mpino = `${prefix}${newPatientNumber.toString().padStart(7, '0')}`;
    const patientclassification = 1;

    // Step 5: Create placeholders for SQL query
    const fields = [
      "clinicid", "mpino", "oldfileno", "fileno", "title", "agep", "guardian_mpino", "firstname", "lastname",
      "fullname",

      "idnumber", "dob", "passportno", "expdt", "gender", "race",
      "language", "maritalstatus", "citizenship", "religion",

      "patient_category", "bill_address",
      "bill_suburd", "bill_city", "bill_areacode", "bill_region", "bill_ward", "patientpno", "nationality", "patientclassification",

      "patientemail",
      "patientextra", "kin_detail",
      "status", "addate", "addtime", "appointmentsid", "regstart", "regend", "chld_name",

      "chld_age", "chld_dob",
      "chld_weight", "child_id", "patient_tokenid", "patient_token_start", "patient_token_end",
      "medicalfund", "medicalfundname", "medicalfundno",

      "pempstatus", "pemployer",
      "pempaddress", "pempcountry", "pempprovince", "pempsuburb", "pempcity", "pempcode", "pempcontact",
      "pempemail",

      "patientbarcode",
      "ptype", "left_thumb_template_base64", "left_thumb", "left_index_template_base64", "left_index",
      "right_thumb_template_base64", "right_thumb", "right_index_template_base64", "right_index",

      "pemployed", "pnextofkin", "patientdependant", "added_by", "added_userid"
    ];

    // Dynamically create the placeholders for the query
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    // Step 6: Construct the SQL INSERT query
    const insertQuery = `
    INSERT INTO patientregister (${fields.join(', ')})
    VALUES (${placeholders})
    RETURNING patientregid; -- Replace 'patientregid' with the correct column name
  `;


    // Create values array
    const values = [
      clinicid, mpino, oldfileno, fileno, title, agep, guardian_mpino, firstname, lastname, fullname,

      idnumber, dob, passportno, expdt, gender, race, language, maritalstatus, citizenship, religion,


      patient_category, bill_address, bill_suburd, bill_city, bill_areacode, bill_region, bill_ward,
      patientpno, nationality, patientclassification,

      patientemail,
      patientextra, kin_detail, status, addate, addtime, appointmentsid,
      regstart, regend, chld_name,

      chld_age, chld_dob, chld_weight, child_id, patient_tokenid,
      patient_token_start, patient_token_end, medicalfund, medicalfundname, medicalfundno,


      pempstatus, pemployer, pempaddress, pempcountry, pempprovince, pempsuburb, pempcity, pempcode, pempcontact,
      pempemail,

      patientbarcode, ptype, left_thumb_template_base64, left_thumb,
      left_index_template_base64, left_index, right_thumb_template_base64, right_thumb, right_index_template_base64,
      right_index,

      pemployed, pnextofkin, patientdependant, added_by, added_userid
    ];


    // Execute the query
    const result = await con.query(insertQuery, values);
    console.log(result)
    const ptnid = result.rows[0].patientregid;
    res.send({
      status: 'success',
      mpi: mpino,
      id: ptnid,
      message: 'Patient added successfully!'
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting patient data');
  }
};

// Function to get patients by clinic ID, including all classification data
// const patientbyclinic = (req, res) => {
//   const { clinicid } = req.params;

//   // SQL query to select patients where clinicid matches and include all classification data, handling NULL in classification
//   const get_query = ` 
//     SELECT 
//       p.*, 
//       c.clinicname, 
//       COALESCE(cl.id, NULL) as classification_id, 
//       COALESCE(cl.classification, 'No Classification') as classification_name
//     FROM 
//       public.patientregister p
//     LEFT JOIN 
//       public.clinics c 
//     ON 
//       p.clinicid = c.clinicid
//     LEFT JOIN 
//       public.classification cl 
//     ON 
//       p.patientclassification = cl.id
//     WHERE 
//       p.clinicid = $1
//      ORDER BY p.patientregid DESC;
//   `;

//   con.query(get_query, [clinicid], (err, result) => {
//     if (err) {
//       res.status(500).send({ message: 'Error fetching patient details' });
//     } else if (result.rows.length === 0) {
//       // Instead of sending 404, send a response indicating no data
//       res.status(200).send({ patients: [], message: 'No patients found for the selected clinic' });
//     }

//     // Check if any of the patients have NULL classification data (even though we already defaulted it in SQL)
//     const allPatientsHaveNoClassification = result.rows.every(patient => patient.classification_name === 'No Classification');

//     // If all patients have "No Classification", send a warning with the response.
//     if (allPatientsHaveNoClassification) {
//       console.warn('All patients in this clinic have no classification.');
//       res.status(200).json({
//         message: 'All patients in this clinic have no classification.',
//         patients: result.rows
//       });
//     } else {
//       res.status(200).json({ patients: result.rows });
//     }
//   });
// };
const patientbyclinic = (req, res) => {
  const { clinicid } = req.params;

  // SQL query to fetch patients along with clinic and classification details
  const get_query = ` 
    SELECT 
      p.*, 
      c.clinicname, 
      COALESCE(cl.id, NULL) as classification_id, 
      COALESCE(cl.classification, 'No Classification') as classification_name
    FROM 
      public.patientregister p
    LEFT JOIN 
      public.clinics c 
    ON 
      p.clinicid = c.clinicid
    LEFT JOIN 
      public.classification cl 
    ON 
      p.patientclassification = cl.id
    WHERE 
      p.clinicid = $1
    ORDER BY 
      p.patientregid DESC;
  `;

  con.query(get_query, [clinicid], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching patient details' });
    }

    const patients = result.rows;

    if (patients.length === 0) {
      // No patients found for the selected clinic
      return res.status(200).json({
        patients: [],
        message: 'No patients found for the selected clinic'
      });
    }

    // Check if all patients have "No Classification"
    const allPatientsHaveNoClassification = patients.every(patient => patient.classification_name === 'No Classification');

    if (allPatientsHaveNoClassification) {
      // Warning for all patients having no classification
      console.warn('All patients in this clinic have no classification.');
      return res.status(200).json({
        patients,
        message: 'All patients in this clinic have no classification.'
      });
    }

    // Default response with patient data
    res.status(200).json({ patients });
  });
};

const getPatient = (req, res) => {
  const { type, userid, clinicid } = req.query;

  let get_query = `
    SELECT 
      p.*, 
      c.clinicname 
    FROM 
      public.patientregister p
    LEFT JOIN 
      public.clinics c 
    ON 
      p.clinicid = c.clinicid
  `;


  if (type == "superadmin") {
    get_query += " ORDER BY p.patientregid DESC;";
  } else if (type == "cadmin") {
    get_query += ` WHERE p.clinicid = '${clinicid}' ORDER BY p.patientregid DESC;`;
  } else if (type == "cstaff") {
    get_query += ` WHERE p.added_userid = '${userid}' ORDER BY p.patientregid DESC;`;
  } else {
    get_query = "";
  }

  con.query(get_query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result.rows);
      res.json({ patients: result.rows });
    }
  });
};



// Function to get data by ID
const getPatientById = (req, res) => {
  const { id } = req.params;
  const get_query = `
    SELECT 
      p.*, 
      c.clinicname, 
      cl.classification AS classification_name
    FROM 
      public.patientregister p
    LEFT JOIN 
      public.clinics c 
    ON 
      p.clinicid = c.clinicid
    LEFT JOIN 
      public.classification cl 
    ON 
      p.patientclassification = cl.id
    WHERE 
      p.patientregid = $1
  `;

  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send('Record not found');
    } else {
      res.json({ patients: result.rows[0] });
    }
  });
};

const getPatientdetails = (req, res) => {
  const { clinicId, ptnMpi } = req.query;  // Use req.query to get query parameters from URL

  if (!clinicId || !ptnMpi) {
    return res.status(400).send('Both clinicId and ptnMpi are required');
  }

  const get_query = `
    SELECT 
      p.*, 
      c.clinicname
    FROM 
      public.patientregister p
    LEFT JOIN 
      public.clinics c 
    ON 
      p.clinicid = c.clinicid
    WHERE 
      p.mpino LIKE $1 AND p.clinicid = $2
  `;

  con.query(get_query, [`%${ptnMpi}%`, clinicId], (err, result) => {
    if (err) {
      return res.status(500).send(err);  // Handling error response
    } else if (result.rows.length === 0) {
      // Return an empty array and a message if no records found
      return res.json({ patients: [], message: 'No matching records found' });
    } else {
      return res.json({ patients: result.rows });  // Return all matched records
    }
  });
};

const classificationByClinic = (req, res) => {
  const { clinicid } = req.params;

  // SQL query to select classification data for the given clinic
  const get_query = `
    SELECT 
      cl.*, 
      c.clinicname  -- Select classification columns and clinic name
    FROM 
      public.classification cl
    LEFT JOIN 
      public.clinics c ON cl.clinic_id = c.clinicid  -- Assuming classification has clinicid
    WHERE 
      cl.clinic_id = $1  -- Filter by clinicid
  `;

  con.query(get_query, [clinicid], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);  // Log error for debugging
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send('No classifications found for the selected clinic');
    } else {
      res.json({ classifications: result.rows });
    }
  });
};







// Function to get MPI for a specific clinic ID
const getmpino = (req, res) => {
  const { id } = req.params;

  const get_query = `
    SELECT 
      LEFT(c.clinicname, 3) AS clinic_prefix, 
      c.cliniccode, 
      COUNT(p.clinicid) + 1 AS next_patient_no
    FROM 
      public.clinics c
    LEFT JOIN 
      public.patientregister p 
    ON 
      c.clinicid = p.clinicid
    WHERE 
      c.clinicid = $1
    GROUP BY 
      c.clinicname, c.cliniccode;
  `;

  con.query(get_query, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }
    if (result.rows.length === 0) {
      return res.status(404).send('Clinic not found or no patients registered');
    }

    const { clinic_prefix, cliniccode, next_patient_no } = result.rows[0];
    const mpi = `${clinic_prefix}${next_patient_no.toString().padStart(7, '0')}`;
    const code = cliniccode;

    const classification_query = `
      SELECT id, classification 
      FROM public.classification 
      WHERE clinic_id = $1;
    `;

    con.query(classification_query, [id], (err, classificationResult) => {
      if (err) {
        console.error('Database error while fetching classifications:', err);
        return res.status(500).send('Error fetching classifications');
      }

      const classifications = classificationResult.rows;

      res.json({
        mpi,
        code,
        classifications
      });
    });
  });
};

const saveSignature = (req, res) => {
  const { image, filename } = req.body;

  if (!image || !filename) {
    return res.status(400).send('Missing image or filename.');
  }
  console.log('Base64 image length:', image.length);
  const base64Image = image.replace(/^data:image\/jpeg;base64,/, '');
  const buffer = Buffer.from(base64Image, 'base64');

  if (buffer.length < 100) {
    return res.status(400).send('Invalid image data.');
  }

  // Construct the file path
  const filePath = path.join(__dirname, '..', 'uploads/signature', filename);

  // Save the image to the file system
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).send('Error saving image');
    }
    console.log('Image saved successfully:', filename);
    return res.status(200).send('Image saved successfully');
  });
};

const savewebcam = (req, res) => {
  const { image, filename } = req.body;

  // Check if both image and filename are provided
  if (!image || !filename) {
    return res.status(400).send('Missing image or filename.');
  }

  // Remove the base64 data URL prefix (if it exists) and convert the base64 string to a buffer
  const base64Image = image.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Image, 'base64');

  // Calculate the image size in MB
  const imageSizeInMB = buffer.length / (1024 * 1024); // Convert buffer length to MB
  const maxSizeInMB = 10; // Maximum allowed image size in MB

  // Check if the image exceeds the size limit
  if (imageSizeInMB > maxSizeInMB) {
    return res.status(400).send('Image size exceeds the maximum allowed size of 10MB.');
  }

  // Generate a unique filename (e.g., timestamp + random string)
  const uniqueFilename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.png`;

  // Define the directory where images will be stored
  const uploadsDir = path.join(__dirname, 'uploads', 'webcam');

  // Create the directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Define the full file path where the image will be saved
  const filePath = path.join(uploadsDir, uniqueFilename);

  // Write the image buffer to the specified file path
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving webcam image:', err);
      return res.status(500).send('Error saving image.');
    }

    // Log success and return the response with success message and unique filename
    console.log('Webcam image saved successfully:', uniqueFilename);
    return res.status(200).json({ message: 'Image uploaded successfully', uniqueFilename: uniqueFilename });
  });
};

const getTotalPatientCount = async (req, res) => {
  try {
    // SQL query to count the total number of clinics
    const countQuery = `SELECT COUNT(*) AS total FROM public.patientregister`;

    // Execute the query
    con.query(countQuery, (err, result) => {
      if (err) {
        console.error('Error while counting patient:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err });
      }

      // Extract the total count from the result
      const totalPatient = result.rows[0].total;
      return res.json({ totalPatient });
    });
  } catch (err) {
    console.error('Error in getTotalPatientCount:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err });
  }
};

module.exports = {
  insertPatient,
  getPatient,
  getPatientById,
  getmpino,
  saveSignature,
  savewebcam,
  getPatientdetails,
  patientbyclinic,
  classificationByClinic,
  getTotalPatientCount
};
