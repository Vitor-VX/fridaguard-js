const jwt = require('jsonwebtoken');
const UserModel = require('../../database/models/user');

const jwt_secret = process.env.SECRET_JWT;

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { deviceId, buildId } = req.body;

    if (!token) return res.status(401).json({ status: 401, success: false, message: 'Access Denied' });

    jwt.verify(token, jwt_secret, async (err, payload) => {
        if (err) return res.status(403).json({ status: 403, success: false, message: 'Invalid Token' });

        const user = await UserModel.findOne({ username: payload.username });
        if (!user) return res.status(403).json({ status: 403, success: false, message: 'User not found' });

        const dbDeviceId = user.deviceId;
        const dbBuildId = user.buildId;

        const tokenDeviceId = payload.deviceId;
        const tokenBuildId = payload.buildId;

        if (
            dbDeviceId !== tokenDeviceId ||
            dbBuildId !== tokenBuildId ||
            deviceId !== tokenDeviceId ||
            buildId !== tokenBuildId
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