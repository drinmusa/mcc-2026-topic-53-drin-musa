import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { UserModel } from '../interfaces/models';

export const verifyToken = (token: string): Partial<UserModel> | null => {
    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded.userId) return null;

        return {
            id: decoded.userId,
            company_id: decoded.company_id,
            role: decoded.role
        };
    } catch (error) {
        return null;
    }
};
