const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Relative to script location

const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const fetchUnsplashImages = (keyword) => {
    return new Promise((resolve) => {
        console.log(`📸 Fetching Unsplash CDN links for: ${keyword}...`);
        https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=15`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.results && parsed.results.length > 0) {
                        resolve(parsed.results.map(x => x.urls.regular));
                    } else {
                        resolve([]);
                    }
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
};

// 1️⃣ Master FMCG Categories & Subcategories
const inventoryStructure = [
    {
        name: "Dairy & Dairy Alternatives",
        slug: "dairy-alternatives",
        subs: ["Milk", "Cheese", "Yogurt", "Butter & Margarine", "Plant-based Milk"]
    },
    {
        name: "Frozen Foods",
        slug: "frozen-foods",
        subs: ["Ice Cream", "Frozen Pizza", "Frozen Vegetables", "Ready Meals", "Frozen Desserts"]
    },
    {
        name: "Bakery & Breads",
        slug: "bakery",
        subs: ["Sliced Bread", "Buns & Rolls", "Cakes & Pastries", "Cookies", "Crackers"]
    },
    {
        name: "Breakfast Foods",
        slug: "breakfast",
        subs: ["Cereals", "Oats & Porridge", "Granola", "Pancake Mixes", "Breakfast Bars"]
    },
    {
        name: "Snacks & Savouries",
        slug: "snacks",
        subs: ["Potato Chips", "Corn Chips", "Pretzels", "Popcorn", "Namkeen & Indian Snacks"]
    },
    {
        name: "Beverages",
        slug: "beverages",
        subs: ["Carbonated Soft Drinks", "Juices", "Energy Drinks", "Sports Drinks", "Bottled Water", "Tea & Coffee RTD"]
    },
    {
        name: "Confectionery & Sweets",
        slug: "confectionery",
        subs: ["Chocolates", "Candies & Gummies", "Chewing Gum", "Indian Sweets"]
    },
    {
        name: "Ready-to-Eat / Convenience",
        slug: "ready-to-eat",
        subs: ["Instant Noodles", "Pasta & Macaroni", "Canned Soups", "RTE Curries"]
    },
    {
        name: "Sauces, Spreads & Condiments",
        slug: "sauces",
        subs: ["Ketchup", "Mayonnaise", "Jams & Preserves", "Peanut Butter", "Salad Dressings"]
    },
    {
        name: "Staples & Grains",
        slug: "staples",
        subs: ["Rice", "Flour & Atta", "Lentils & Dals", "Cooking Oils"]
    },
    {
        name: "Health & Nutrition Products",
        slug: "nutrition",
        subs: ["Protein Powders", "Nutrition Bars", "Vitamin Waters", "Meal Replacements"]
    },
    {
        name: "Baby & Kids Food",
        slug: "baby-food",
        subs: ["Baby Cereal", "Fruit Purees", "Toddler Snacks", "Infant Formula"]
    },
    {
        name: "Meat, Poultry & Seafood",
        slug: "meats",
        subs: ["Sausages", "Cold Cuts", "Canned Tuna", "Frozen Chicken Nuggets"]
    },
    {
        name: "Plant-Based & Vegan Products",
        slug: "vegan",
        subs: ["Mock Meats", "Vegan Cheeses", "Tofu & Paneer Alternatives"]
    }
];

// 2️⃣ Realistic Additive Intelligence Arrays
const allAdditives = {
    preservatives: ["Sodium Benzoate", "Potassium Sorbate", "Sodium Nitrite", "TBHQ", "BHA", "BHT", "Sorbic Acid", "Calcium Propionate"],
    colors: ["Tartrazine (E102)", "Sunset Yellow (E110)", "Caramel Color (E150)", "Allura Red (E129)", "Brilliant Blue (E133)", "Titanium Dioxide (E171)"],
    sweeteners: ["Aspartame (E951)", "Acesulfame K (E950)", "Sucralose (E955)", "HFCS", "Saccharin", "Stevia", "Erythritol"],
    stabilizers: ["Carrageenan (E407)", "Guar Gum (E412)", "Xanthan Gum (E415)", "Locust Bean Gum", "Gellan Gum"],
    emulsifiers: ["Soy Lecithin (E322)", "Mono- and diglycerides (E471)", "Polysorbate 80"],
    thickeners: ["Modified Starch", "Cellulose Gum", "Pectin", "Corn Starch"],
    flavors: ["Artificial Flavors", "Natural Flavors", "MSG (E621)", "Yeast Extract", "Disodium Inosinate"]
};

// Dietary tags pool
const dietaryEnums = ["Vegan", "Gluten-Free", "Organic", "Diabetic-Friendly", "Keto", "Dairy-Free"];

// 3️⃣ Realism Constants
const brandPool = [
    "GreenHarvest", "PureFields", "NatureNest", "FreshRoot", "UrbanFarm",
    "DailyPure", "NutriGlow", "HarvestGold", "TrueBite", "EarthBasket",
    "WellSpring", "FarmCraft", "VitalLeaf", "GoodGrain", "PureHarvest",
    "BrightBite", "FreshAura", "HealthyRoot"
];

const getDescriptor = (riskLevel) => {
    if (riskLevel === 'low') {
        const desc = ["Organic", "Natural", "Pure", "Artisan", "Premium", "Wholesome"];
        return desc[Math.floor(Math.random() * desc.length)];
    } else if (riskLevel === 'moderate') {
        const desc = ["Classic", "Original", "Traditional", "Signature", "Everyday"];
        return desc[Math.floor(Math.random() * desc.length)];
    } else {
        const desc = ["Value", "Daily", "Standard", "Saver", "Essentials"];
        return desc[Math.floor(Math.random() * desc.length)];
    }
};

const getFeature = (riskLevel) => {
    if (riskLevel !== 'low') return "";
    const features = ["No Added Sugar", "Low Sodium", "High Protein", "Gluten-Free", "Nitrate-Free", "Cold-Pressed", "Stoneground"];
    return Math.random() > 0.5 ? features[Math.floor(Math.random() * features.length)] : "";
};

const productImageMap = {
    "Milk": "milk carton packaging retail",
    "Cheese": "cheese block packaging supermarket",
    "Yogurt": "yogurt cup packaging dairy retail",
    "Butter & Margarine": "butter block packaging supermarket",
    "Plant-based Milk": "almond milk carton packaging retail",
    "Ice Cream": "ice cream tub packaging supermarket",
    "Frozen Pizza": "frozen pizza box packaging supermarket",
    "Frozen Vegetables": "frozen vegetables bag packaging retail",
    "Ready Meals": "ready meal tray frozen packaging",
    "Frozen Desserts": "frozen dessert box packaging retail",
    "Sliced Bread": "sliced bread loaf plastic packaging supermarket",
    "Buns & Rolls": "bread rolls packet packaging retail",
    "Cakes & Pastries": "cake box packaging supermarket",
    "Cookies": "cookies packet packaging retail",
    "Crackers": "crackers box packaging supermarket",
    "Cereals": "cereal box packaging supermarket",
    "Oats & Porridge": "oats packet packaging retail",
    "Granola": "granola bag pouch packaging supermarket",
    "Pancake Mixes": "pancake mix box packaging retail",
    "Breakfast Bars": "cereal bar wrapper packaging supermarket",
    "Potato Chips": "potato chips packet packaging retail",
    "Corn Chips": "tortilla chips bag packaging supermarket",
    "Pretzels": "pretzels bag packaging retail",
    "Popcorn": "popcorn bag packaging supermarket",
    "Namkeen & Indian Snacks": "indian snack packet packaging retail",
    "Carbonated Soft Drinks": "cola soft drink bottle packaging",
    "Juices": "fruit juice carton packaging supermarket",
    "Energy Drinks": "energy drink can packaging retail",
    "Sports Drinks": "sports drink bottle packaging supermarket",
    "Bottled Water": "water bottle packaging retail",
    "Tea & Coffee RTD": "iced tea bottle packaging supermarket",
    "Chocolates": "chocolate bar wrapper packaging retail",
    "Candies & Gummies": "candy packet packaging supermarket",
    "Chewing Gum": "chewing gum pack packaging retail",
    "Indian Sweets": "indian sweets box packaging supermarket",
    "Instant Noodles": "instant noodles packet packaging retail",
    "Pasta & Macaroni": "dried pasta box packaging supermarket",
    "Canned Soups": "soup can food packaging retail",
    "RTE Curries": "cooked curry pouch packaging supermarket",
    "Ketchup": "ketchup bottle sauce packaging retail",
    "Mayonnaise": "mayonnaise jar packaging supermarket",
    "Jams & Preserves": "fruit jam jar packaging retail",
    "Peanut Butter": "peanut butter jar packaging supermarket",
    "Salad Dressings": "salad dressing bottle packaging retail",
    "Rice": "rice bag packaging retail supermarket",
    "Flour & Atta": "wheat flour bag packaging retail",
    "Lentils & Dals": "lentils packet packaging retail",
    "Cooking Oils": "cooking oil bottle packaging supermarket",
    "Protein Powders": "protein powder container packaging supplement jar",
    "Nutrition Bars": "protein bar wrapper packaging retail",
    "Vitamin Waters": "vitamin water bottle packaging supermarket",
    "Meal Replacements": "meal replacement shake bottle packaging retail",
    "Baby Cereal": "baby cereal box packaging supermarket",
    "Fruit Purees": "baby food pouch packaging retail",
    "Toddler Snacks": "toddler puff snack tub packaging supermarket",
    "Infant Formula": "infant formula tin packaging retail",
    "Sausages": "sausage pack vacuum sealed packaging retail",
    "Cold Cuts": "deli meat salami pack packaging supermarket",
    "Canned Tuna": "canned tuna tin packaging retail",
    "Frozen Chicken Nuggets": "frozen chicken nuggets box packaging supermarket",
    "Mock Meats": "vegan meat pack packaging retail",
    "Vegan Cheeses": "vegan cheese block packaging supermarket",
    "Tofu & Paneer Alternatives": "tofu pack packaging retail"
};

const getImageKeywords = (subcategoryStr) => {
    // Failsafe validation and strict mapping
    let mappedQuery = productImageMap[subcategoryStr];
    if (!mappedQuery) {
        // Fallback string if a new subcategory appears, forcibly injecting retail packaging context
        mappedQuery = `${subcategoryStr} packet packaging product retail`;
    }
    return mappedQuery;
};

const getSmartDescription = (subcategoryStr, riskLevel) => {
    if (riskLevel === 'low') {
        const desc = [
            `Crafted with wholesome ingredients and no artificial preservatives.`,
            `A clean label option with minimal processing and no synthetic stabilizers.`,
            `Made naturally without artificial colors or added phosphates.`
        ];
        return desc[Math.floor(Math.random() * desc.length)];
    } else if (riskLevel === 'moderate') {
        const desc = [
            `A traditional recipe containing standard industry ingredients.`,
            `Balancing flavor and shelf-life with common preservatives.`,
            `A familiar choice in the ${subcategoryStr} category.`
        ];
        return desc[Math.floor(Math.random() * desc.length)];
    } else {
        const desc = [
            `Contains multiple artificial additives and synthetic components.`,
            `A highly processed option built for maximum shelf-life.`,
            `Economical choice containing heavily refined ingredients.`
        ];
        return desc[Math.floor(Math.random() * desc.length)];
    }
}


// 4️⃣ Product Factory Algorithm
const generateSubcategoryProducts = async (categoryId, categoryName, subcategoryStr) => {
    const products = [];
    const count = Math.floor(Math.random() * 8) + 8; // Generate 8 to 15 products

    // Risk Distribution Requirement: 20% Low, 50% Moderate, 30% High
    const lowCount = Math.round(count * 0.2);
    const modCount = Math.round(count * 0.5);
    const highCount = count - lowCount - modCount;

    let distribution = [
        ...Array(lowCount).fill("low"),
        ...Array(modCount).fill("moderate"),
        ...Array(highCount).fill("high")
    ];

    // Shuffle distribution array
    distribution = distribution.sort(() => Math.random() - 0.5);
    const usedNames = new Set();

    // Unsplash keyword generator
    const imageKeyword = getImageKeywords(subcategoryStr);
    const unsplashUrls = await fetchUnsplashImages(imageKeyword.replace(/,/g, ' '));

    for (let i = 0; i < count; i++) {
        const riskLevel = distribution[i];

        let riskScore = 0;
        let selectedAdditives = [];
        let cleanLabel = false;

        if (riskLevel === "low") {
            riskScore = Math.floor(Math.random() * 30); // 0-29
            cleanLabel = Math.random() > 0.3; // 70% chance of clean label
            if (Math.random() > 0.5) selectedAdditives.push(allAdditives.flavors[1]); // Natural Flavors
            if (Math.random() > 0.8) selectedAdditives.push(allAdditives.thickeners[2]); // Pectin
        } else if (riskLevel === "moderate") {
            riskScore = Math.floor(Math.random() * 30) + 40; // 40-69
            // Mix 1-3 additives safely
            selectedAdditives.push(allAdditives.preservatives[Math.floor(Math.random() * allAdditives.preservatives.length)]);
            selectedAdditives.push(allAdditives.stabilizers[Math.floor(Math.random() * allAdditives.stabilizers.length)]);
            if (Math.random() > 0.5) selectedAdditives.push(allAdditives.flavors[Math.floor(Math.random() * 2)]);
        } else { // high
            riskScore = Math.floor(Math.random() * 30) + 70; // 70-99
            // Bombard with 3-6 additives including harsh colors/sweeteners
            let addCount = Math.floor(Math.random() * 4) + 3;
            const keys = Object.keys(allAdditives);
            for (let j = 0; j < addCount; j++) {
                const randomClass = allAdditives[keys[Math.floor(Math.random() * keys.length)]];
                selectedAdditives.push(randomClass[Math.floor(Math.random() * randomClass.length)]);
            }
        }

        // Deduplicate additives
        selectedAdditives = [...new Set(selectedAdditives)];

        // Generate Tags
        let tags = [];
        if (Math.random() > 0.6) tags.push(dietaryEnums[Math.floor(Math.random() * dietaryEnums.length)]);
        if (cleanLabel && !tags.includes("Organic") && Math.random() > 0.5) tags.push("Organic");
        if (categoryName.includes("Vegan")) tags.push("Vegan");

        const brand = brandPool[Math.floor(Math.random() * brandPool.length)];
        const descriptor = getDescriptor(riskLevel);
        const feature = getFeature(riskLevel);

        let productName = `${brand} ${descriptor} ${subcategoryStr}`;
        if (feature) productName += ` ${feature}`;

        // Ensure unique
        let attempt = 1;
        while (usedNames.has(productName)) {
            productName = `${brand} ${descriptor} ${subcategoryStr} Pack ${attempt}`;
            attempt++;
        }
        usedNames.add(productName);

        // Strict Validation Rule: Ensure query includes packaging/retail context
        const mandatoryTerms = ['packaging', 'pack', 'box', 'carton', 'bottle', 'jar', 'pouch', 'tub', 'bag', 'wrapper', 'tin', 'retail', 'supermarket'];
        const isValidQuery = mandatoryTerms.some(term => imageKeyword.toLowerCase().includes(term));

        let finalImgUrl = `https://placehold.co/400x400?text=${encodeURIComponent(productName)}`;

        if (isValidQuery && unsplashUrls.length > 0) {
            finalImgUrl = unsplashUrls[i % unsplashUrls.length];
        } else if (!isValidQuery) {
            console.warn(`⚠️ Blocked render for ${subcategoryStr}: Missing packaging keyword in '${imageKeyword}'`);
        }

        products.push({
            name: productName,
            brand: brand,
            category: categoryId,
            subcategory: subcategoryStr,
            ingredients: [`Water`, `Base ingredient`, ...selectedAdditives],
            additives: selectedAdditives,
            riskScore,
            riskLevel,
            dietaryTags: [...new Set(tags)],
            cleanLabel,
            imageUrl: finalImgUrl,
            description: getSmartDescription(subcategoryStr, riskLevel)
        });
    }

    return products;
};

// 4️⃣ Execute Seed
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        console.log('🗑️  Wiping existing Categories and Products...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        let totalProductsSeeded = 0;

        for (const catData of inventoryStructure) {
            // Create Parent Category
            const category = await Category.create({ name: catData.name, slug: catData.slug });

            // Loop subcategories
            for (const sub of catData.subs) {
                const subProducts = await generateSubcategoryProducts(category._id, category.name, sub);
                await Product.insertMany(subProducts);
                totalProductsSeeded += subProducts.length;
                console.log(`📦 Seeded ${subProducts.length} items for [${catData.name} > ${sub}]`);
            }
        }

        console.log(`\n🎉 SEED COMPLETE! Successfully loaded ${totalProductsSeeded} dynamic products across ${inventoryStructure.length} major categories.`);
        process.exit();

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
