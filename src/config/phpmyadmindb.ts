// db.js
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Connect to the database
connection.connect((err: any) => {
    if (err) {
        console.error('error connecting to database: ' + err.stack);
        return;
    }
    console.log('connected to database as id ' + connection.threadId);
});

module.exports = connection;