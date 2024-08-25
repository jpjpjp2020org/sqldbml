import { Router } from 'express';
import UserRepo from '../repos/user_repo.js'; // ES needs extsnesion!!!

const router = Router();

router.get('/users', async (req, res) => {

    const users = await UserRepo.find();

    res.send(users);

});

router.get('/users/:id', async (req, res) => {});

router.post('/users', async (req, res) => {});

router.post('/users/:id', async (req, res) => {});

router.put('/users/:id', async (req, res) => {});

export default router; // ES module