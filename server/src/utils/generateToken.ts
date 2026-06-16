import crypto from 'crypto';
export const generateResetToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex'); // Generates a random hex token
};
