import bcrypt from 'bcryptjs';

/**
 * Util to hash a password
 * @param {string} pwd - the password to be hashed
 * @returns {Promise} - Returns a string on promise resolve
 */
export const hashPassword = async (pwd: string): Promise<string> => bcrypt.hash(pwd, 10);
