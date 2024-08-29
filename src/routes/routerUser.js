const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const UserManager = require('../service/UserManager');
const JwtManager = require('../service/JwtManager');

// middleware
const { authenticateToken } = require('../middleware/middleware');

router.post('/create-user', [
    body('username').notEmpty().withMessage('Username is not empty'),
    body('password').notEmpty().withMessage('Password is not empty'),
    body('key-create').notEmpty().withMessage('Password key-create is not empty')
    .custom((validator) => {
        if (validator !== process.env.key_create) {
            throw new Error('Password key-create necessary')
        }

        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(404).json({ status: 404, success: false, message: 'Validation error.' });
        }

        const { username, password } = req.body;

        const result = await UserManager.createUser(username, password);
        const message = result.message;
        const success = result.success;

        if (!success) {
            return res.status(401).json({ status: 401, success: false, message: message });
        }

        return res.status(201).json({ status: 201, success: true, message: message });
    } catch (error) {
        return res.status(501).json({ status: 501, success: false, message: 'Internal server error.' });
    }
});

router.post('/login-user', [
    body('username').notEmpty().withMessage('Username is not empty'),
    body('password').notEmpty().withMessage('Password is not empty'),
    body('customDeviceId').notEmpty().withMessage('Custom Device ID is required'),
    body('customBuildId').notEmpty().withMessage('Custom Build ID is required'),
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('buildId').notEmpty().withMessage('Build ID is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 400, success: false, message: 'Validation error.' });
        }

        const { username, password, customDeviceId, customBuildId, deviceId, buildId } = req.body;

        const result = await UserManager.checkPassword(username, password);
        if (!result.success) {
            return res.status(401).json({ status: 401, success: false, message: result.message });
        }

        const userDeviceInfo = await UserManager.getUserDeviceInfo(username);

        if (userDeviceInfo) {
            const isFirstAccess = userDeviceInfo.customDeviceId === '' && userDeviceInfo.customBuildId === '' && userDeviceInfo.deviceId === '' && userDeviceInfo.buildId === '';
            
            if (!isFirstAccess) {
                const customDeviceIdMatches = userDeviceInfo.customDeviceId === customDeviceId;
                const customBuildIdMatches = userDeviceInfo.customBuildId === customBuildId;
                const deviceIdMatches = userDeviceInfo.deviceId === deviceId;
                const buildIdMatches = userDeviceInfo.buildId === buildId;

                if (!(customDeviceIdMatches && customBuildIdMatches && deviceIdMatches && buildIdMatches)) {
                    return res.status(403).json({ status: 403, success: false, message: 'Device mismatch detected. Please use the correct device.' });
                }
            }
        }

        const saveDeviceResult = await UserManager.saveDeviceInfo(username, customDeviceId, customBuildId, deviceId, buildId);
        if (!saveDeviceResult.success) {
            return res.status(401).json({ status: 401, success: false, message: saveDeviceResult.message });
        }

        const payload = { username, customDeviceId, customBuildId, deviceId, buildId };
        const tokenGenerate = JwtManager.generateToken(payload);

        if (!tokenGenerate.success) {
            return res.status(400).json({ status: 400, success: false, message: tokenGenerate.message });
        }

        return res.status(201).json({ status: 201, success: true, message: 'Login successful', data: [{ token: tokenGenerate.token }] });
    } catch (error) {
        return res.status(501).json({ status: 501, success: false, message: 'Internal server error.' });
    }
});


router.post('/verify-token', authenticateToken, (req, res) => {
    return res.status(201).json({ status: 201, success: true, message: 'Code generate', data: [{ code: {  } }] });
});


module.exports = router;