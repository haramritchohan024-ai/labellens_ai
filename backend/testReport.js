require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/Report');
const { createReport } = require('./controllers/reportController');

// Mock request and response objects
const mockReq = (body, user) => ({
    body,
    user: user || { _id: new mongoose.Types.ObjectId().toString() }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testReports() {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labellens');

    console.log("Connected. Clearing old test reports...");
    // Clear reports from a test user
    const testUserId = "test_user_123";
    await Report.deleteMany({ userId: testUserId });

    console.log("\n--- TEST 1: Validation - Less than 20 chars ---");
    let req = mockReq({
        productName: "Test Product",
        complaintText: "Too short"
    }, { _id: testUserId });
    let res = mockRes();
    await createReport(req, res);
    console.log("Status:", res.statusCode, "(Expected 400)");
    console.log("Response:", res.data);

    console.log("\n--- TEST 2: Validation - Missing Product Name ---");
    req = mockReq({
        complaintText: "This is a long enough complaint text but no product name."
    }, { _id: testUserId });
    res = mockRes();
    await createReport(req, res);
    console.log("Status:", res.statusCode, "(Expected 400)");
    console.log("Response:", res.data);

    console.log("\n--- TEST 3: Successful Creation ---");
    req = mockReq({
        productName: "Valid Test Product",
        category: "Beverages",
        complaintText: "This product actually contains high fructose corn syrup which was missing! Please fix it."
    }, { _id: testUserId });
    res = mockRes();
    await createReport(req, res);
    console.log("Status:", res.statusCode, "(Expected 201)");
    console.log("Response:", res.data);

    // Rate Limit Test
    console.log("\n--- TEST 4: Rate Limiting (Generating 3 more) ---");
    await createReport(req, res); // 2nd
    await createReport(req, res); // 3rd
    res = mockRes();
    await createReport(req, res); // 4th should fail
    console.log("Status of 4th report:", res.statusCode, "(Expected 429)");
    console.log("Response:", res.data);

    console.log("\nCleaning up...");
    await Report.deleteMany({ userId: testUserId });
    await mongoose.disconnect();
    console.log("Done.");
}

testReports().catch(console.error);
