const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text - The plaintext to encrypt
 * @param {string} key - The encryption key (must be 32 bytes)
 * @returns {string} - The encrypted text in format iv:encryptedData
 */
function encrypt(text, key) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts text using AES-256-CBC
 * @param {string} text - The encrypted text in format iv:encryptedData
 * @param {string} key - The encryption key (must be 32 bytes)
 * @returns {string} - The decrypted plaintext
 */
function decrypt(text, key) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

/**
 * Generates a secure random 32-byte key for AES-256
 * @returns {string} - Hex encoded key
 */
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    encrypt,
    decrypt,
    generateKey
};
