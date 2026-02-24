const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
        healthConditions: {
            diabetes: { type: Boolean, default: false },
            hypertension: { type: Boolean, default: false },
            cholesterol: { type: Boolean, default: false },
            lactoseIntolerant: { type: Boolean, default: false },
            glutenIntolerant: { type: Boolean, default: false },
            nutAllergy: { type: Boolean, default: false },
            soyAllergy: { type: Boolean, default: false },
            eggAllergy: { type: Boolean, default: false }
        },
        dietaryLifestyle: {
            vegetarian: { type: Boolean, default: false },
            vegan: { type: Boolean, default: false },
            jain: { type: Boolean, default: false },
            halal: { type: Boolean, default: false },
            highProtein: { type: Boolean, default: false },
            weightLoss: { type: Boolean, default: false },
            childSafe: { type: Boolean, default: false }
        },
        riskSensitivity: {
            level: { type: String, enum: ['conservative', 'moderate', 'lenient'], default: 'moderate' }
        },
        scoringPriority: {
            sugarWeight: { type: Number, default: 50 },
            additiveWeight: { type: Number, default: 50 },
            preservativeWeight: { type: Number, default: 50 },
            allergenWeight: { type: Number, default: 50 }
        },
        notifications: {
            weeklySummary: { type: Boolean, default: true },
            productUpdates: { type: Boolean, default: true },
            reportResolution: { type: Boolean, default: true }
        },
        appearance: {
            darkMode: { type: Boolean, default: false },
            compactMode: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
