"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import { ArrowRight, Gift, Sparkles, LayoutDashboard } from "lucide-react";

export default function HomeClient({ isLoggedIn }) {
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col items-center text-center px-4">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Aurora
                    colorStops={["#0a1f1c", "#1a2f2b", "#d4af37"]}
                    speed={0.5}
                    amplitude={1.2}
                />
            </div>

            {/* Navigation */}
            <StaggeredMenu />
            <FloatingDock />

            {/* Hero Section */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 min-h-screen flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium tracking-wider uppercase backdrop-blur-md">
                        The Art of Giving
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white drop-shadow-lg">
                        Start Your Secret Santa <br />
                        <span className="text-gold-gradient italic">Tradition</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        The premium Secret Santa generator for your holiday gift exchanges.
                        Seamlessly organize, match, and celebrate with style.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link href="/create">
                        <button className="group relative px-8 py-4 bg-primary text-background-secondary font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center gap-2 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Create Event <ArrowRight size={20} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </button>
                    </Link>

                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <button className="group px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                                My Dashboard <LayoutDashboard size={20} className="text-primary" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/join">
                            <button className="group px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                                Join Existing <Gift size={20} className="text-primary" />
                            </button>
                        </Link>
                    )}
                </motion.div>

                {!isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="pt-4"
                    >
                        <Link href="/login" className="text-sm text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">
                            Don't have an account? Create one
                        </Link>
                    </motion.div>
                )}

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex justify-center"
                >
                    <div className="animate-bounce text-white/30">
                        <ArrowRight className="rotate-90" size={24} />
                    </div>
                </motion.div>
            </div>

            {/* SEO Content Section */}
            <article className="relative z-10 max-w-4xl mx-auto pb-24 space-y-24 text-left">
                {/* Features */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        Why Choose <span className="text-primary">Everyone Santa</span>?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <Sparkles className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Smart Matching</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Our advanced algorithm ensures fair and random assignments, preventing self-matches and handling exclusions effortlessly.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <Gift className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Wishlist Management</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Create and share detailed wishlists. Participants can view their match's preferences without spoiling the surprise.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <LayoutDashboard className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Event Dashboard</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Manage multiple events, track RSVPs, and communicate with participants all from a sleek, centralized dashboard.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        How to Organize a <span className="text-primary">Secret Santa</span>
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Create Your Event</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Sign up and create a new event. Set the date, budget limit, and add a personal message for your guests.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Invite Participants</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Share the unique invite link with your friends, family, or colleagues. They can join instantly and add their wishlists.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Draw Names</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Once everyone has joined, start the matching ceremony. Everyone receives their assignment via email or directly on the dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </main>
    );
}
