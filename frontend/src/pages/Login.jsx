import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Leaf, Shield, ArrowRight, UserCircle, Apple, Carrot, Milk, ClipboardList, Grape } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true); // true = User, false = Admin
    const [isRegistering, setIsRegistering] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            let endpoint = '';
            let payload = {};

            if (!isLoginView) {
                // Admin Login
                endpoint = '/api/auth/admin-login';
                payload = { password };
            } else if (isRegistering) {
                // User Register
                endpoint = '/api/auth/register';
                payload = { name, email, password };
            } else {
                // User Login
                endpoint = '/api/auth/login';
                payload = { email, password };
            }

            const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
            if (res.data.success) {
                login(
                    {
                        _id: res.data._id,
                        name: res.data.name,
                        email: res.data.email,
                        role: res.data.role
                    },
                    res.data.token
                );

                if (res.data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Slow floating animation properties
    const floatingAnimation = {
        y: ["0%", "-10%", "0%"],
        transition: {
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
        }
    };

    const reverseFloatingAnimation = {
        y: ["0%", "10%", "0%"],
        transition: {
            duration: 7,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 1
        }
    };

    return (
        // Layer 1: Background gradient for the entire page
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-green-50 flex-col md:flex-row relative z-0"
        >

            {/* LEFT PANEL */}
            <div className="hidden md:flex md:w-[45%] lg:w-[40%] relative overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 items-center justify-center z-10 shadow-2xl">

                {/* Layer: Radial highlight behind heading */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(16,185,129,0.2),_transparent_60%)]"></div>

                {/* Layer: Very light grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

                {/* Layer 2: Floating food illustrations (SVG outlines) */}
                <motion.div className="absolute top-[20%] left-[15%] text-emerald-300 opacity-[0.12]" animate={floatingAnimation}>
                    <Apple size={64} strokeWidth={1} />
                </motion.div>
                <motion.div className="absolute bottom-[25%] left-[20%] text-emerald-300 opacity-[0.15]" animate={reverseFloatingAnimation}>
                    <Carrot size={72} strokeWidth={1} />
                </motion.div>
                <motion.div className="absolute top-[35%] right-[15%] text-emerald-200 opacity-[0.1]" animate={floatingAnimation}>
                    <Grape size={56} strokeWidth={1} />
                </motion.div>
                <motion.div className="absolute bottom-[15%] right-[25%] text-emerald-100 opacity-[0.12]" animate={reverseFloatingAnimation}>
                    <Milk size={60} strokeWidth={1} />
                </motion.div>
                <motion.div className="absolute top-[60%] left-[10%] text-emerald-400 opacity-[0.08]" animate={floatingAnimation}>
                    <ClipboardList size={48} strokeWidth={1} />
                </motion.div>

                {/* Layer 3: Left panel text content */}
                <div className="relative z-20 p-12 text-center md:text-left max-w-lg">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <h1 className="text-5xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent leading-tight">
                            Decipher your food. <br /> Defend your health.
                        </h1>
                        <p className="text-lg font-medium text-emerald-100/80 mb-8 leading-relaxed">
                            Join LabelLensAI to track your scans, bookmark safe alternatives, and unlock intelligent health insights securely.
                        </p>
                        <div className="flex items-center gap-3 text-emerald-200/90 bg-emerald-800/30 w-fit px-4 py-2 rounded-full border border-emerald-700/50 backdrop-blur-md">
                            <Leaf size={16} className="text-emerald-400" />
                            <span className="font-bold uppercase tracking-widest text-xs">Powered by Advanced AI</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT PANEL: Auth Form */}
            <div className="w-full md:w-[55%] lg:w-[60%] flex items-center justify-center p-6 md:p-12 relative z-10 pt-28 md:pt-12">

                {/* Radial Gradient Spotlight behind card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-200 rounded-full opacity-20 blur-[80px] pointer-events-none z-0"></div>

                {/* Layer 4: Glass Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-8 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] relative z-10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-shadow duration-500"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-2xl mb-5 shadow-inner border border-emerald-100/50"
                        >
                            <Shield className="w-7 h-7 text-emerald-600" />
                        </motion.div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium mt-1.5 text-sm">Securely sign in to continue your journey.</p>
                    </div>

                    {/* Segmented Pill Toggle */}
                    <div className="flex bg-slate-100/80 p-1.5 rounded-full mb-8 relative border border-slate-200/50 shadow-inner">
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-500 rounded-full shadow-md z-0"
                            animate={{ left: isLoginView ? '6px' : 'calc(50% + 0px)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                        <button
                            type="button"
                            onClick={() => { setIsLoginView(true); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${isLoginView ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <UserCircle size={16} /> User
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLoginView(false); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${!isLoginView ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Shield size={16} /> Admin
                        </button>
                    </div>

                    {/* Animated Form Wrapper */}
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLoginView ? (isRegistering ? 'register' : 'user') : 'admin'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {/* Error Banner */}
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2 border border-red-100">
                                    <Shield size={16} className="shrink-0" /> {error}
                                </motion.div>
                            )}

                            {isLoginView && isRegistering && (
                                <div className="space-y-1.5 group">
                                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                                            <UserCircle className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {isLoginView && (
                                <div className="space-y-1.5 group">
                                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                                            <Leaf className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 group">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                                    {isLoginView ? "Password" : "Master Passkey"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-slate-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 text-sm tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${isLoginView
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-emerald-500/25 border border-emerald-600/50'
                                        : 'bg-slate-900 hover:bg-black hover:shadow-slate-900/20 border border-slate-900'
                                    } disabled:opacity-70 disabled:hover:translate-y-0`}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {isLoginView ? (isRegistering ? 'Create Account' : 'Sign In Securely') : 'Authenticate Console'}
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            {isLoginView && (
                                <p className="text-center text-slate-500 font-medium text-sm mt-5 pt-4 border-t border-slate-100">
                                    {isRegistering ? "Already have an account? " : "New to LabelLens? "}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                                    >
                                        {isRegistering ? 'Login here' : 'Create an account'}
                                    </button>
                                </p>
                            )}

                        </motion.form>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Login;
