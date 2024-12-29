const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const con = require('../db');

// JWT Secret Key (use an environment variable in production)
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong secret

// Login API with JWT
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check `superadmin` table first
  const superadminQuery = 'SELECT * FROM public.superadmin WHERE email = $1';
  con.query(superadminQuery, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (result.rows.length > 0) {
      // Found in `superadmin` table
      const user = result.rows[0];

      // Compare password with stored hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: 'Error comparing passwords', error: err });
        }

        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: 'superadmin' },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        // Respond with token and user details
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            fname: user.fname,
            lname: user.lname,
            role: 'superadmin',
            staffType: 'superadmin'
          },
        });
      });
    } else {
      // Check `staff` table
      const staffQuery = `
      SELECT 
        s.*, 
        c."clinicname",  
        c."clinicLogo"  
      FROM public.staff s
      LEFT JOIN public.clinics c ON s."clinicId" = c."clinicid"
      WHERE s.email = $1
    `;
      con.query(staffQuery, [email], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare password with stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(500).json({ message: 'Error comparing passwords', error: err });
          }

          if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          // Create JWT token
          const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, roleid: user.roleid, clinicId: user.clinicId, clinicLogo: user.clinicLogo, staffType: user.staffType, },
            JWT_SECRET,
            { expiresIn: '1h' }
          );

          // Respond with token and user details
          return res.json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              email: user.email,
              fname: user.fname,
              lname: user.lname,
              clinicId: user.clinicId,
              clinicLogo: user.clinicLogo,
              clinicname: user.clinicname,
              staffType: user.staffType,
              roleid: user.roleid,
            },
          });
        });
      });
    }
  });
};













// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const con = require('../db');

// // JWT Secret Key (make sure to use an environment variable for production)
// const JWT_SECRET = 'your_jwt_secret_key'; // Change this to a strong secret

// // Login API with JWT
// exports.login = (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Username and password are required' });
//   }

//   const get_query = 'SELECT * FROM public.superadmin WHERE email = $1';

//   con.query(get_query, [email], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Database error', error: err });
//     }

//     if (result.rows.length === 0) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     const user = result.rows[0];

//     // Compare the entered password with the stored hashed password
//     bcrypt.compare(password, user.password, (err, isMatch) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error comparing passwords', error: err });
//       }

//       if (!isMatch) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//       }

//       // Create a JWT token if the password matches
//       const token = jwt.sign(
//         { id: user.id, email: user.email }, // payload
//         JWT_SECRET, // secret key
//         { expiresIn: '1h' } // expires in 1 hour
//       );

//       // Send the response with the token and user details
//       res.json({
//         message: 'Login successful',
//         token,  // Token is included in the response
//         user: {
//           id: user.id,
//           email: user.email,
//           fname: user.fname,
//           lname: user.lname,
//         },
//       });
//     });
//   });
// };
