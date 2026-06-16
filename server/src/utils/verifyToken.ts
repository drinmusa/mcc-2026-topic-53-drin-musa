import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { UserModel } from '../interfaces/models'; // adjust the path

export const verifyToken = (token: string): Partial<UserModel> | null => {
    try {
        // return jwt.verify(token, JWT_SECRET) as Partial<UserModel>;
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded.userId) return null; // Ensure userId exists in payload

        return { id: decoded.userId, company_id: decoded.company_id, role: decoded.role }; // Adjust based on your JWT structure
    } catch (error) {
        return null; // Token is invalid or expired
    }
};
