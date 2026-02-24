const Report = require('../models/Report');

// @desc    Submit a new product report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    try {
        const { productName, category, subcategory, complaintText, scanId } = req.body;
        const userId = req.user ? req.user._id : "anonymous_user"; // We will require login anyway

        if (!complaintText || complaintText.length < 20) {
            return res.status(400).json({ success: false, error: 'Complaint description must be at least 20 characters.' });
        }

        if (!productName) {
            return res.status(400).json({ success: false, error: 'Product name is required.' });
        }

        // Rate Limit: Check if this user has already reported this product name 3 times today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recentReportsCount = await Report.countDocuments({
            userId,
            productName,
            createdAt: { $gte: today }
        });

        if (recentReportsCount >= 3) {
            return res.status(429).json({ success: false, error: 'Maximum 3 reports per product per day allowed.' });
        }

        const newReport = await Report.create({
            userId,
            productName,
            category,
            subcategory,
            complaintText,
            reason: complaintText, // mapping for legacy usage
            scanId
        });

        res.status(201).json({ success: true, report: newReport });
    } catch (error) {
        console.error("Create Report Error:", error);
        res.status(500).json({ success: false, error: 'Server error while creating report.' });
    }
};

// @desc    Get all reports for Admin
// @route   GET /api/reports/admin
// @access  Private (Admin only)
const getAllReportsAdmin = async (req, res) => {
    try {
        // Implement query filters: category, status, date range if specified in frontend
        const { status, category, dateSort } = req.query;

        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        let sortOption = { createdAt: -1 };
        if (dateSort === 'Oldest') {
            sortOption = { createdAt: 1 };
        }

        // We populate the user email if we can join it, or look it up if needed.
        // Assuming user model is connected or userId is string email/sub. 
        // For our MVP, reports userId is just string "anonymous_user" or user._id.
        // We will just return the list.
        const reports = await Report.find(query).sort(sortOption).lean();

        // Lookup User emails manually if userId is ObjectIds
        const User = require('../models/User');
        const userIds = [...new Set(reports.map(r => r.userId).filter(id => id && id.length === 24))];
        const users = await User.find({ _id: { $in: userIds } }).select('email name');
        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user.email || user.name;
            return acc;
        }, {});

        const enrichedReports = reports.map(r => ({
            ...r,
            userEmail: userMap[r.userId] || r.userId
        }));

        res.json({ success: true, reports: enrichedReports });
    } catch (error) {
        console.error("Admin Get Reports Error:", error);
        res.status(500).json({ success: false, error: 'Server error while fetching reports.' });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/admin/:id
// @access  Private (Admin only)
const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Under Review', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status.' });
        }

        const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found.' });
        }

        res.json({ success: true, report });
    } catch (error) {
        console.error("Admin Update Report Error:", error);
        res.status(500).json({ success: false, error: 'Server error while updating report.' });
    }
};

module.exports = {
    createReport,
    getAllReportsAdmin,
    updateReportStatus
};
