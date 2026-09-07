import dotenv from 'dotenv';
import mysql from 'mysql2';

// Load environment variables from the .env file
dotenv.config();

// Create a connection to the database using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'), // Parse port to integer with default fallback
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to the database with error handling
connection.connect((err: mysql.QueryError | null) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as ID ' + connection.threadId);
});

export default connection;
