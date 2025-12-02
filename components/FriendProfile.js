"use client";

import { useState, useEffect } from "react";
import { X, Gift, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/GlassCard";

export default function FriendProfile({ userId, name, onClose }) {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishes = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/wishes`);
                if (res.ok) {
                    const data = await res.json();
                    setWishes(data.wishes || []);
                }
            } catch (error) {
                console.error("Failed to fetch wishes", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchWishes();
        }
    }, [userId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg"
            >
                <GlassCard className="relative max-h-[80vh] flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-6 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                            {name?.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{name}</h2>
                        <p className="text-purple-400 text-sm">Friend's Wishlist Profile</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-purple-400" size={32} />
                            </div>
                        ) : wishes.length > 0 ? (
                            wishes.map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-lg text-gray-200">{item.name}</h3>
                                        <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                                            {item.wishlistName}
                                        </span>
                                    </div>
                                    {item.links && item.links.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.links.map((link, j) => link && (
                                                <a
                                                    key={j}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-1 rounded-lg"
                                                >
                                                    <ExternalLink size={10} /> Link {j + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Gift size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No wishes found.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
