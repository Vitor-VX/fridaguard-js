module.exports = async function ConnectMongoDb() {
    const mongoose = require('mongoose');
    
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.mongo_connect);
        }
    } catch (error) {
        return console.log(`Error connectMongoDb: ${error}`);
    }
}