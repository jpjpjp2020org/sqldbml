import express from 'express';
// const usersRouter = require('./routes/users')
import usersRouter from './routes/users'; // ES

export default () => {
    const app = express();

    app.use(express,json());
    app.use(usersRouter);

    return app;
};