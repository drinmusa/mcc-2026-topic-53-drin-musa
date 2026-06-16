export const generateRandomPassword = (length = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    return [...Array(length)].map(() => charset.charAt(Math.floor(Math.random() * charset.length))).join('');
};
