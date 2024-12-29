const con = require('../db');



exports.insertCounter = (req, res) => {
  const {
    clinic_id,
    stream_id,
    countername,
    countertype,
    current_token = '',  // Default to empty string if not provided
    current_tokenid = null,  // Default to null if not provided
    current_token_status = '',  // Default to empty string if not provided
  } = req.body;

  // Check if the counter already exists for this clinic, stream, and counter type
  const checkQuery = `
    SELECT COUNT(*) AS count
    FROM counter
    WHERE clinic_id = $1 AND stream_id = $2 AND countertype = $3
  `;

  con.query(checkQuery, [clinic_id, stream_id, countertype], (err, result) => {
    if (err) {
      console.error("Error checking counter existence:", err);
      return res.status(500).send(err);  // Return an error if query fails
    }

    // If a counter already exists, send an error response
    if (result.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Counter already exists for this Clinic, under this Stream and Counter Type.'
      });
    }

    // If no existing counter, proceed with insertion
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

    const counterdesc = countername;
    const time = `${southAfricaTime[4].value}:${southAfricaTime[6].value}:${southAfricaTime[8].value}`;
    const date = `${southAfricaTime[4].value.padStart(2, '0')}-${southAfricaTime[2].value.padStart(2, '0')}-${southAfricaTime[0].value}`;
    const added_by = 'Admin';
    const counterstatus = 'Active';

    const insertQuery = `
      INSERT INTO counter (
        clinic_id, stream_id, current_token, current_tokenid, current_token_status, 
        countername, countertype, counterdesc, counterstatus, added_by, date, time
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    con.query(insertQuery, [
      clinic_id, stream_id, current_token, current_tokenid, current_token_status,
      countername, countertype, counterdesc, counterstatus, added_by, date, time
    ], (err, result) => {
      if (err) {
        console.error("Error inserting counter:", err);
        return res.status(500).send(err);  // Return an error if insertion fails
      }

      console.log("Insert Result:", result);
      return res.status(200).json({
        success: true,
        message: "Counter Added Successfully"
      });
    });
  });
};






// Function to get all data
exports.getCounter = (req, res) => {
  const get_query = `
    SELECT 
      counter.*, 
      clinics.clinicname, 
      classification.classification
    FROM 
      public.counter
    INNER JOIN 
      public.clinics 
    ON 
      clinics.clinicid = counter.clinic_id
    LEFT JOIN 
      public.classification 
    ON 
      counter.stream_id = classification.id
  `;

  con.query(get_query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result.rows);
      res.json({ counters: result.rows });
    }
  });
};


// Function to get data by ID
exports.getCounterById = (req, res) => {
  const { id } = req.params;
  const get_query = 'SELECT * FROM public.counter WHERE id = $1';

  con.query(get_query, [id], (err, result) => {
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


// Function to update counter
exports.updateCounter = (req, res) => {
  const { id } = req.params;
  const { clinic_id, stream_id, current_token, current_tokenid, current_token_status, countername, countertype, counterdesc, counterstatus, added_by, date, time } = req.body;

  const update_query = `
    UPDATE public.counter 
    SET  
      clinic_id = $1, 
      stream_id = $2, 
      current_token = $3, 
      current_tokenid = $4, 
      current_token_status = $5, 
      countername = $6, 
      countertype = $7, 
      counterdesc = $8, 
      counterstatus = $9, 
      added_by = $10, 
      "date" = $11, 
      "time" = $12 
    WHERE id = $13`;

  con.query(update_query, [
    clinic_id, stream_id, current_token, current_tokenid,
    current_token_status, countername, countertype,
    counterdesc, counterstatus, added_by, date, time, id
  ], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rowCount === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(`Counter id ${id} updated`);
      res.send(`Counter id ${id} updated successfully`);
    }
  });
};


// Function to delete data by ID
exports.deleteCounter = (req, res) => {
  const { id } = req.params;
  const delete_query = 'DELETE FROM public.counter WHERE id = $1';

  con.query(delete_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rowCount === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(`Counter id ${id} deleted`);
      res.send(`Counter id ${id} deleted successfully`);
    }
  });
};


exports.getCounterByClinic = (req, res) => {
  const { id } = req.params;
  const get_query = `
  SELECT 
    c.*, 
    cl.clinicname 
  FROM 
    public.counter c 
  JOIN 
    public.clinics cl 
  ON 
    c.clinic_id = cl.clinicid 
  WHERE 
    c.clinic_id = $1
    AND c.countertype = 'Clinic'
`;


  con.query(get_query, [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.rows.length === 0) {
      res.status(404).send("Record not found");
    } else {
      console.log(result.rows);
      res.json({ counters: result.rows });

    }
  });
};

exports.CheckCounterByClinic = (req, res) => {
  const { id } = req.params;
  const check_query = "SELECT COUNT(*) AS counter_count FROM public.counter WHERE clinic_id = $1 AND counterstatus = $2 AND countertype = 'Clinic';";

  con.query(check_query, [id, 'Active'], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const counterCount = parseInt(result.rows[0].counter_count, 10);
      if (counterCount > 0) {
        res.json({
          message: `${counterCount} Active counters exist for this clinic`,
          hasCounters: true,
          counterCount: counterCount,
          color: string = "green",
          button: string = "enabled",
        });
      } else {
        res.json({
          message: "No active counters found for this clinic",
          hasCounters: false,
          counterCount: 0,
          color: string = "red",
          button: string = "disabled",
        });
      }
    }
  });
};
