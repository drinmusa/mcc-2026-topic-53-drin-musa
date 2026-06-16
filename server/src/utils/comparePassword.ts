import bcrypt from 'bcrypt';

/**
 * Util to compare a hash password with a normal one
 * @param {string} pwd - A non hashed password to be compared against
 * @param {string} hashedPwd - A hashed password to be used as comparator
 * @returns {Promise<boolean>} Promise - Returns a boolean value on promise resolve
 */

export const comparePassword = async (pwd: string, hashedPwd: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
        try {
            resolve(bcrypt.compareSync(pwd, hashedPwd));
        } catch (e) {
            reject(e);
        }
    });
