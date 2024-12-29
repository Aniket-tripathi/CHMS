const con = require('../db');
const bcrypt = require('bcrypt');
const { sendEmail } = require("../Utils/email.js");
// const redisClient = require('../redis.js')

exports.insertStaff = async (req, res) => {
  const {
    fname,
    lname,
    gender,
    username,
    email,
    password,
    clinicId,
    roleid,
    desgid,
    deptId,
    dob,
    doj,
    maritalstatus,
    province,
    district,
    subdistrict,
    qualification,
    sancno,
    hpcsano,
    contactno,
    profileimg,
    address,
    level,
    added_by,
    employmentStatus,
    staffType
  } = req.body;

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

  const adddate = `${southAfricaTime[4].value.padStart(2, '0')}-${southAfricaTime[2].value.padStart(2, '0')}-${southAfricaTime[0].value}`;
  const addtime = `${southAfricaTime[6].value}:${southAfricaTime[8].value}:${southAfricaTime[10].value}`;
  const status = 'inactive';

  // Check if staffEmail already exists
  const emailCheckQuery = `SELECT * FROM staff WHERE "email" = $1`;

  try {
    const emailCheckResult = await con.query(emailCheckQuery, [email]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).send({
        error: 'Conflict',
        message: 'A Staff with this email already exists.'
      });
    }

    // Hash the password before inserting
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // If email is unique, insert the new clinic
    const insertQuery = `
      INSERT INTO staff(
        "fname", "lname", "gender", "username", 
        "email", "password", "clinicId", roleid, 
        desgid, "deptId", "dob", "doj", "maritalstatus", "province",
        "district", "subdistrict", "qualification", "sancno", "hpcsano",
        "contactno", "profileimg", "address", "level", "added_by", "employmentStatus", "staffType",
         "adddate", "addtime", "status"  
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
       $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *;
    `;

    const insertResult = await con.query(insertQuery, [
      fname,
      lname,
      gender,
      username,
      email,
      hashedPassword,
      clinicId,
      roleid,
      desgid,
      deptId,
      dob,
      doj,
      maritalstatus,
      province,
      district,
      subdistrict,
      qualification,
      sancno,
      hpcsano,
      contactno,
      profileimg,
      address,
      level,
      added_by,
      employmentStatus,
      staffType,
      adddate,
      addtime,
      status
    ]);

    console.log('Database Insertion Result:', insertResult.rows[0]);

    // Send email in parallel (without blocking database insertion)
    const subject = 'Welcome to Our Clinic';
    const html = ` <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    h1 {
      color: #007bff;
      font-size: 22px;
      text-align: center;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
    }
    ul {
      padding: 0;
      margin: 10px 0;
      list-style: none;
    }
    ul li {
      margin: 5px 0;
      padding: 8px;
      background: #f1f1f1;
      border-radius: 3px;
    }
    .cta {
      text-align: center;
      margin: 20px 0;
    }
    .cta a {
      text-decoration: none;
      color: #fff;
      background-color: #007bff;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 14px;
    }
    .cta a:hover {
      background-color: #0056b3;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome, ${fname}!</h1>
    <p>We’re thrilled to have you on board. Here are your registration details:</p>
    <ul>
      <li><b>Name:</b> ${fname} ${lname}</li>
      <li><b>Email:</b> ${email}</li>
      <li><b>Gender:</b> ${gender}</li>
      <li><b>Registration Date & Time:</b> ${adddate} ${addtime}</li>
    </ul>
    <p>If you have any questions, don’t hesitate to contact us. We’re here to help!</p>
    <div class="cta">
      <a href="http://139.84.235.68/login" target="_blank">Login to Your Account</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Clinic. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

    // Sending the email asynchronously
    const sendEmailPromise = sendEmail(email, subject, html);

    // Wait for both the insert result and email sending to complete
    await Promise.all([sendEmailPromise]);

    res.status(201).send({
      message: 'Clinic data inserted successfully, and email sent!',
      data: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Error:', err);

    if (err.code === '23505') { // Unique constraint violation error code
      res.status(409).send({
        error: 'Conflict',
        message: 'A Staff with this email already exists.'
      });
    } else {
      res.status(500).send({
        error: 'Internal Server Error',
        details: err
      });
    }
  }
};

exports.checkEmailAvailabilitystaff = async (req, res) => {
  const { email } = req.body;

  // Query to check if the email already exists in the database
  const emailCheckQuery = `SELECT * FROM staff WHERE "email" = $1`;

  try {
    const emailCheckResult = await con.query(emailCheckQuery, [email]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).send({
        error: 'Conflict',
        message: 'A staff with this email already exists.'
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



exports.getstaff = (req, res) => {
  const { type, userid, clinicid } = req.query;

  try {
    let get_query = `
                          SELECT s.*, c.*
                          FROM public.staff s
                          LEFT JOIN public.clinics c ON s."clinicId" = c."clinicid"
                       `;
    if (type === "superadmin") {
      get_query += " ORDER BY s.id DESC;";
    } else if (type === "cadmin") {
      get_query += ` WHERE s."clinicId" = '${clinicid}' ORDER BY s.id DESC;`;
    } else if (type === "cstaff") {
      get_query = " ";
    } else {
      get_query = "";
    }

    con.query(get_query, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Database query failed', details: err });
      }
      console.log('Query result:', result.rows);
      return res.json({ staff: result.rows });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err });
  }
};


exports.getTotalStaffCount = async (req, res) => {
  try {
    // SQL query to count the total number of clinics
    const countQuery = `SELECT COUNT(*) AS total FROM public.staff`;

    // Execute the query
    con.query(countQuery, (err, result) => {
      if (err) {
        console.error('Error while counting staff:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err });
      }

      // Extract the total count from the result
      const totalStaff = result.rows[0].total;
      return res.json({ totalStaff });
    });
  } catch (err) {
    console.error('Error in getTotalstaffCount:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err });
  }
};

exports.togglestaffStatus = async (req, res) => {
  const { staffid } = req.params;
  const { status } = req.body;

  const updateStatusQuery = `
    UPDATE public.staff 
    SET "status" = $1 
    WHERE "id" = $2
    RETURNING "username", "email";
  `;

  try {
    // Update the staff status and retrieve staff details
    const result = await con.query(updateStatusQuery, [status, staffid]);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Staff not found' });
    }

    const { username, email } = result.rows[0];

    console.log(`Staff ID ${staffid} status updated to ${status}`);

    // Immediately respond to the client
    res.send({
      message: `Staff ID ${staffid} status updated to ${status}. Email will be sent shortly.`,
    });

    // Prepare the email details
    const subject =
      status === 'active'
        ? 'Your Account is Now Active!'
        : 'Your Account Has Been Deactivated';

    const html =
      status === 'active'
        ? `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="background-color: #4caf50; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1>Welcome Back!</h1>
            </div>
            <div style="padding: 20px; background-color: #f4f4f9;">
              <h2 style="color: #4caf50;">Hello ${username},</h2>
              <p>Your account has been <strong>activated</strong>. You can now access all features of our system and start your tasks.</p>
              <p style="margin: 20px 0;">
                <a href="http://139.84.235.68/login" target="_blank" style="background-color: #4caf50; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block;">Login to Your Account</a>
              </p>
              <p>If you need any assistance, feel free to reach out to our support team.</p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #777; padding: 10px;">
              Thank you for being part of our team. Let’s achieve great things together!
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="background-color: #f44336; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1>Important Notice</h1>
            </div>
            <div style="padding: 20px; background-color: #f4f4f9;">
              <h2 style="color: #f44336;">Hello ${username},</h2>
              <p>Your account has been <strong>deactivated</strong>. You no longer have access to the system.</p>
              <p>If you believe this was done in error or require further clarification, please contact support.</p>
              <p style="margin: 20px 0;">
                <a href="mailto:support@yourplatform.com" style="background-color: #f44336; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block;">Contact Support</a>
              </p>
              <p>We’re here to assist you.</p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #777; padding: 10px;">
              Thank you for your time with us. We hope to work with you again in the future.
            </div>
          </div>
        `;

    // Send the email asynchronously
    sendEmail(email, subject, html).catch((err) =>
      console.error('Error sending email:', err)
    );
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Internal Server Error', details: err });
  }
};


exports.getstaffById = (req, res) => {
  // Extract the staff ID from the URL parameter
  const { id } = req.params;

  // Define the SQL query to get staff details along with related data
  const get_query = `
  SELECT 
    staff.*,  -- Fetch all columns from the staff table
    designation.designation,
    department.deptname,
    clinics.clinicname,
    roles.rolename
  FROM 
    public.staff AS staff
  LEFT JOIN 
    public.designation AS designation ON staff.desgid = designation.id
  LEFT JOIN 
    public.department AS department ON staff."deptId" = department.id  -- Check if 'deptId' is the correct column (quotes for case-sensitive)
  LEFT JOIN 
    public.clinics AS clinics ON staff."clinicId" = clinics.clinicid  -- Use "clinicId" (quoted)
  LEFT JOIN 
    public.roles AS roles ON staff.roleid = roles.roleid
  WHERE 
    staff.id = $1;  -- Filter by staff ID
  `;

  // Execute the query
  con.query(get_query, [id], (err, result) => {
    if (err) {
      // Log the error and send a 500 response if there is a database error
      console.error('Database error:', err);
      res.status(500).send({ error: 'Internal server error' });
    } else if (result.rows.length === 0) {
      // If no rows were returned, the staff record was not found
      res.status(404).send({ message: 'Record not found' });
    } else {
      // If a record is found, return the result in the response
      res.json({ staffs: result.rows[0] });
    }
  });
};





