const con = require('../db');
const { sendEmail } = require("../Utils/email.js");
const redisClient = require('../redis.js')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitize = require('sanitize-filename');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/clinicUploads'); // Upload directory
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


exports.insertClinic = async (req, res) => {
  const {
    clinicname,
    cliniccode,
    clinicEmail,
    clinicContactNo,
    clinicRegionId,
    ClinicWardId,
    services,
    comments,
    clinicAddress,
    clinicType
  } = req.body;

  const clinicLogo = req.file ? req.file.filename : null;

  const now = new Date();
  const southAfricaTime = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const clinicAddDate = `${southAfricaTime[4].value.padStart(2, '0')}-${southAfricaTime[2].value.padStart(2, '0')}-${southAfricaTime[0].value}`;
  const clinicAddTime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const clinicStatus = 'inactive';
  const clinicplan = 'basic';

  // Check if clinicEmail already exists
  const emailCheckQuery = `SELECT * FROM clinics WHERE "clinicEmail" = $1`;

  try {
    const emailCheckResult = await con.query(emailCheckQuery, [clinicEmail]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).send({
        error: 'Conflict',
        message: 'A clinic with this email already exists.'
      });
    }

    // If email is unique, insert the new clinic
    const insertQuery = `
      INSERT INTO clinics(
        "clinicname", "cliniccode", "clinicEmail", "clinicContactNo", 
        "clinicLogo", "clinicRegionId", "ClinicWardId", services, 
        comments, "clinicAddress", "clinicType", "clinicAddDate", "clinicAddTime", "clinicStatus", clinicplan
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 , $15)
      RETURNING *;
    `;

    const insertResult = await con.query(insertQuery, [
      clinicname,
      cliniccode,
      clinicEmail,
      clinicContactNo,
      clinicLogo,
      clinicRegionId,
      ClinicWardId,
      services,
      comments,
      clinicAddress,
      clinicType,
      clinicAddDate,
      clinicAddTime,
      clinicStatus,
      clinicplan
    ]);

    console.log('Database Insertion Result:', insertResult.rows[0]);

    // Send email in parallel (without blocking database insertion)
    const subject = 'Welcome to Our Clinic Network';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
  <div style="background-color: #4caf50; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1>Welcome, ${clinicname}!</h1>
    <p>Your clinic has been successfully registered.</p>
  </div>
  <div style="padding: 20px; background-color: #f4f4f9;">
    <h2 style="color: #4caf50;">Clinic Details</h2>
    <p>Here are the details of your clinic:</p>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Clinic Code:</strong> ${cliniccode}</li>
      <li><strong>Email:</strong> ${clinicEmail}</li>
      <li><strong>Contact Number:</strong> ${clinicContactNo}</li>
      <li><strong>Address:</strong> ${clinicAddress}</li>
      <li><strong>Added On:</strong> ${clinicAddDate} at ${clinicAddTime}</li>
      <li><strong>Type:</strong> ${clinicType}</li>
    </ul>
    <p>
      <strong>Next Steps:</strong>
      <ol style="margin-left: 20px;">
        <li>Contact the system owner or administrator to request activation of your clinic.</li>
        <li>Once activated, you will be able to log in and start using the system.</li>
        <li>Begin by adding staff, managing services, and exploring features to enhance your operations.</li>
      </ol>
    </p>
    <p style="margin: 20px 0; text-align: center;">
      <span style="color: #333; font-size: 16px; font-weight: bold;">Please contact the administrator at:</span><br>
      <strong>Email:</strong> mailto:admin@hospitalmanagement.com<br>
      <strong>Phone:</strong> +27 123 456 7890
    </p>
    <p>If you need further assistance, feel free to reach out to our support team.</p>
  </div>
  <div style="text-align: center; font-size: 12px; color: #777; padding: 10px;">
    Thank you for joining our network. Together, we’re redefining healthcare management.
  </div>
</div>

    `;

    // Sending the email asynchronously
    const sendEmailPromise = sendEmail(clinicEmail, subject, html);

    // Wait for both the insert result and email sending to complete
    await Promise.all([sendEmailPromise]);

    res.status(201).send({
      message: 'Clinic data inserted successfully, and email sent!',
      data: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Error:', err);

    // Handle database or email errors
    if (err.code === '23505') { // Unique constraint violation error code
      res.status(409).send({
        error: 'Conflict',
        message: 'A clinic with this email already exists.'
      });
    } else {
      res.status(500).send({
        error: 'Internal Server Error',
        details: err
      });
    }
  }
};

exports.upload = upload.single('clinicLogo');

exports.checkEmailAvailability = async (req, res) => {
  const { clinicEmail } = req.body;

  // Query to check if the email already exists in the database
  const emailCheckQuery = `SELECT * FROM clinics WHERE "clinicEmail" = $1`;

  try {
    const emailCheckResult = await con.query(emailCheckQuery, [clinicEmail]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).send({
        error: 'Conflict',
        message: 'A clinic with this email already exists.'
      });
    }
    return res.status(200).send({
      message: 'Email is available.'
    });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).send({
      error: 'Internal Server Error',
      details: err
    });
  }
};

// Function to get data by ID

// exports.getClinic = async (req, res) => {
//   const redisKey = 'clinics_data';

//   try {
//     // Attempt to get data from Redis
//     const data = await redisClient.get(redisKey); // Using await for async Redis call

//     if (data) {
//       // Cache hit
//       console.log('Cache hit');
//       return res.json({ clinics: JSON.parse(data) });
//     } else {
//       // Data not in cache, fetch from PostgreSQL
//       const get_query = 'SELECT * FROM public.clinics';
//       con.query(get_query, (err, result) => {
//         if (err) {
//           return res.status(500).send(err);
//         } else {
//           // Save to Redis and send response
//           redisClient.setEx(redisKey, 1000, JSON.stringify(result.rows)); // Setting data with expiration
//           console.log('Cache miss');
//           return res.json({ clinics: result.rows });
//         }
//       });
//     }
//   } catch (err) {
//     console.error('Error in Redis:', err);
//     return res.status(500).send({ error: 'Internal Server Error', details: err });
//   }
// };

// Modify the getClinic function to accept the search query
exports.getClinic = async (req, res) => {
  const redisKey = 'clinics_data';
  const { query } = req.query; // Get search query from the request

  try {
    // If there's a search query, skip the cache and fetch data from the database
    if (query) {
      console.log('Searching from the database with query:', query);

      const searchCondition = `WHERE "clinicname" ILIKE '%${query}%' 
                                        OR "clinicEmail" ILIKE '%${query}%'
                                        OR "cliniccode" ILIKE '%${query}%'
                                        `;
      const get_query = `SELECT * FROM public.clinics ${searchCondition} ORDER BY "clinicid" DESC LIMIT 100`;

      con.query(get_query, (err, result) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          // Don't cache the search result, just return it directly
          return res.json({ clinics: result.rows });
        }
      });
    } else {
      // No query, check if cached data exists
      let data = await redisClient.get(redisKey);

      if (data) {
        console.log('Cache hit');
        return res.json({ clinics: JSON.parse(data) });
      } else {
        // If no data in cache, fetch from the database
        const get_query = `SELECT * FROM public.clinics ORDER BY "clinicid" DESC LIMIT 100`;

        con.query(get_query, (err, result) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            redisClient.setEx(redisKey, 1, JSON.stringify(result.rows)); // Cache for 1 hour
            console.log('Cache miss');
            return res.json({ clinics: result.rows });
          }
        });
      }
    }
  } catch (err) {
    console.error('Error in Redis:', err);
    return res.status(500).send({ error: 'Internal Server Error', details: err });
  }
};


exports.getClinicById = (req, res) => {
  const { clinicid } = req.params;
  const get_query = 'SELECT * FROM public.clinics WHERE "clinicid" = $1';

  con.query(get_query, [clinicid], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send({ error: 'Internal server error' });
    } else if (result.rows.length === 0) {
      res.status(404).send({ message: 'Record not found' });
    } else {
      res.json(result.rows[0]);
    }
  });
};


// Function to update counter
exports.updateClinic = (req, res) => {
  const { clinicid } = req.params;
  const {
    clinicname, cliniccode, clinicEmail, clinicContactNo, clinicLogo,
    clinicRegionId, ClinicWardId, services, comments, clinicAddress, clinicStatus, clinicplan
  } = req.body;

  const update_query = `
   UPDATE public.clinics 
   SET 
     "clinicname" = $1, 
     "cliniccode" = $2, 
     "clinicEmail" = $3, 
     "clinicContactNo" = $4, 
     "clinicLogo" = $5, 
     "clinicRegionId" = $6, 
     "ClinicWardId" = $7, 
     services = $8, 
     comments = $9, 
     "clinicAddress" = $10, 
     "clinicStatus" = $11,
     "clinicplan" = $12
   WHERE "clinicid" = $13
 `;

  con.query(update_query, [
    clinicname, cliniccode, clinicEmail, clinicContactNo, clinicLogo,
    clinicRegionId, ClinicWardId, services, comments, clinicAddress,
    clinicStatus, clinicplan, clinicid
  ], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      res.status(500).send({ error: err.message });
    } else if (result.rowCount === 0) {
      res.status(404).send({ message: 'Record not found' });
    } else {

      // Clear the cache for clinics
      redisClient.del('clinics_data', (err) => {
        if (err) {
          console.error('Failed to delete cache:', err);
        } else {
          console.log('Cache cleared');
        }
      })
      console.log(`Clinic id ${clinicid} data updated`);
      res.send({ message: `Clinic id ${clinicid} data updated successfully` });
    }
  });
};



// Function to delete data by ID
exports.deleteClinic = (req, res) => {
  const { clinicid } = req.params;
  const delete_query = 'DELETE FROM public.clinics WHERE "clinicid" = $1';

  con.query(delete_query, [clinicid], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rowCount === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(`Clinic id ${clinicid} data deleted`);
      res.send(`Clinic id ${clinicid} data deleted successfully`);
    }
  });
};


// exports.toggleClinicStatus = (req, res) => {
//   const { clinicId } = req.params;
//   const { clinicStatus } = req.body;

//   const update_status_query = `
//     UPDATE public.clinics 
//     SET "clinicStatus" = $1 
//     WHERE "clinicId" = $2
//   `;

//   con.query(update_status_query, [clinicStatus, clinicId], (err, result) => {
//     if (err) {
//       console.error('Status Update Error:', err);
//       res.status(500).send({ error: err.message });
//     } else if (result.rowCount === 0) {
//       res.status(404).send({ message: 'Clinic not found' });
//     } else {
//       console.log(`Clinic id ${clinicId} status updated to ${clinicStatus}`);
//       res.send({ message: `Clinic id ${clinicId} status updated successfully` });
//     }
//   });
// };

exports.toggleClinicStatus = async (req, res) => {
  const { clinicid } = req.params;
  const { clinicStatus } = req.body;

  const updateStatusQuery = `
    UPDATE public.clinics 
    SET "clinicStatus" = $1 
    WHERE "clinicid" = $2
    RETURNING "clinicname", "clinicEmail";
  `;

  try {
    // Update the clinic status and retrieve clinic details
    const result = await con.query(updateStatusQuery, [clinicStatus, clinicid]);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Clinic not found' });
    }

    const { clinicname, clinicEmail } = result.rows[0];
    console.log(`Clinic id ${clinicid} status updated to ${clinicStatus}`);

    // Prepare the email details
    const subject = clinicStatus === 'active'
      ? 'Your Clinic is Now Active!'
      : 'Your Clinic Has Been Deactivated';
    const html = clinicStatus === 'active'
      ? `
         <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #4caf50; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1>Welcome to Our Network!</h1>
          </div>
          <div style="padding: 20px; background-color: #f4f4f9;">
            <h2 style="color: #4caf50;">Hello ${clinicname},</h2>
            <p>We're thrilled to have you on board! Your clinic has been <strong>successfully activated</strong>. You can now access all features of our system and start streamlining your clinic's operations.</p>
            <p><strong>What’s next?</strong></p>
            <ul style="list-style-type: circle; margin-left: 20px;">
            <li>SignUp as Admin in your Clinic</li>
              <li>Log in to your account</li>
              <li>Add and manage your staff</li>
            </ul>
            <p style="margin: 20px 0;">
              <a href="http://139.84.235.68/register/staff/${clinicid}" target="_blank" style="background-color: #4caf50; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block;">SignUp in to your Clinic</a>
            </p>
            <p>If you need any assistance, feel free to reach out to our support team.</p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #777; padding: 10px;">
            Thank you for choosing our platform. Together, we’ll make healthcare management seamless and efficient!
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f44336; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1>Important Notice</h1>
          </div>
          <div style="padding: 20px; background-color: #f4f4f9;">
            <h2 style="color: #f44336;">Hello ${clinicname},</h2>
            <p>Your clinic has been <strong>deactivated</strong>. This means you no longer have access to our system's features.</p>
            <p>If you believe this was done in error or you’d like to reactivate your clinic, please get in touch with our support team as soon as possible.</p>
            <p style="margin: 20px 0;">
              <a href="mailto:support@yourplatform.com" style="background-color: #f44336; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block;">Contact Support</a>
            </p>
            <p>We’re here to help and look forward to assisting you.</p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #777; padding: 10px;">
            Thank you for being part of our network. We hope to assist you again soon!
          </div>
        </div>
      `;

    // Send the email asynchronously
    await sendEmail(clinicEmail, subject, html);

    res.send({
      message: `Clinic id ${clinicid} status updated to ${clinicStatus} and email sent successfully.`,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Internal Server Error', details: err });
  }
};


exports.getTotalClinicsCount = async (req, res) => {
  try {
    // SQL query to count the total number of clinics
    const countQuery = `SELECT COUNT(*) AS total FROM public.clinics`;

    // Execute the query
    con.query(countQuery, (err, result) => {
      if (err) {
        console.error('Error while counting clinics:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err });
      }

      // Extract the total count from the result
      const totalClinics = result.rows[0].total;
      return res.json({ totalClinics });
    });
  } catch (err) {
    console.error('Error in getTotalClinicsCount:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err });
  }
};

exports.getCliniccounter = async (req, res) => {
  try {
    const get_query = `
      SELECT 
        c."clinicid", 
        c."clinicname", 
        c."clinicplan", 
        COUNT(co."clinic_id") AS "counter_count"
      FROM public.clinics c
      LEFT JOIN public.counter co ON co."clinic_id" = c."clinicid"
      GROUP BY c."clinicid", c."clinicname", c."clinicplan"
      ORDER BY c."clinicid" DESC
      LIMIT 100
    `;

    con.query(get_query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        const clinicsWithMessages = result.rows.map(clinic => {
          const counterCount = parseInt(clinic.counter_count, 10);

          return {
            clinicid: clinic.clinicid,
            clinicname: clinic.clinicname,
            clinicplan: clinic.clinicplan,
            counter_count: counterCount,
            counter_message: counterCount === 0 ? 'No Counter Available' : 'Counter Available',
            counter_color: counterCount === 0 ? 'red' : 'green'
          };
        });

        // Return the clinics data with the counter message
        return res.json({ clinics: clinicsWithMessages });
      }
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send({ error: 'Internal Server Error', details: err });
  }
};


exports.getClinicLogo = (req, res) => {
  const filename = sanitize(req.params.filename);
  const logoPath = path.join(__dirname, '../uploads/clinicUploads', filename);

  fs.access(logoPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ error: 'Not Found', message: 'Logo not found.' });
    }

    res.sendFile(logoPath);
  });
};

exports.getPharmacycounter = async (req, res) => {
  try {
    const get_query = `
  SELECT 
    c."clinicid", 
    c."clinicname", 
    c."clinicplan", 
    COUNT(co."clinic_id") AS "counter_count"
  FROM public.clinics c
  LEFT JOIN public.counter co ON co."clinic_id" = c."clinicid"
  WHERE co."counterstatus" = 'Active' 
    AND co."countertype" = 'Pharmacy'
  GROUP BY c."clinicid", c."clinicname", c."clinicplan"
  ORDER BY c."clinicid" DESC
  LIMIT 100`;



    con.query(get_query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        const clinicsWithMessages = result.rows.map(clinic => {
          const counterCount = parseInt(clinic.counter_count, 10);

          return {
            clinicid: clinic.clinicid,
            clinicname: clinic.clinicname,
            clinicplan: clinic.clinicplan,
            counter_count: counterCount,
            counter_message: counterCount === 0 ? 'No Counter Available' : 'Counter Available',
            counter_color: counterCount === 0 ? 'red' : 'green'
          };
        });

        // Return the clinics data with the counter message
        return res.json({ clinics: clinicsWithMessages });
      }
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send({ error: 'Internal Server Error', details: err });
  }
};



