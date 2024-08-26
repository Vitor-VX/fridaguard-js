const express = require('express');
const router = express();
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const { authenticatePublicToken } = require('../middleware/middleware');

const generateCustomId = () => {
    return crypto.randomBytes(16).toString('hex');
};


const encryptionKey = crypto.randomBytes(32); // Chave de 256 bits para AES-256
const iv = crypto.randomBytes(16); // Vetor de inicialização (IV) de 128 bits para AES

// Função para criptografar texto
const encrypt = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

// Função para descriptografar texto
const decrypt = (encryptedText) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

router.get('/get-app-id', authenticatePublicToken, async (req, res) => {
    try {
        const customDeviceId = generateCustomId();
        const customBuildId = generateCustomId();

        const encryptedDeviceId = encrypt(customDeviceId);
        const encryptedBuildId = encrypt(customBuildId);

        //await saveCustomIdsToDatabase(encryptedDeviceId, encryptedBuildId);

        res.status(200).json({
            status: 200,
            success: true,
            message: 'App IDs generated successfully',
            data: { customDeviceId, customBuildId }
        });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: 'Internal server error.' });
    }
});

module.exports = router;