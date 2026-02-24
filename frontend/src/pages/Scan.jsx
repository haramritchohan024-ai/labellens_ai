import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scan as ScanIcon, Upload, FileText, CheckCircle, AlertTriangle, Loader, ChevronRight, ClipboardPaste, Brain, Zap, Stethoscope, Activity, Heart, Baby, Users, ShieldAlert, Sparkles, Tag, Layers } from 'lucide-react';

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

const HEALTH_OPTIONS = [
    { label: "Diabetes", icon: <Stethoscope size={14} /> },
    { label: "BP / Sodium", icon: <Heart size={14} /> },
    { label: "Kidney", icon: <Activity size={14} /> },
    { label: "Cholesterol", icon: <Heart size={14} /> },
    { label: "Child", icon: <Baby size={14} /> },
    { label: "Pregnancy", icon: <Users size={14} /> } // Approximate for pregnancy
];

const SENSITIVITY_OPTIONS = [
    { label: "Headaches", icon: <ShieldAlert size={14} /> }, // Approximations
    { label: "Acidity", icon: <AlertTriangle size={14} /> },
    { label: "Bloating", icon: <Activity size={14} /> },
    { label: "Skin Rashes", icon: <Sparkles size={14} /> },
    { label: "Nausea", icon: <Activity size={14} /> },
    { label: "Hyperactivity", icon: <Zap size={14} /> }
];

const Scan = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Category Override State
    const [overridePrimary, setOverridePrimary] = useState('');
    const [overrideSecondary, setOverrideSecondary] = useState('');
    const [healthProfile, setHealthProfile] = useState([]);
    const [sensitivityProfile, setSensitivityProfile] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            // Auto trigger OCR
            handleOcr(selectedFile);
        }
    };

    const handleOcr = async (imageFile) => {
        setIsOcrLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const res = await axios.post('http://localhost:5000/api/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setExtractedText(res.data.extractedText);
        } catch (error) {
            console.error(error);
            alert('Failed to scan image. Please try again or type manually.');
        } finally {
            setIsOcrLoading(false);
        }
    };

    const toggleProfile = (item, list, setList) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setExtractedText(text);
        } catch (error) {
            console.error('Failed to read clipboard contents: ', error);
        }
    };

    const handleAnalyze = async () => {
        if (!extractedText.trim()) return alert("Please extract text or paste ingredients.");

        // If user selected a primary but not a secondary, require it for accuracy.
        if (overridePrimary && !overrideSecondary) {
            return alert("Please select a specific Secondary Category for accurate matching.");
        }

        setIsAnalyzing(true);
        try {
            const payload = {
                text: extractedText,
                overridePrimary: overridePrimary || null,
                overrideSecondary: overrideSecondary || null
            };

            const res = await axios.post('http://localhost:5000/api/analyze-safety', payload);

            navigate('/results', { state: { ...res.data, extractedText } });
        } catch (error) {
            console.error("Analysis API Error:", error);
            const errMsg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Analysis failed: ${errMsg}. Please try again.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-[100vh] pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0f172a] dark:to-[#111827] transition-colors duration-300">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Scanning line */}
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent blur-[1px] shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-scanning-line"></div>

                {/* Gradient Blobs */}
                <div className="absolute top-1/4 left-[10%] w-[30rem] h-[30rem] bg-brand-400/20 rounded-full blur-[120px] animate-blob-spin mix-blend-multiply opacity-70"></div>
                <div className="absolute bottom-1/4 right-[10%] w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[120px] animate-blob-spin mix-blend-multiply opacity-70" style={{ animationDelay: '-5s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto space-y-4 animate-[fadeIn_0.8s_ease-out]">
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white tracking-tight leading-tight transition-colors duration-300">
                        Scan Ingredients with AI Precision
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
                        Smart AI-powered additive detection. Discover what's really inside your food.
                    </p>
                </div>

                {/* 3-Column Main Content */}
                <div className="grid lg:grid-cols-3 gap-6 items-stretch min-h-[400px]">

                    {/* Left: Upload Card */}
                    <div className="glass-panel rounded-[24px] p-6 flex flex-col group hover:-translate-y-1 transition-all duration-300 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-brand-500 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500 -z-10"></div>
                        <div className="absolute inset-0 rounded-[24px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <ScanIcon size={18} className="text-brand-600 dark:text-brand-400" />
                                    Upload Image
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clear photo of ingredients list</p>
                            </div>
                        </div>

                        <label className="flex flex-col items-center justify-center flex-1 w-full border-2 border-brand-300 dark:border-brand-500/50 border-dashed rounded-[20px] cursor-pointer bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all group/upload overflow-hidden relative min-h-[250px]">
                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                        <span className="bg-white/90 glass-panel text-gray-800 font-semibold px-5 py-2.5 rounded-full text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover/upload:translate-y-0 transition-transform duration-300">
                                            <Upload size={16} /> Replace Image
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center px-4">
                                    <div className="mb-4 p-4 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400 group-hover/upload:scale-110 group-hover/upload:-translate-y-1 transition-transform duration-300 shadow-sm">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium tracking-wide">
                                        <span className="text-brand-600 dark:text-brand-400">Click to upload</span>
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG (MAX. 5MB)</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                    </div>

                    {/* Center: AI Visual */}
                    <div className="flex items-center justify-center p-8 relative min-h-[300px] lg:min-h-full">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Outer rotating ring */}
                            <div className="absolute inset-0 rounded-full border border-white/40 shadow-[inset_0_0_30px_rgba(255,255,255,0.5)] bg-white/10 backdrop-blur-sm"></div>
                            <div className="absolute -inset-4 border-2 border-dashed border-brand-300 rounded-full animate-[spin_30s_linear_infinite] opacity-50"></div>

                            {/* Inner glowing orb */}
                            <div className="relative w-24 h-24 bg-gradient-to-tr from-brand-400 to-accent-light rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-orb-pulse z-10 backdrop-blur-md">
                                <div className="absolute inset-1 bg-white/20 rounded-full mix-blend-overlay"></div>
                                {isAnalyzing ? (
                                    <Loader className="w-8 h-8 text-white animate-spin" />
                                ) : isOcrLoading ? (
                                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                ) : (
                                    <Brain className="w-8 h-8 text-white" />
                                )}
                            </div>

                            {/* Connection dots (decorative) */}
                            <div className="absolute top-0 right-10 w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                            <div className="absolute bottom-10 left-0 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                        </div>
                    </div>

                    {/* Right: Ingredients Text & Action */}
                    <div className="glass-panel rounded-[24px] p-6 flex flex-col group hover:-translate-y-1 transition-all duration-300 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-brand-400 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500 -z-10"></div>

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                                    Ingredients List
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review text before scanning</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOcrLoading && (
                                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div> Extracting
                                    </span>
                                )}
                                <button
                                    onClick={handlePaste}
                                    className="text-xs font-medium text-gray-600 dark:text-gray-300 glass-panel px-3 py-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 shadow-sm border-white/40 dark:border-white/10"
                                >
                                    <ClipboardPaste size={14} /> Paste
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-1 flex flex-col mb-6">
                            <textarea
                                className="flex-1 w-full p-4 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-[16px] shadow-inner focus:ring-2 focus:ring-brand-400 dark:focus:ring-brand-500 focus:outline-none text-sm font-mono text-gray-700 dark:text-gray-200 leading-relaxed resize-none transition-shadow placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-md min-h-[150px]"
                                placeholder="Paste or extract ingredients text..."
                                value={extractedText}
                                onChange={(e) => setExtractedText(e.target.value)}
                            ></textarea>
                            <div className="absolute bottom-3 right-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-neutral-800/80 px-2 py-0.5 rounded-full shadow-sm">
                                {extractedText.length} chars
                            </div>
                        </div>

                        {/* Scan Now Button moved inside right card */}
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !extractedText}
                            className={`
                                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                                ${isAnalyzing || !extractedText
                                    ? 'bg-white/40 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none border border-white/20 dark:border-white/5'
                                    : 'text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 relative overflow-hidden group/btn border border-brand-400/50 dark:border-brand-500/50'}
                            `}
                        >
                            {/* Shimmer effect */}
                            {!(isAnalyzing || !extractedText) && (
                                <div className="absolute inset-0 -translate-x-full overflow-hidden rounded-xl group-hover/btn:animate-[shimmer_1.5s_infinite]">
                                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                                </div>
                            )}

                            {isAnalyzing ? (
                                <><Loader className="animate-spin w-5 h-5 text-white z-10" /> <span className="z-10 relative">Analyzing...</span></>
                            ) : (
                                <><Sparkles className="w-5 h-5 z-10 relative" /> <span className="z-10 relative">Analyze Safety Score</span></>
                            )}
                        </button>

                        {/* New Hybrid Category User Override Dropdowns */}
                        <div className="mt-6 p-4 rounded-[16px] bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30">
                            <h4 className="text-sm font-bold text-brand-800 dark:text-brand-300 mb-1 flex items-center gap-1.5">
                                <Tag size={14} /> Category Override (Optional)
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">If blank, our AI will automatically classify the product.</p>

                            <div className="space-y-3">
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={overridePrimary}
                                        onChange={(e) => {
                                            setOverridePrimary(e.target.value);
                                            setOverrideSecondary(''); // reset secondary when primary changes
                                        }}
                                        className="w-full text-sm pl-9 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-gray-700 dark:text-gray-200 appearance-none shadow-sm"
                                    >
                                        <option value="">Auto-detect Focus Category...</option>
                                        {Object.keys(CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {overridePrimary && (
                                    <div className="relative animate-[fadeIn_0.3s_ease-out]">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                                        <select
                                            value={overrideSecondary}
                                            onChange={(e) => setOverrideSecondary(e.target.value)}
                                            className="w-full text-sm pl-9 pr-3 py-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none text-brand-800 dark:text-brand-200 appearance-none shadow-sm"
                                        >
                                            <option value="">Select Specific Type...</option>
                                            {CATEGORIES[overridePrimary].map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Profile Personalization */}
                <div className="glass-panel p-8 rounded-[24px] relative group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-brand-100 rounded-[24px] blur opacity-30 group-hover:opacity-50 transition duration-500 -z-10"></div>

                    <div className="text-center mb-8">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Personalize Your Scan</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customize your scan for more accurate health-based analysis.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Health Goals */}
                        <div className="bg-white/40 dark:bg-white/5 p-6 rounded-[20px] border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4 text-brand-700 dark:text-brand-400">
                                <Stethoscope size={20} className="text-brand-500 dark:text-brand-400" />
                                <h4 className="font-semibold tracking-wide">Health Goals</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {HEALTH_OPTIONS.map(opt => (
                                    <button
                                        key={opt.label}
                                        onClick={() => toggleProfile(opt.label, healthProfile, setHealthProfile)}
                                        className={`
                                            flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-all duration-300 border backdrop-blur-sm
                                            ${healthProfile.includes(opt.label)
                                                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/30 border-brand-400 dark:border-brand-500 scale-105'
                                                : 'bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-white/60 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500 hover:bg-white/90 dark:hover:bg-white/10 hover:text-brand-700 dark:hover:text-brand-300 shadow-sm'}
                                        `}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sensitivities */}
                        <div className="bg-white/40 dark:bg-white/5 p-6 rounded-[20px] border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4 text-orange-700 dark:text-orange-400">
                                <Zap size={20} className="text-orange-500 dark:text-orange-400" />
                                <h4 className="font-semibold tracking-wide">Sensitivities</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {SENSITIVITY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.label}
                                        onClick={() => toggleProfile(opt.label, sensitivityProfile, setSensitivityProfile)}
                                        className={`
                                            flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-all duration-300 border backdrop-blur-sm
                                            ${sensitivityProfile.includes(opt.label)
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md shadow-orange-500/30 border-orange-400 dark:border-orange-500 scale-105'
                                                : 'bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-white/60 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-white/90 dark:hover:bg-white/10 hover:text-orange-700 dark:hover:text-orange-300 shadow-sm'}
                                        `}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Scan;
