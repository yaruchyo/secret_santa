"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { Gift, ArrowLeft, Loader2 } from "lucide-react";

function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: "", password: "", name: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            if (isLogin) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                // Auto-login after signup
                try {
                    const loginRes = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: formData.email, password: formData.password }),
                    });

                    if (loginRes.ok) {
                        router.push(callbackUrl);
                        router.refresh();
                    } else {
                        // Fallback if auto-login fails
                        setIsLogin(true);
                        setError("");
                        setFormData({ email: formData.email, password: formData.password, name: "" });
                        alert("Account created! Please login.");
                    }
                } catch (loginErr) {
                    console.error("Auto-login failed:", loginErr);
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }}></div>

            <div className="relative z-10 w-full flex items-center justify-center">
                <GlassCard className="w-full max-w-md p-8 shadow-2xl animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-4 hover:scale-110 transition-transform">
                            <Gift size={48} className="text-primary mx-auto" />
                        </Link>
                        <h1 className="text-3xl font-serif font-bold mb-2 text-gold-gradient">
                            {isLogin ? "Welcome Back" : "Join the Fun"}
                        </h1>
                        <p className="text-gray-400">
                            {isLogin
                                ? "Sign in to continue your Secret Santa journey"
                                : "Create an account to get started"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="animate-fade-in">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-background-secondary font-bold py-3 rounded-xl hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="text-sm text-gray-400 mb-3">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </p>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="text-primary hover:text-white font-semibold transition-all border-b-2 border-primary/30 hover:border-primary pb-0.5"
                        >
                            {isLogin ? "Create an account →" : "← Back to login"}
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Back to Home Link */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 border border-white/5"
                >
                    <ArrowLeft size={16} /> Back to home
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
