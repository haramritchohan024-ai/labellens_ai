const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            if (decoded.role === 'admin') {
                req.user = { id: decoded.id, role: 'admin' };
            } else {
                // Get user from the token (exclude password)
                req.user = await User.findById(decoded.id).select('-password');
                if (!req.user) {
                    return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
                }
            }

            next();
        } catch (error) {
            console.error("JWT Verification block error:", error);
            res.status(401).json({ success: false, message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            if (decoded.role === 'admin') {
                req.user = { id: decoded.id, role: 'admin' };
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }
        } catch (error) {
            console.error("Optional JWT Verification error:", error);
        }
    }
    next();
};

module.exports = { protect, adminOnly, optionalAuth };
