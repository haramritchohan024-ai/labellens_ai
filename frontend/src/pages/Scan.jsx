import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader, ChevronRight } from 'lucide-react';

const HEALTH_OPTIONS = [
    "Diabetes / Sugar Control", "BP / Sodium Sensitivity", "Kidney Sensitivity",
    "Cholesterol / Heart Focus", "Child under 12", "Pregnancy",
    "Gut Sensitivity", "Milk Allergy", "Soy Allergy", "Gluten Sensitivity"
];

const SENSITIVITY_OPTIONS = [
    "Headaches / Migraines", "Acidity / Heartburn", "Bloating / Gas",
    "Skin Rashes", "Nausea", "Mouth Ulcers", "Fatigue / Brain Fog",
    "High Thirst", "Palpitations", "Child Hyperactivity"
];

const Scan = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    // Debug Mode State
    const [debugMode, setDebugMode] = useState(false);

    const toggleProfile = (item, list, setList) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const handleAnalyze = async () => {
        if (!extractedText.trim()) return alert("Please extract text or paste ingredients.");

        setIsAnalyzing(true);
        try {
            const res = await axios.post('http://localhost:5000/api/analyze', {
                ingredientsText: extractedText,
                healthProfile,
                sensitivityProfile,
                debugMode
            });

            // Allow saving history (optional step, or done automatically in backend? 
            // Prompt implied user history page availability. 
            // We can save to history here or rely on the user to save. 
            // For now, let's just save automatically for seamless UX)
            await axios.post('http://localhost:5000/api/history/save', { // basic save
                extractedText,
                ...res.data
            }).catch(e => console.error("History save error", e));

            navigate('/results', { state: res.data });
            navigate('/results', { state: res.data });
        } catch (error) {
            console.error("Analysis API Error:", error);
            const errMsg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Analysis failed: ${errMsg}. Please try again.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Scan Your Food Label</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Upload a clear photo of the ingredients list or paste the text below.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Upload & Preview */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 mb-3 text-green-500" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* Right: Text Editor */}
                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FileText size={20} /> Ingredients Text
                            </h3>
                            {isOcrLoading && <span className="text-xs text-green-600 animate-pulse flex items-center gap-1"><Loader size={12} className="animate-spin" /> Extracting...</span>}
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-mono bg-gray-50 resize-none"
                            placeholder="Extracted text will appear here. You can also paste text manually."
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2 text-right">Edit to correct OCR errors</p>
                    </div>
                </div>

                {/* Profile Personalization */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Personalize Your Scan (Optional)</h3>

                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Health Goals</h4>
                        <div className="flex flex-wrap gap-2">
                            {HEALTH_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleProfile(opt, healthProfile, setHealthProfile)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${healthProfile.includes(opt)
                                        ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-orange-600 mb-3 uppercase tracking-wide">Sensitivities / Symptoms</h4>
                        <div className="flex flex-wrap gap-2">
                            {SENSITIVITY_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleProfile(opt, sensitivityProfile, setSensitivityProfile)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${sensitivityProfile.includes(opt)
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !extractedText}
                        className={`
                            px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl flex items-center gap-3 transition-all transform hover:-translate-y-1
                            ${isAnalyzing || !extractedText ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'}
                        `}
                    >
                        {isAnalyzing ? (
                            <><Loader className="animate-spin" /> Analyzing...</>
                        ) : (
                            <><CheckCircle /> Analyze Safety Score</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Scan;
