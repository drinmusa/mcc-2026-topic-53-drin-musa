import jwt, { Algorithm, SignOptions } from 'jsonwebtoken';

// configs
import { JWT_ALGORITHM, JWT_EXPIRES_IN, JWT_SECRET } from '../config/jwt';

// models

/**
 * Generates a JWT for the given user.
 * @param user - The user object.
 * @returns The signed JWT.
 */
// export const generateJWT = (user: UserDBModel) => {
export const generateJWT = (user: { id: number; email: string }) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const payload = {
        userId: user.id,
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
        algorithm: JWT_ALGORITHM as Algorithm
    });
};

/**
 * Verifies a JWT and returns the decoded payload.
 * @param token - The JWT to verify.
 * @returns The decoded payload or throws an error if invalid.
 */
