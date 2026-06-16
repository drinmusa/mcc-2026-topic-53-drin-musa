import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserDBModel from '../models/UserDB.model';

const JWT_SECRET = process.env.JWT_SECRET ?? 'default_jwt_secret';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing.' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await UserDBModel.query().findById(payload.userId).select('id', 'email');
        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}
