import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserDBModel from '../models/UserDB.model';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'default_jwt_secret';

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const existingUser = await UserDBModel.query().findOne({ email }).select('id');
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await UserDBModel.query().insert({
            email,
            password: passwordHash
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Registration failed.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body as { email?: string; password?: string };
        console.log('🚀 ~ auth.ts:39 ~ email:', email);
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await UserDBModel.query().findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Authentication failed.' });
    }
});

export { router as authRouter };
