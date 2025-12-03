"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Calendar, Type, Check, Loader2 } from "lucide-react";
import Aurora from "@/components/Aurora";
import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function CreateEventWizard({ isLoggedIn }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        budget: 50,
        deadline: "",
    });

    // Auth State
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState("signup"); // 'signup' or 'login'
    const [authData, setAuthData] = useState({ email: "", password: "", name: "" });
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const createEvent = async () => {
        // Fix: Convert local datetime to ISO string for consistent backend parsing
        const isoDeadline = new Date(formData.deadline).toISOString();

        const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: formData.name,
                deadline: isoDeadline,
                // budget: formData.budget // Uncomment if backend supports it
            }),
        });

        if (res.ok) {
            const data = await res.json();
            // Redirect to the SPECIFIC event page
            router.push(`/event/${data._id}`);
            router.refresh();
            return true;
        } else if (res.status === 401) {
            return false; // Unauthorized
        } else {
            throw new Error("Failed to create event");
        }
    };

    const handleSubmit = async () => {
        // If user is not logged in, show auth overlay immediately
        if (!isLoggedIn) {
            setShowAuth(true);
            setAuthMode("signup"); // Default to signup
            return;
        }

        // User is logged in, proceed with creating event
        setLoading(true);
        try {
            const success = await createEvent();
            if (!success) {
                // Unlikely case: logged in but got 401, show auth overlay
                setShowAuth(true);
                setAuthMode("login");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);

        const isLogin = authMode === "login";
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        try {
            // 1. Perform Auth
            const authRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isLogin ? { email: authData.email, password: authData.password } : authData),
            });

            if (!authRes.ok) {
                const data = await authRes.json();
                throw new Error(data.error || (isLogin ? "Login failed" : "Signup failed"));
            }

            // 2. If Signup, ensure login (if API doesn't auto-login)
            if (!isLogin) {
                const loginRes = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: authData.email, password: authData.password }),
                });

                if (!loginRes.ok) {
                    throw new Error("Login failed after signup");
                }
            }

            // 3. Auto-Create Event
            const success = await createEvent();
            if (!success) {
                setAuthError("Authenticated, but failed to create event. Please try again.");
            }

        } catch (err) {
            setAuthError(err.message);
        } finally {
            setAuthLoading(false);
        }
    };

    // Live Preview Component
    const InvitationPreview = () => (
        <div className="w-full max-w-md mx-auto aspect-[3/4] bg-[#0a1f1c] rounded-xl border border-[#d4af37]/30 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

            <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full border border-[#d4af37] flex items-center justify-center">
                    <span className="text-2xl">🎄</span>
                </div>

                <div>
                    <p className="text-[#d4af37] text-xs uppercase tracking-[0.2em] mb-2">You are invited to</p>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                        {formData.name || "Event Name"}
                    </h2>
                </div>

                <div className="w-12 h-[1px] bg-[#d4af37]/50 mx-auto"></div>

                <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[#d4af37] uppercase text-[10px] tracking-widest">Budget</span>
                        <span className="font-serif text-xl">${formData.budget}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[#d4af37] uppercase text-[10px] tracking-widest">Exchange Date</span>
                        <span className="font-serif text-xl">
                            {formData.deadline ? new Date(formData.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Select Date"}
                        </span>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="px-6 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest rounded-sm">
                        RSVP Required
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden relative">
            {/* Back to Home Link - Only if not logged in */}
            {!isLoggedIn && (
                <div className="absolute top-6 left-6 z-20">
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 border border-white/5"
                    >
                        <ArrowLeft size={16} /> Back to home
                    </Link>
                </div>
            )}

            {/* Auth Overlay */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <GlassCard className="w-full max-w-md animate-scale-in relative">
                            <button
                                onClick={() => setShowAuth(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-serif font-bold mb-2 text-gold-gradient">
                                    {authMode === "login" ? "Login to Create Event" : "Create Account"}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {authMode === "login" ? "Welcome back! Login to save your event." : "Join us to create and manage your Secret Santa event."}
                                </p>
                            </div>

                            {authError && (
                                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{authError}</span>
                                </div>
                            )}

                            <form onSubmit={handleAuth} className="space-y-4">
                                {authMode === "signup" && (
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="John Doe"
                                            value={authData.name}
                                            onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="you@example.com"
                                        value={authData.email}
                                        onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="••••••••"
                                        value={authData.password}
                                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-6" disabled={authLoading}>
                                    {authLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        authMode === "login" ? "Login & Create Event" : "Sign Up & Create Event"
                                    )}
                                </button>

                                <div className="text-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                                    {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAuthMode(authMode === "signup" ? "login" : "signup");
                                            setAuthError("");
                                        }}
                                        className="text-primary hover:text-primary-hover font-semibold"
                                    >
                                        {authMode === "signup" ? "Login instead" : "Create account"}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Panel - Questions */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative z-10">
                <div className="max-w-md mx-auto w-full space-y-8">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <label className="block text-sm text-primary uppercase tracking-widest font-bold">
                                    Step 1 of 3
                                </label>
                                <h2 className="text-4xl font-serif font-bold">Name your event</h2>
                                <div className="relative">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Annual Office Party"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <label className="block text-sm text-primary uppercase tracking-widest font-bold">
                                    Step 2 of 3
                                </label>
                                <h2 className="text-4xl font-serif font-bold">Set a budget</h2>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between text-2xl font-mono text-primary">
                                        <span>${formData.budget}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                                        <span>$0</span>
                                        <span>$500+</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <label className="block text-sm text-primary uppercase tracking-widest font-bold">
                                    Step 3 of 3
                                </label>
                                <h2 className="text-4xl font-serif font-bold">When is the exchange?</h2>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-8">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!formData.name && step === 1}
                                className="btn-primary flex items-center gap-2 px-6 py-3"
                            >
                                Next Step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.deadline}
                                className="btn-primary flex items-center gap-2 px-8 py-3"
                            >
                                {loading ? "Creating..." : "Create Event"} <Check size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="hidden md:flex w-1/2 bg-black/20 backdrop-blur-3xl items-center justify-center relative p-8">
                <div className="absolute inset-0 overflow-hidden">
                    <Aurora colorStops={["#0a1f1c", "#000000", "#1a2f2b"]} amplitude={0.5} />
                </div>
                <div className="relative z-10 w-full">
                    <p className="text-center text-white/30 uppercase tracking-widest text-xs mb-8">Live Preview</p>
                    <InvitationPreview />
                </div>
            </div>
        </div>
    );
}
