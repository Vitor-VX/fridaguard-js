const jwt = require('jsonwebtoken');
const UserModel = require('../../database/models/user');

const jwt_secret = process.env.SECRET_JWT;

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const identifierFrida = req.headers['x-frida-identifier'];

    if (!token || !identifierFrida || !identifierFrida.startsWith('frida-script-')) {
        return res.status(401).json({ status: 401, success: false, message: 'Access Denied' });
    }

    jwt.verify(token, jwt_secret, async (err, payload) => {
        if (err) {
            return res.status(403).json({ status: 403, success: false, message: 'Invalid Token' });
        }

        const user = await UserModel.findOne({ username: payload.username });
        if (!user) {
            return res.status(403).json({ status: 403, success: false, message: 'User not found' });
        }

        const { device } = user;

        const dbDeviceId = device.deviceId;
        const dbBuildId = device.buildId;
        const dbCustomDeviceId = device.customDeviceId;
        const dbCustomBuildId = device.customBuildId;

        const tokenCustomDeviceId = payload.customDeviceId;
        const tokenCustomBuildId = payload.customBuildId;

        if (
            dbCustomDeviceId !== tokenCustomDeviceId ||
            dbCustomBuildId !== tokenCustomBuildId
        ) {
            return res.status(403).json({ status: 403, success: false, message: 'Device information does not match.' });
        }

        req.user = payload;
        next();
    });
};

const authenticatePublicToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ status: 401, success: false, message: 'Access Denied' });

    jwt.verify(token, jwt_secret, (err, payload) => {
        if (err) return res.status(403).json({ status: 403, success: false, message: 'Invalid Token' });

        req.user = payload;
        next();
    });
};


module.exports = { authenticateToken, authenticatePublicToken };
