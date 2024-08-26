const UserModel = require('../../database/models/user');
const bcrypt = require('bcryptjs');

module.exports = class UserManager {
    static async getUserDeviceInfo(username) {
        try {
            const user = await UserModel.findOne({ username });
    
            if (!user) {
                return { success: false, message: 'User not found' };
            }
    
            return {
                success: true,
                customDeviceId: user.customDeviceId,
                customBuildId: user.customBuildId
            };
        } catch (error) {
            console.error("Error fetching device info:", error);
            return { success: false, message: 'Error fetching device info' };
        }
    }
    
    static async saveDeviceInfo(username, customDeviceId, customBuildId) {
        try {
            const saveDevice = await UserModel.updateOne(
                { username },
                { $set: { customDeviceId, customBuildId } }
            );

            if (saveDevice != null) {
                return { success: true, message: 'Infos save device completed.' };
            }

            return { success: false, message: 'Error in save device.' };
        } catch (error) {
            return console.log('Error save device info: ' + error);
        }
    }

    static async checkPassword(username, password) {
        try {
            const existingUser = await UserModel.findOne({ username });

            if (!existingUser) {
                return { success: false, message: 'User not found' };
            }

            const passwordCorrect = await bcrypt.compare(password, existingUser.password);

            if (!passwordCorrect) {
                return { success: false, message: 'Incorrect password' };
            }

            return { success: true, message: 'Authentication successful' };

        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error checking password' };
        }
    }

    static async createUser(username, password) {
        try {
            const existingUser = await UserModel.findOne({ username });

            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({ username, password: hashedPassword });
            await newUser.save();

            return { success: true, message: 'User created successfully' };

        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error creating user' };
        }
    }
}