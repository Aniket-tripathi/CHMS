const { Client } = require('pg');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require('./Routes/routes.js');
const con = require('./db');  // Import the database connection
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);


app.get('/', (req, res) => {
    res.send('Welcome To World!!');
});

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

app.listen(PORT, () => {
    console.log("Server is running on PORT 3000");
});
