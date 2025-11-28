"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import { ArrowRight, Gift, Sparkles, LayoutDashboard } from "lucide-react";

export default function HomeClient({ isLoggedIn }) {
    return (
        <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
            {/* Background */}
            <Aurora
                colorStops={["#0a1f1c", "#1a2f2b", "#d4af37"]}
                speed={0.5}
                amplitude={1.2}
            />

            {/* Navigation */}
            <StaggeredMenu />
            <FloatingDock />

            {/* Hero Section */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
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
                        Start Your <br />
                        <span className="text-gold-gradient italic">Tradition</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Elevate your gift exchange with a sophisticated Secret Santa experience.
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
            </div>

            {/* Features / Social Proof (Subtle) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 text-white/40 text-sm font-medium tracking-widest uppercase"
            >
                <div className="flex items-center gap-2">
                    <Sparkles size={14} /> Premium Experience
                </div>
                <div className="flex items-center gap-2">
                    <Gift size={14} /> Smart Matching
                </div>
            </motion.div>
        </main>
    );
}
