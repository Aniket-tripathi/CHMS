const con = require('../db');

// Function to insert data
exports.insertUser = (req, res) => {
 const { name } = req.body;
 const insert_query = 'INSERT INTO demotable(name) VALUES ($1)';

 con.query(insert_query, [name], (err, result) => {
  if (err) {
   res.status(500).send(err);
  } else {
   console.log(result);
   res.send("User Added Successfully!");
  }
 });
};

// Function to get all data
exports.getUser = (req, res) => {
 const get_query = 'SELECT * FROM public.demotable';

 con.query(get_query, (err, result) => {
  if (err) {
   res.status(500).send(err);
  } else {
   console.log(result.rows);
   res.json(result.rows);
  }
 });
};

// Function to get data by ID
exports.getUserById = (req, res) => {
 const { id } = req.params;
 const get_query = 'SELECT * FROM public.demotable WHERE id = $1';

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

// Function to update data by ID
exports.updateUser = (req, res) => {
 const { id } = req.params;
 const { name } = req.body;
 const update_query = 'UPDATE public.demotable SET name = $1 WHERE id = $2';

 con.query(update_query, [name, id], (err, result) => {
  if (err) {
   res.status(500).send(err);
  } else if (result.rowCount === 0) {
   res.status(404).send("Record not found");
  } else {
   console.log(`User id ${id} updated`);
   res.send(`User id ${id} updated successfully`);
  }
 });
};

// Function to delete data by ID
exports.deleteUser = (req, res) => {
 const { id } = req.params;
 const delete_query = 'DELETE FROM public.demotable WHERE id = $1';

 con.query(delete_query, [id], (err, result) => {
  if (err) {
   res.status(500).send(err);
  } else if (result.rowCount === 0) {
   res.status(404).send("Record not found");
  } else {
   console.log(`User id ${id} deleted`);
   res.send(`User id ${id} deleted successfully`);
  }
 });
};
