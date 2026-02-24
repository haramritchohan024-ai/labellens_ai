import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartPulse,
    Salad,
    ShieldAlert,
    SlidersHorizontal,
    Bell,
    Palette,
    Save,
    Check,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Preferences = () => {
    const { user, token } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const [prefs, setPrefs] = useState({
        healthConditions: {
            diabetes: false, hypertension: false, cholesterol: false, lactoseIntolerant: false,
            glutenIntolerant: false, nutAllergy: false, soyAllergy: false, eggAllergy: false
        },
        dietaryLifestyle: {
            vegetarian: false, vegan: false, jain: false, halal: false,
            highProtein: false, weightLoss: false, childSafe: false
        },
        riskSensitivity: { level: 'moderate' },
        scoringPriority: {
            sugarWeight: 50, additiveWeight: 50, preservativeWeight: 50, allergenWeight: 50
        },
        notifications: {
            weeklySummary: true, productUpdates: true, reportResolution: true
        },
        appearance: {
            darkMode: false, compactMode: false
        }
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/preferences');
                if (res.data.success && res.data.preferences) {
                    // Merge fetched prefs with default structure to prevent undefined errors on new fields
                    setPrefs(prev => ({
                        healthConditions: { ...prev.healthConditions, ...res.data.preferences.healthConditions },
                        dietaryLifestyle: { ...prev.dietaryLifestyle, ...res.data.preferences.dietaryLifestyle },
                        riskSensitivity: { ...prev.riskSensitivity, ...res.data.preferences.riskSensitivity },
                        scoringPriority: { ...prev.scoringPriority, ...res.data.preferences.scoringPriority },
                        notifications: { ...prev.notifications, ...res.data.preferences.notifications },
                        appearance: { ...prev.appearance, ...res.data.preferences.appearance }
                    }));
                }
            } catch (err) {
                console.error("Failed to load preferences", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && token) {
            fetchPreferences();
        }
    }, [user, token]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            await axios.put('http://localhost:5000/api/user/preferences', { preferences: prefs });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNestedState = (category, field) => {
        setPrefs(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: !prev[category][field]
            }
        }));
    };

    const updateNestedValue = (category, field, value) => {
        setPrefs(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    // Toggle Component
    const ToggleSwitch = ({ checked, onChange, label }) => (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                {label}
            </span>
            <div className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <motion.div
                    layout
                    className="bg-white w-4 h-4 rounded-full shadow-sm"
                    animate={{ x: checked ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        </label>
    );

    // Range Slider Component
    const RangeSlider = ({ label, value, onChange }) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{value}%</span>
            </div>
            <input
                type="range"
                min="0" max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span>0%</span><span>50%</span><span>100%</span>
            </div>
        </div>
    );

    return (
        <div className="pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto min-h-screen">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Preferences</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure how LabelLensAI analyzes food specifically for you.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {saveStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-xl ${saveStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {saveStatus === 'success' ? <Check size={18} /> : <ShieldAlert size={18} />}
                        {saveStatus === 'success' ? 'Preferences saved successfully.' : 'Failed to save preferences.'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Core Scoring Mechanics */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Health Profile */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                                <HeartPulse size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Health Profile</h2>
                                <p className="text-sm text-slate-500 font-medium">Auto-flag specific risks during scans.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                            <ToggleSwitch label="Diabetes (Low Sugar)" checked={prefs.healthConditions.diabetes} onChange={() => toggleNestedState('healthConditions', 'diabetes')} />
                            <ToggleSwitch label="Hypertension (Low Sodium)" checked={prefs.healthConditions.hypertension} onChange={() => toggleNestedState('healthConditions', 'hypertension')} />
                            <ToggleSwitch label="Lactose Intolerant" checked={prefs.healthConditions.lactoseIntolerant} onChange={() => toggleNestedState('healthConditions', 'lactoseIntolerant')} />
                            <ToggleSwitch label="Gluten Intolerant" checked={prefs.healthConditions.glutenIntolerant} onChange={() => toggleNestedState('healthConditions', 'glutenIntolerant')} />
                            <ToggleSwitch label="Nut Allergy" checked={prefs.healthConditions.nutAllergy} onChange={() => toggleNestedState('healthConditions', 'nutAllergy')} />
                            <ToggleSwitch label="Soy Allergy" checked={prefs.healthConditions.soyAllergy} onChange={() => toggleNestedState('healthConditions', 'soyAllergy')} />
                            <ToggleSwitch label="Egg Allergy" checked={prefs.healthConditions.eggAllergy} onChange={() => toggleNestedState('healthConditions', 'eggAllergy')} />
                        </div>
                    </div>

                    {/* Dietary Lifestyle Constraints */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                                <Salad size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Dietary Lifestyle</h2>
                                <p className="text-sm text-slate-500 font-medium">Configure lifestyle-specific ingredient warnings.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {Object.entries({
                                vegetarian: "Vegetarian", vegan: "Vegan", jain: "Jain", halal: "Halal",
                                highProtein: "High Protein", weightLoss: "Weight Loss", childSafe: "Child Safe"
                            }).map(([key, label]) => {
                                const isSelected = prefs.dietaryLifestyle[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleNestedState('dietaryLifestyle', key)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${isSelected
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Scoring Weights */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 to-transparent -z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                                    <SlidersHorizontal size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Algorithm Weighting</h2>
                                    <p className="text-sm text-slate-500 font-medium">Fine-tune how risk deductions are applied.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <RangeSlider label="Sugar Penalty Weight" value={prefs.scoringPriority.sugarWeight} onChange={(v) => updateNestedValue('scoringPriority', 'sugarWeight', v)} />
                                <RangeSlider label="Additives Penalty Weight" value={prefs.scoringPriority.additiveWeight} onChange={(v) => updateNestedValue('scoringPriority', 'additiveWeight', v)} />
                                <RangeSlider label="Preservatives Penalty Weight" value={prefs.scoringPriority.preservativeWeight} onChange={(v) => updateNestedValue('scoringPriority', 'preservativeWeight', v)} />
                                <RangeSlider label="Allergen Penalty Weight" value={prefs.scoringPriority.allergenWeight} onChange={(v) => updateNestedValue('scoringPriority', 'allergenWeight', v)} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Settings */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Risk Sensitivity Segmented */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                                <ShieldAlert size={20} />
                            </div>
                            <h2 className="font-bold text-slate-900">Risk Sensitivity</h2>
                        </div>

                        <div className="flex flex-col bg-slate-100 p-1.5 rounded-xl relative z-0">
                            {['conservative', 'moderate', 'lenient'].map((level) => {
                                const isActive = prefs.riskSensitivity.level === level;
                                return (
                                    <button
                                        key={level}
                                        onClick={() => updateNestedValue('riskSensitivity', 'level', level)}
                                        className="relative py-2.5 text-sm font-bold capitalize text-center z-10 w-full rounded-lg"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sensitivityActive"
                                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50 z-0"
                                            />
                                        )}
                                        <span className={`relative z-10 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{level}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                            {prefs.riskSensitivity.level === 'conservative' && "Strict scoring. Amplifies negative deductions by 25%."}
                            {prefs.riskSensitivity.level === 'moderate' && "Standard scoring. Baseline LabelLens AI calculations."}
                            {prefs.riskSensitivity.level === 'lenient' && "Forgiving scoring. Reduces negative deductions by 20%."}
                        </p>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                                <Bell size={20} />
                            </div>
                            <h2 className="font-bold text-slate-900">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            <ToggleSwitch label="Weekly Scans Summary" checked={prefs.notifications.weeklySummary} onChange={() => toggleNestedState('notifications', 'weeklySummary')} />
                            <ToggleSwitch label="Product Safety Alerts" checked={prefs.notifications.productUpdates} onChange={() => toggleNestedState('notifications', 'productUpdates')} />
                            <ToggleSwitch label="My Reports Resolved" checked={prefs.notifications.reportResolution} onChange={() => toggleNestedState('notifications', 'reportResolution')} />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 opacity-50 pointer-events-none">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
                                <Palette size={20} />
                            </div>
                            <h2 className="font-bold text-slate-900">Appearance (Soon)</h2>
                        </div>
                        <div className="space-y-4">
                            <ToggleSwitch label="Dark Mode" checked={prefs.appearance.darkMode} onChange={() => { }} />
                            <ToggleSwitch label="Compact UI Mode" checked={prefs.appearance.compactMode} onChange={() => { }} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Preferences;
