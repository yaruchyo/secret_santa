"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { Loader2 } from "lucide-react";

export default function JoinClient({ isLoggedIn }) {
    const [code, setCode] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "", name: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleJoin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/events/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.toUpperCase() }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/event/${data.eventId}`);
            } else if (res.status === 401) {
                setShowSignup(true);
                setError("Please sign up or login to join this event");
            } else {
                setError(data.error || "Failed to join event");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const signupRes = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!signupRes.ok) {
                const data = await signupRes.json();
                throw new Error(data.error || "Signup failed");
            }

            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            if (!loginRes.ok) {
                throw new Error("Login failed after signup");
            }

            const joinRes = await fetch("/api/events/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.toUpperCase() }),
            });

            const joinData = await joinRes.json();

            if (joinRes.ok) {
                router.push(`/event/${joinData.eventId}`);
                router.refresh();
            } else {
                setError(joinData.error || "Failed to join event");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSignup) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
                <div className="absolute top-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

                <div className="relative z-10 w-full flex justify-center">
                    <GlassCard className="w-full max-w-md animate-scale-in">
                        <div className="text-center mb-6">
                            <span className="text-5xl mb-4 inline-block animate-float">🎉</span>
                            <h1 className="text-2xl font-serif font-bold mb-2 text-gold-gradient">Create Account to Join</h1>
                            <p className="text-gray-400 text-sm">
                                Event Code: <span className="text-primary font-mono font-bold text-lg">{code}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-primary text-background-secondary font-bold py-3 rounded-xl hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 mt-6" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "✨ Sign Up & Join Event"
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                                Already have an account?{" "}
                                <Link href={`/login?code=${code}`} className="text-primary hover:text-primary-hover font-semibold">
                                    Login instead
                                </Link>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            <div className="absolute top-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

            <div className="relative z-10 w-full flex justify-center">
                <GlassCard className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <span className="text-5xl mb-4 inline-block animate-float">🎉</span>
                        <h1 className="text-3xl font-serif font-bold mb-3 text-gold-gradient">Join an Event</h1>
                        <p className="text-gray-400">
                            Enter the invitation code shared by the event organizer
                        </p>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label className="block text-center text-xs uppercase tracking-widest text-gray-500 mb-2">Invitation Code</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] uppercase font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="ABC123"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Enter the 6-character code
                            </p>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-4">
                            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex-1 py-3 text-center rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="flex-1 bg-primary text-background-secondary font-bold py-3 rounded-xl hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || code.length < 6}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "🚀 Join Event"
                                )}
                            </button>
                        </div>
                    </form>

                    {!isLoggedIn && (
                        <div className="mt-8 text-center pt-6 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Don't have an account?</p>
                            <button
                                onClick={() => setShowSignup(true)}
                                className="text-primary hover:text-primary-hover font-semibold transition-colors"
                            >
                                Create account to join →
                            </button>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
