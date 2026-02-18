import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Hero Section */}
            {/* Hero Section */}
            <header className="relative pt-24 pb-32 flex flex-col items-center justify-center min-h-screen overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                <div className="container relative mx-auto px-6 z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-7xl">
                    <div className="w-full lg:w-1/2 text-left mb-12 lg:mb-0">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-green-800 uppercase bg-green-100 rounded-full">
                                AI-Powered Food Intelligence
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900 mb-8 tracking-tight">
                                Scan Labels. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
                                    Decode Additives.
                                </span> <br />
                                Know the Risks.
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                                Instantly identify hidden E-numbers, check BIS/FSSAI compliance, and get a Label Transparency Score.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link to="/scan" className="px-10 py-5 bg-gray-900 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                                    <Scan size={24} /> Scan Label
                                </Link>
                                <Link to="/about" className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 font-bold text-lg rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center shadow-sm hover:shadow-md">
                                    How it Works
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Graphic */}
                    <div className="w-full lg:w-1/2 flex justify-center relative">
                        <motion.img
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            src="https://images.unsplash.com/photo-1540914124281-342587941389?q=80&w=2674&auto=format&fit=crop"
                            alt="Healthy Food Ingredients"
                            className="rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-10 w-full max-w-xl object-cover hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)] transition-shadow duration-500"
                        />
                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-5 md:right-10 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                        >
                            <div className="bg-green-100 px-3 py-1 rounded-full text-green-700 font-bold text-xs uppercase tracking-wider">
                                Transparency Score
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">8.5</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -left-5 md:left-10 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                        >
                            <div className="bg-red-100 p-2 rounded-full text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Detected</p>
                                <p className="text-sm font-bold text-gray-900">E621 (MSG)</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Premium Features Section */}
            <section className="py-20 bg-white rounded-t-[50px] -mt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why LabelLens?</h2>
                        <p className="text-gray-500">Regulatory compliance and safety checks for the modern consumer.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-gray-50 p-8 rounded-3xl border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 mb-6">
                                <Scan size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Decoding</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Our OCR identifies E-numbers (e.g., E102, INS 211) and hidden chemical names instantly.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-gray-50 p-8 rounded-3xl border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 mb-6">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">BIS & FSSAI Checks</h3>
                            <p className="text-gray-500 leading-relaxed">
                                See which additives are permitted, restricted, or require warning labels under Indian regulations.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-gray-50 p-8 rounded-3xl border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 mb-6">
                                <Heart size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency Score</h3>
                            <p className="text-gray-500 leading-relaxed">
                                We rate the label's clarity. Vague terms like "flavours" or "edible oil" lower the score.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
