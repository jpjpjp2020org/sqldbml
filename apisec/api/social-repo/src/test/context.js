import 'dotenv/config';
import { randomBytes } from 'crypto';
import migrate from 'node-pg-migrate';
import format from 'pg-format';
import pool from '../pool.js';

class Context {

    static async build() {

        try {

            // randomy generating a role name to connect to pg
            // needs to start with a letter in this use case
            const roleName = 'a' + randomBytes(4).toString('hex');

            // connect to pg
            // need await not return hereand for all async ops.
            await pool.connect({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_DATABASE,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });

            // create a new role

            await pool.query(format(
                'CREATE ROLE %I WITH LOGIN PASSWORD %L;',  roleName, roleName
            ));

            // create a schema with the same name

            await pool.query(format(
                'CREATE SCHEMA %I AUTHORIZATION %I;', roleName, roleName
            ));

            // disconnect from pg

            await pool.close();

            // running migrations in the new schema

            await migrate({
                schema: roleName,
                direction: 'up',
                log: () => {},
                noLock: true,
                dir: 'migrations',
                databaseUrl: {
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    database: process.env.DB_DATABASE,
                    user: roleName,
                    password: roleName
                }
            });

            // connect to pg with the new role

            await pool.connect({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_DATABASE,
                user: roleName,
                password: roleName
            });

            return new Context(roleName);

        } catch (err) {
            console.error('Error during context build:', err);
            await pool.close(); 
            throw err;
        }

    }

    constructor(roleName) {
        this.roleName = roleName;
    }

    async reset() {

        return pool.query(`
            DELETE FROM users;
        `);

    }

    async close() {

        try {
            await pool.close();
            await pool.connect({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_DATABASE,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });

            await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
            await pool.query(format('DROP ROLE %I CASCADE;', this.roleName));

            await pool.close();
        } catch (err) {
            console.error('Error during context close:', err);
            throw err;
        }

    }
    
}

export default Context