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
    customDeviceId: {
        type: String,
        default: ''
    },
    customBuildId: {
        type: String,
        default: ''
    },
    appId: {
        type: String
    }
});

module.exports = mongoose.connection.useDb('fridaguard-js').model('user', userSchema);