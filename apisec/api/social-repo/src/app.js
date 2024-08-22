import express from 'express';
// const usersRouter = require('./routes/users')
import usersRouter from './routes/users.js'; // ES needs .js specified

export default () => {
    const app = express();

    app.use(express.json());
    app.use(usersRouter);

    return app;
};