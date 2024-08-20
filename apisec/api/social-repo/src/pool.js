import { Pool as _Pool } from 'pg';

class Pool {
    _pool = null;

    connect(options) {
       this._pool = new _Pool(options)
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