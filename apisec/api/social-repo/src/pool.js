// import { Pool as _Pool } from 'pg'; // will not wirth with ES.

import pkg from 'pg';

const { Pool: _Pool } = pkg;

class Pool {
    _pool = null;

    connect(options) {
       this._pool = new _Pool(options);
        // test connection simple query.
       return this._pool.query('SELECT 1 + 1;');
    }

    close() {
        return this._pool.end();
    }

    // VERY INSECURE, but for examples
    query(sql) {
        return this._pool.query(sql);
    }
}

export default new Pool;


// difficult to connect to multple dbs:
// const pg = require('pg');

// const pool = new pg.Pool({
//     host: 'localhost',
//     port: 5432
// });

// module.exports= pool;