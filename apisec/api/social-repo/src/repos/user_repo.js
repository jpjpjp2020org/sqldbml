import 'dotenv/config';
import pool from '../pool.js';
import toCamelCase from './utils/to_camel_case.js';

// user input should never end up directly in a SQL query.
// prepared statements with pg and PREPARE to sanitize.

class UserRepo {

    static async find() {

        // const result = await pool.query('SELECT * FROM users;');
        const { rows } = await pool.query('SELECT * FROM users;');

        // case fixing example (like created_at in psql):
        // can log values in debugging vs return toCamelCase(rows);
        const parsedRows = toCamelCase(rows);

        // result.rows // date from SQL query is in the rows.
        return parsedRows;
    }

    static async findById(id) {

        // NB - bellow allows direct SQL injection:

        // const { rows } = await pool.query(`
        //     SELECT * FROM users WHERE id = ${id};
        // `);

        // const parsedIdRows = toCamelCase(rows);

        // return parsedIdRows[0];

        // // http://localhost:3002/users/1 - postman GET

        const { rows } = await pool.query('SELECT * FROM users where id = $1;', [id]);

        const parsedIdRows = toCamelCase(rows);

        return parsedIdRows[0];

    }

    static async insert(username, bio) {

        // with conf return
        const { rows } =  await pool.query(   
            'INSERT INTO users (username, bio) VALUES ($1, $2) RETURNING *;', 
            [username, bio]
        );

        const parsedIndRows = toCamelCase(rows);

        return parsedIndRows[0];

    }

    // v or
    static async update(id, username, bio) {

        const { rows } =  await pool.query(   
            'UPDATE users SET username = $1, bio = $2 WHERE id = $3 RETURNING *;', 
            [username, bio, id]
        );

        const parsedPutRows = toCamelCase(rows);

        return parsedPutRows[0];

    }

    static async delete(id) {

        const { rows } = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *;', [id]
        );

        const parsedDelRows = toCamelCase(rows);

        return parsedDelRows[0];

    }

}

export default UserRepo;
