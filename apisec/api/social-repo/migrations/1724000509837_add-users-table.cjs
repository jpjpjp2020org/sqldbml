/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.sql(`

        -- drop existing tables
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS posts;

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            bio VARCHAR(400),
            username VARCHAR(30) NOT NULL
        );
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP TABLE users;

        -- recreate comments table
        CREATE TABLE comments (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            body VARCHAR(240) NOT NULL
        );

        -- recreate posts table
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            url VARCHAR(300),
            loc POINT
        );
    `);
};
