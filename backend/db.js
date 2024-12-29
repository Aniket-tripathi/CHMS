// db.js
const { Client } = require('pg');

const con = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "root",
    database: "cot",
});

con.connect().then(() => console.log("Connected Successfully With Database"));

module.exports = con;


// Export Database
// pg_dump -U postgres -h localhost -p 5432 -d demopost -f "C:\Users\dww\Desktop\new.sql"

//Create DATABASE
// createdb -U postgres -h localhost -p 5432 newdb  

// Import Database
// psql -U postgres -h localhost -p 5432 -d avdb -f "C:\Users\dww\Desktop\new.sql"




