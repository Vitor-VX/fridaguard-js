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
                deviceId: user.device.deviceId,
                buildId: user.device.buildId,
                customDeviceId: user.device.customDeviceId,
                customBuildId: user.device.customBuildId
            };
        } catch (error) {
            console.error('Error fetching device info:', error);
            return { success: false, message: 'Error fetching device info' };
        }
    }
    
    static async saveDeviceInfo(username, customDeviceId, customBuildId, deviceId, buildId) {
        try {
            const saveDevice = await UserModel.updateOne(
                { username },
                {
                    $set: {
                        'device.deviceId': deviceId,
                        'device.buildId': buildId,
                        'device.customDeviceId': customDeviceId,
                        'device.customBuildId': customBuildId
                    }
                }
            );
    
            if (saveDevice.nModified > 0 || saveDevice.matchedCount > 0) {
                return { success: true, message: 'Device info saved successfully.' };
            }
    
            return { success: true, message: 'Device info unchanged, but save successful.' };
        } catch (error) {
            console.error('Error saving device info:', error);
            return { success: false, message: 'Error saving device info.' };
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