const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

// Seeding products using Strict Enum Primary/Secondary categories
const products = [
    // CEREALS (Primary: Breakfast Foods -> Secondary: Cereals)
    {
        name: "Sugary Choco Flakes",
        brand: "SweetStart",
        primaryCategory: "Breakfast Foods",
        secondaryCategory: "Chocolate Cereals",
        tertiaryCategory: "Kid's Flakes",
        safetyRating: 3, riskScore: 70, riskLevel: "high",
        price: 3.50, priceCategory: "low",
        imageUrl: "https://images.unsplash.com/photo-1550081699-6b54190c76db?w=500&q=80",
        ingredients: ["Sugar", "Corn Flour", "Artificial Colors", "BHT"],
        highlights: ["High Sugar"],
        benefits: ["Fortified with Iron"],
        dietaryTags: ["Vegetarian"],
        additiveRisk: 80, sugarRisk: 90, artificialRisk: 75
    },
    {
        name: "Honey Nut Toasted Oats",
        brand: "MorningBowl",
        primaryCategory: "Breakfast Foods",
        secondaryCategory: "Flavoured Oats",
        safetyRating: 5, riskScore: 50, riskLevel: "medium",
        price: 4.50, priceCategory: "medium",
        imageUrl: "https://images.unsplash.com/photo-1620353119047-9755b7662cf5?w=500&q=80",
        ingredients: ["Oats", "Honey", "Sugar", "Natural Flavors"],
        dietaryTags: ["Vegetarian", "High Fiber"],
        additiveRisk: 20, sugarRisk: 60, artificialRisk: 10
    },
    {
        name: "Organic Bran Flakes",
        brand: "NatureGrains",
        primaryCategory: "Breakfast Foods",
        secondaryCategory: "Cornflakes",
        safetyRating: 7, riskScore: 30, riskLevel: "low",
        price: 5.50, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1521251509623-6afda337e6da?w=500&q=80",
        ingredients: ["Organic Whole Wheat", "Organic Bran", "Sea Salt"],
        dietaryTags: ["Vegan", "High Fiber"],
        additiveRisk: 0, sugarRisk: 5, artificialRisk: 0
    },
    {
        name: "Sprouted Berry Granola",
        brand: "EarthVitality",
        primaryCategory: "Breakfast Foods",
        secondaryCategory: "Granola",
        safetyRating: 10, riskScore: 0, riskLevel: "low",
        price: 8.50, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&q=80",
        ingredients: ["Sprouted Oats", "Dried Berries", "Chia Seeds"],
        description: "A superfood blend of sprouted organic oats and antioxidant-rich wild berries.",
        highlights: ["Organic", "No Added Sugar", "High Fiber"],
        benefits: ["Sustained Energy", "Gut Friendly"],
        dietaryTags: ["Vegan", "Diabetic Friendly"],
        additiveRisk: 0, sugarRisk: 10, artificialRisk: 0
    },

    // ICE CREAM (Primary: Dairy & Dairy Alternatives -> Secondary: Ice Cream)
    {
        name: "Chocolate Fudge Ice Cream",
        brand: "Melt",
        primaryCategory: "Dairy & Dairy Alternatives",
        secondaryCategory: "Ice Cream",
        tertiaryCategory: "Chocolate Ice Cream",
        safetyRating: 4, riskScore: 60, riskLevel: "medium",
        price: 5.99, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=500&q=80",
        ingredients: ["Milk", "Sugar", "Corn Syrup", "Cocoa"],
        dietaryTags: ["Vegetarian", "High Sugar"],
        additiveRisk: 40, sugarRisk: 85, artificialRisk: 20
    },
    {
        name: "Vanilla Bean Gelato",
        brand: "Artisan",
        primaryCategory: "Dairy & Dairy Alternatives",
        secondaryCategory: "Gelato",
        tertiaryCategory: "Vanilla",
        safetyRating: 8, riskScore: 20, riskLevel: "low",
        price: 8.99, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=500&q=80",
        ingredients: ["Cream", "Milk", "Vanilla Bean", "Cane Sugar"],
        dietaryTags: ["Vegetarian"],
        additiveRisk: 10, sugarRisk: 50, artificialRisk: 0
    },
    {
        name: "Organic Low-Sugar Frozen Yogurt",
        brand: "Culture",
        primaryCategory: "Dairy & Dairy Alternatives",
        secondaryCategory: "Frozen Yogurt",
        safetyRating: 9, riskScore: 10, riskLevel: "low",
        price: 6.50, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&q=80",
        ingredients: ["Cultured Milk", "Stevia", "Vanilla Extract"],
        highlights: ["Low Sugar", "Probiotic"],
        benefits: ["Gut Health", "Diabetic Friendly"],
        dietaryTags: ["Vegetarian", "Diabetic Friendly", "Low Sugar"],
        additiveRisk: 5, sugarRisk: 15, artificialRisk: 0
    },

    // BEVERAGES
    {
        name: "Cherry Cola Extreme",
        brand: "PopFizz",
        primaryCategory: "Beverages",
        secondaryCategory: "Cola",
        safetyRating: 2, riskScore: 80, riskLevel: "high",
        price: 1.50, priceCategory: "low",
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
        ingredients: ["Carbonated Water", "HFCS", "Caramel Color", "Artificial Flavor"],
        dietaryTags: ["Vegan", "High Sugar"],
        additiveRisk: 60, sugarRisk: 100, artificialRisk: 90
    },
    {
        name: "100% Press Apple Juice",
        brand: "Orchard",
        primaryCategory: "Beverages",
        secondaryCategory: "Fruit Juice",
        safetyRating: 7, riskScore: 30, riskLevel: "low",
        price: 3.50, priceCategory: "medium",
        imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80",
        ingredients: ["Apple Juice"],
        dietaryTags: ["Vegan", "Gluten Free"],
        additiveRisk: 0, sugarRisk: 60, artificialRisk: 0
    },
    {
        name: "Pure Sparkling Coconut Water",
        brand: "Isle",
        primaryCategory: "Beverages",
        secondaryCategory: "Coconut Water",
        safetyRating: 10, riskScore: 0, riskLevel: "low",
        price: 4.00, priceCategory: "premium",
        imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&q=80",
        ingredients: ["Coconut Water"],
        description: "100% pure single-origin coconut water.",
        highlights: ["Zero Sugar Added", "Electrolytes", "Hydrating"],
        benefits: ["Post-Workout Recovery"],
        dietaryTags: ["Vegan", "Gluten Free", "Keto Friendly"],
        additiveRisk: 0, sugarRisk: 5, artificialRisk: 0
    }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Clearing old structured products...');
        await Product.deleteMany({});

        console.log('Inserting rigidly categorized products...');
        const inserted = await Product.insertMany(products);

        console.log(`✅ Success! Inserted ${inserted.length} strict hybrid products.`);
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
