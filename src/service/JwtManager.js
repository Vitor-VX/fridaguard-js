const jwt = require('jsonwebtoken');

module.exports = class JwtManager {
    static secretKey = process.env.SECRET_JWT

    static test() {
        const generatePublicToken = (payload) => {
            return jwt.sign(payload, this.secretKey, {
                algorithm: 'HS256', // Algoritmo de assinatura
                // Não definir expiresIn para que o token não expire
            });
        };
        
        // Exemplo de payload
        const payload = {
            role: 'public', // Informações básicas, por exemplo
            permissions: ['read'] // Permissões básicas para a API
        };
        
        // Gerar token
        const token = generatePublicToken(payload);
        console.log('Public JWT:', token);
    }

    static generateToken(payload, expiresIn = '1h') {
        try {
            const token = jwt.sign(payload, this.secretKey, { expiresIn });
            return { success: true, token };
        } catch (error) {
            console.error('Error generating token:', error);
            return { success: false, message: 'Error generating token' };
        }
    }
};