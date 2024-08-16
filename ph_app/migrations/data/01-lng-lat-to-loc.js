import 'dotenv/config';

import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.query(`
    UPDATE posts
    SET loc = POINT(lng, lat)
    WHERE loc IS NULL;
`)
    .then(() => {
        console.log('Update done');
        pool.end();
    })
    .catch((err) => console.error(err.message));