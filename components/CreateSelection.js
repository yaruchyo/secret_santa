"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Aurora from "@/components/Aurora";
import CreateEventWizard from "@/components/CreateEventWizard";
import CreateWishlistWizard from "@/components/CreateWishlistWizard";

export default function CreateSelection({ isLoggedIn }) {
    const [selection, setSelection] = useState(null); // 'event', 'wishlist', or null

    if (selection === 'event') {
        return (
            <div className="relative">
                <button
                    onClick={() => setSelection(null)}
                    className="absolute top-6 left-6 z-50 text-gray-400 hover:text-white flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 border border-white/5"
                >
                    <ArrowLeft size={16} /> Back to Selection
                </button>
                <CreateEventWizard isLoggedIn={isLoggedIn} />
            </div>
        );
    }

    if (selection === 'wishlist') {
        return (
            <div className="relative">
                <button
                    onClick={() => setSelection(null)}
                    className="absolute top-6 left-6 z-50 text-gray-400 hover:text-white flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 border border-white/5"
                >
                    <ArrowLeft size={16} /> Back to Selection
                </button>
                <CreateWishlistWizard isLoggedIn={isLoggedIn} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />

            <div className="absolute top-6 left-6 z-20">
                <Link
                    href={isLoggedIn ? "/dashboard" : "/"}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 border border-white/5"
                >
                    <ArrowLeft size={16} /> {isLoggedIn ? "Back to Dashboard" : "Back to Home"}
                </Link>
            </div>

            <div className="relative z-10 max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-lg">
                        What would you like to create?
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Choose how you want to spread the holiday cheer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Event Option */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelection('event')}
                        className="cursor-pointer"
                    >
                        <GlassCard className="h-full p-8 flex flex-col items-center text-center hover:bg-white/5 transition-colors border-primary/20 hover:border-primary/50 group">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <Calendar size={40} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Secret Santa Event</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Organize a gift exchange with friends, family, or colleagues. Draw names and set a budget.
                            </p>
                        </GlassCard>
                    </motion.div>

                    {/* Wishlist Option */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelection('wishlist')}
                        className="cursor-pointer"
                    >
                        <GlassCard className="h-full p-8 flex flex-col items-center text-center hover:bg-white/5 transition-colors border-purple-500/20 hover:border-purple-500/50 group">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                                <Gift size={40} className="text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">My Wishlist</h2>
                            <p className="text-gray-400 leading-relaxed">
                                Create a personal wishlist to share with others. Let them know exactly what you'd love to receive.
                            </p>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
