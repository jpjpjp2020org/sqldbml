import 'dotenv/config';
import pool from '../pool.js';
import toCamelCase from './utils/to_camel_case.js';

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

    static async findById() {

    }

    static async insert() {

    }

    static async update() {

    }

    static async delete() {

    }

}

export default UserRepo;
