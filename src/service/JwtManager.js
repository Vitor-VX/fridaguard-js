const jwt = require('jsonwebtoken');

module.exports = class JwtManager {
    static secretKey = process.env.SECRET_JWT

    static generatePublicToken() {
        const payload = {
            role: 'public', 
            permissions: ['read'] 
        };
        
        const token = jwt.sign(payload, this.secretKey, { algorithm: 'HS256' });
        console.log('Public JWT:', token);
    }

    static generateToken(payload, expiresIn = '10s') {
        try {
            const token = jwt.sign(payload, this.secretKey, { expiresIn });
            return { success: true, token };
        } catch (error) {
            console.error('Error generating token:', error);
            return { success: false, message: 'Error generating token' };
        }
    }
};