import 'dotenv/config';
import app from './src/app.js';
import pool from './src/pool.js';

// test
// Log environment variables to check
// console.log("Database Configurations:");
// console.log("Host:", process.env.DB_HOST);
// console.log("Port:", process.env.DB_PORT);
// console.log("Database:", process.env.DB_DATABASE);
// console.log("User:", process.env.DB_USER);
// console.log("Password:", process.env.DB_PASSWORD);

// connection would actually happen when client is created
pool.connect({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})
    .then (() => {
        app().listen(3002, () => {
            console.log('Server is running on port 3002');
        });
    })
    .catch ((err) => console.error(err));

