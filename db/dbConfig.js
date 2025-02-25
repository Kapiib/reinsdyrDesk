const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log('MongoDB connection error:', error);
    }
};

module.exports = connectDB;