let mongoose = require('mongoose');

const username = encodeURIComponent(process.env.MONGO_USER);
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = encodeURIComponent(process.env.MONGO_CLUSTER);
const named = encodeURIComponent(process.env.MONGO_DB);

// Connection string
const MONGO_URI = `mongodb+srv://${username}:${password}@${cluster}/${named}?retryWrites=true&w=majority`;

let connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;