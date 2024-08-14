require('dotenv').config();

const express = require('express');
const pg = require('pg');

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const app = express();

app.get('/', (req, res) => {
    pool.query('SELECT NOW()', (err, result) => {
        if (err) {
            return res.status(500).send('db error');
        }
        res.send(`db connected. Current time: ${result.rows[0].now}`);
    });
});

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});

// pool.query('SELECT 1 + 1;').then((res) => console.log(res));