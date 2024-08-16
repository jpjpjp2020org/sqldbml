// require('dotenv').config();
import 'dotenv/config'; // ES Module syntax

import express, { urlencoded } from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const app = express();
app.use(urlencoded({ extended: true}));

app.get('/posts', async (req, res) => {
    
    const { rows } = await pool.query(`
        SELECT *
        FROM posts;
    `)

    // mock data without pg connection
    // const rows = [
    //     { id: 1, lng: 40.7128, lat: -74.0060 },
    //     { id: 2, lng: 34.0522, lat: -118.2437 },
    //     { id: 3, lng: 51.5074, lat: -0.1278 },
    // ];

    res.send(`
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>lng</th>
                    <th>lat</th>
                </tr>
            </thead>

            <tbody>
                ${rows.map(row => {
                    return `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.loc.x}</td>
                            <td>${row.loc.y}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>

        </table>

        <form method="POST">
            <h3>Create a post</h3>
            <div>
                <label>Lng</label>
                <input name="lng">
            </div>
            <div>
                <label>Lat</label>
                <input name="lat">
            </div>

            <button type="submit">Create</button>
        </form>
    `)

});

app.post('/posts', async (req, res) => {
    const { lng, lat } = req.body;

    await pool.query(
        'INSERT INTO posts (loc) VALUES ($1);',
        [`(${lng},${lat})`]
    );

    res.redirect('/posts');
});

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});

// pool.query('SELECT 1 + 1;').then((res) => console.log(res));