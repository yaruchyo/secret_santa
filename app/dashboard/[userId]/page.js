"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // Correct hook for app directory params
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Loader2, Gift } from "lucide-react";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import GlassCard from "@/components/GlassCard";
import { use } from "react"; // For unwrapping params if needed in server components, but this is client.

export default function FriendDashboard() {
    const params = useParams();
    const userId = params.userId;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/dashboard`);
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Failed to fetch friend data", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white drop-shadow-lg">
                        {data?.user?.name ? `${data.user.name}'s Dashboard` : "Dashboard"}
                    </h1>

                    {/* Friend Profile Badge */}
                    {data?.user && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold shadow-lg">
                                {data.user.name.charAt(0)}
                            </div>
                            <span className="font-medium text-white hidden sm:inline">{data.user.name}</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Wishlists Section Only */}
                        {data?.wishlists && data.wishlists.length > 0 ? (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Gift className="text-purple-400" /> Wishlists
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.wishlists.map((wishlist, index) => (
                                        <motion.div
                                            key={wishlist._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link href={`/wishlist/${wishlist._id}`}>
                                                <GlassCard className="h-full hover:border-purple-500/50 group cursor-pointer relative overflow-hidden border-purple-500/20">
                                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight className="text-purple-400" />
                                                    </div>

                                                    <h2 className="text-xl font-bold mb-2 pr-8">{wishlist.name}</h2>

                                                    <div className="space-y-2 text-sm text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-purple-400" />
                                                            <span>{new Date(wishlist.deadline).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                {wishlist.items?.length || 0} Items
                                                            </span>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <GlassCard className="text-center py-16 mt-8">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift size={32} className="text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No Wishlists</h3>
                                <p className="text-gray-400">This friend hasn't created any public wishlists yet.</p>
                            </GlassCard>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
