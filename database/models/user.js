const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    device: {
        deviceId: {
            type: String,
            default: ''
        },
        buildId: {
            type: String,
            default: ''
        },
        customDeviceId: {
            type: String,
            default: ''
        },
        customBuildId: {
            type: String,
            default: ''
        }
    }
});

module.exports = mongoose.connection.useDb('fridaguard-js').model('user', userSchema);