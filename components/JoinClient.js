"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { Loader2 } from "lucide-react";

export default function JoinClient({ isLoggedIn }) {
    const [code, setCode] = useState("");
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState("signup"); // 'signup' or 'login'
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
                setShowAuth(true);
                setAuthMode("signup"); // Default to signup for new users, but they can switch
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

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const isLogin = authMode === "login";
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        try {
            // Step 1: Perform Auth (Login or Signup)
            const authRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData),
            });

            if (!authRes.ok) {
                const data = await authRes.json();
                throw new Error(data.error || (isLogin ? "Login failed" : "Signup failed"));
            }

            // If Signup was successful, we usually need to login automatically or the API might already set the cookie.
            // Assuming the signup API creates the user but might not set the session cookie for immediate login depending on implementation.
            // If your /api/auth/signup DOES NOT log the user in automatically, we need to call login.
            // Based on previous code, it seems we did an explicit login after signup. Let's keep that pattern if we are in signup mode.

            if (!isLogin) {
                const loginRes = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, password: formData.password }),
                });

                if (!loginRes.ok) {
                    throw new Error("Login failed after signup");
                }
            }

            // Step 2: Branching Logic based on Invitation Code
            const hasCode = code && code.trim().length > 0;

            if (hasCode) {
                // IF Code exists: Call Join API
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
                    // Account created/logged in, but join failed (e.g., full event or bad code)
                    setError(joinData.error || "Authenticated, but failed to join event.");
                    // We might want to close the auth modal here to let them try the code again,
                    // but keeping it open with the error is also fine so they know what happened.
                    // For better UX, let's close the auth modal so they see the main join screen with the error?
                    // Or just show the error in the modal. Let's show in modal for now.
                }
            } else {
                // IF NO Code: Redirect to Dashboard immediately
                router.push("/dashboard");
                router.refresh();
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
                <div className="absolute top-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

                <div className="relative z-10 w-full flex justify-center">
                    <GlassCard className="w-full max-w-md animate-scale-in">
                        <div className="text-center mb-6">
                            <span className="text-5xl mb-4 inline-block animate-float">🎉</span>

                            <h1 className="text-2xl font-serif font-bold mb-2 text-gold-gradient">
                                {authMode === "login" ? "Welcome Back" : "Create Account"}
                            </h1>

                            {/* Only show code display if code exists */}
                            {code && (
                                <p className="text-gray-400 text-sm">
                                    Event Code: <span className="text-primary font-mono font-bold text-lg">{code}</span>
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
                                <span>⚠️</span>
                                <span>{error}</span>
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                        Processing...
                                    </>
                                ) : (
                                    code ? (authMode === "login" ? "Login & Join Event" : "Sign Up & Join Event") : (authMode === "login" ? "Login" : "Create Account")
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                                {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthMode(authMode === "signup" ? "login" : "signup");
                                        setError("");
                                    }}
                                    className="text-primary hover:text-primary-hover font-semibold"
                                >
                                    {authMode === "signup" ? "Login instead" : "Create account"}
                                </button>
                            </div>
                        </form>
                        <div className="text-center mt-2">
                            <button
                                onClick={() => setShowAuth(false)}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    // Default "Join" View
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
                                onClick={() => {
                                    setShowAuth(true);
                                    setAuthMode("signup");
                                }}
                                className="text-primary hover:text-primary-hover font-semibold transition-colors"
                            >
                                {code ? "Create account to join →" : "Create account without code →"}
                            </button>
                            <div className="mt-2">
                                <button
                                    onClick={() => {
                                        setShowAuth(true);
                                        setAuthMode("login");
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    Already have an account? Login
                                </button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}