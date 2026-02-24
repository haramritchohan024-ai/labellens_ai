const CATEGORIES = {
    "Dairy & Dairy Alternatives": [
        "Milk (Full Cream, Toned, Skimmed)", "Flavoured Milk", "Butter", "Ghee",
        "Cheese (Processed, Mozzarella, Cheddar)", "Paneer", "Cream", "Yogurt / Curd",
        "Greek Yogurt", "Flavoured Yogurt", "Lassi", "Buttermilk", "Milkshakes",
        "Ice Cream", "Frozen Yogurt", "Gelato", "Dairy-Free Milk (Almond, Soy, Oat)",
        "Vegan Cheese"
    ],
    "Frozen Foods": [
        "Ice Cream", "Frozen Dessert", "Popsicles", "Frozen Vegetables",
        "Frozen Fries", "Frozen Snacks (Nuggets, Patties)", "Frozen Ready Meals",
        "Frozen Pizza", "Frozen Paratha"
    ],
    "Bakery & Breads": [
        "White Bread", "Brown Bread", "Multigrain Bread", "Buns", "Pav",
        "Burger Buns", "Pizza Base", "Cakes", "Pastries", "Muffins", "Cookies",
        "Rusks", "Croissants", "Donuts", "Brownies"
    ],
    "Breakfast Foods": [
        "Cornflakes", "Chocolate Cereals", "Oats", "Flavoured Oats", "Granola",
        "Muesli", "Pancake Mix", "Waffle Mix", "Breakfast Bars", "Peanut Butter",
        "Jams", "Honey"
    ],
    "Snacks & Savouries": [
        "Potato Chips", "Nachos", "Extruded Snacks (Kurkure type)", "Popcorn",
        "Namkeen", "Bhujia", "Mixture", "Roasted Nuts", "Salted Nuts", "Trail Mix",
        "Protein Snacks"
    ],
    "Beverages": [
        "Soft Drinks", "Cola", "Energy Drinks", "Sports Drinks", "Fruit Juice",
        "Juice Drinks", "Flavoured Water", "Coconut Water", "Iced Tea", "Coffee",
        "Instant Coffee", "Tea", "Green Tea", "Milk-Based Drinks", "Beer", "Wine",
        "Spirits", "RTD Cocktails"
    ],
    "Confectionery & Sweets": [
        "Milk Chocolate", "Dark Chocolate", "White Chocolate", "Candy", "Toffees",
        "Chewing Gum", "Lollipops", "Fudge", "Indian Sweets (Ladoo, Barfi)",
        "Chocolate Spread"
    ],
    "Ready-to-Eat / Convenience Foods": [
        "Instant Noodles", "Cup Noodles", "Ready Meals", "Pasta", "Mac & Cheese",
        "Soup Packets", "Ready Gravies", "Ready Rice", "Instant Upma/Poha", "Meal Kits"
    ],
    "Sauces, Spreads & Condiments": [
        "Tomato Ketchup", "Chili Sauce", "Soy Sauce", "Mayonnaise", "Salad Dressing",
        "Mustard", "Pickles", "Vinegar", "Chutney", "Pasta Sauce"
    ],
    "Staples & Grains": [
        "Rice", "Basmati Rice", "Brown Rice", "Wheat Flour", "Multigrain Flour",
        "Maida", "Suji", "Besan", "Pulses", "Lentils", "Quinoa", "Millets",
        "Pasta", "Noodles"
    ],
    "Health & Nutrition Products": [
        "Protein Powder", "Whey Protein", "Mass Gainer", "Meal Replacement",
        "Nutrition Bars", "Keto Products", "Sugar-Free Products",
        "Diabetic-Friendly Products", "Gluten-Free Products"
    ],
    "Baby & Kids Food": [
        "Infant Formula", "Baby Cereal", "Baby Puree", "Kids Snacks", "Kids Drinks"
    ],
    "Meat, Poultry & Seafood": [
        "Processed Chicken", "Sausages", "Salami", "Frozen Meat",
        "Canned Tuna", "Fish Fillets"
    ],
    "Plant-Based & Vegan Products": [
        "Vegan Meat", "Plant-Based Nuggets", "Vegan Sausage", "Tofu",
        "Tempeh", "Vegan Ice Cream"
    ]
};

// Level 3 Smart Fallbacks Mappings (Secondary Category -> Related Fallback Secondary Categories)
const CATEGORY_FALLBACKS = {
    "Ice Cream": ["Frozen Yogurt", "Gelato", "Vegan Ice Cream", "Frozen Dessert"],
    "Soft Drinks": ["Flavoured Water", "Fruit Juice", "Coconut Water", "Iced Tea"],
    "Cola": ["Flavoured Water", "Fruit Juice", "Iced Tea"],
    "Milk Chocolate": ["Dark Chocolate", "Chocolate Spread"],
    "Potato Chips": ["Popcorn", "Roasted Nuts", "Trail Mix", "Protein Snacks"],
    "Energy Drinks": ["Sports Drinks", "Coffee", "Green Tea"],
    "White Bread": ["Multigrain Bread", "Brown Bread"],
    "Instant Noodles": ["Pasta", "Oats"],
    "White Chocolate": ["Dark Chocolate"],
    "Candy": ["Dark Chocolate", "Fudge"]
};

const getPrimaryCategories = () => Object.keys(CATEGORIES);

const getSecondaryCategories = (primary) => CATEGORIES[primary] || [];

const isValidCategory = (primary, secondary) => {
    if (!CATEGORIES[primary]) return false;
    return CATEGORIES[primary].includes(secondary);
};

module.exports = {
    CATEGORIES,
    CATEGORY_FALLBACKS,
    getPrimaryCategories,
    getSecondaryCategories,
    isValidCategory
};
