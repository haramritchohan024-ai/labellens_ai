const { analyzeSafety } = require('./controllers/safetyController');
const path = require('path');

// Mock environment
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const mockReq = {
    body: {
        text: "Ingredients: Water, Sugar, E621, Preservative (INS 211), E102"
    }
};

const mockRes = {
    json: (data) => {
        console.log("--- Test Result ---");
        console.log(JSON.stringify(data, null, 2));
    },
    status: (code) => {
        return {
            json: (data) => console.log(`Status ${code}:`, data)
        };
    }
};

console.log("Running Test with:", mockReq.body.text);
analyzeSafety(mockReq, mockRes);
