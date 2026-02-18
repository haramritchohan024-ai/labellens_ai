const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Additive = require('../models/Additive');
const Alternative = require('../models/Alternative');
const additivesData = require('../data/additives.json');
const alternativesData = require('../data/alternatives.json');
const connectDB = require('../config/db');

dotenv.config({ path: '../.env' }); // Adjust path to .env

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Additive.deleteMany({});
        await Alternative.deleteMany({});

        console.log('Seeding Additives...');
        await Additive.insertMany(additivesData);

        console.log('Seeding Alternatives...');
        await Alternative.insertMany(alternativesData);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
