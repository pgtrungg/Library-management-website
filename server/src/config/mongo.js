let mongoose = require('mongoose');

/* const username = encodeURIComponent(process.env.MONGO_USER);
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = encodeURIComponent(process.env.MONGO_CLUSTER);
const named = encodeURIComponent(process.env.MONGO_DB);

// Connection string
const MONGO_URI = `mongodb+srv://${username}:${password}@${cluster}/${named}?retryWrites=true&w=majority`; */
const MONGO_URI = process.env.MONGO_URI;

//const MONGO_URI = 'mongodb+srv://nguyenthiensang24:Y3Wf1KI7G8DYH91d@cluster0.ngnpgh3.mongodb.net/myDB'

let connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;