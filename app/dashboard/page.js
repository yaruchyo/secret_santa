"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Plus, ArrowRight, Loader2, Gift } from "lucide-react";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import GlassCard from "@/components/GlassCard";

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, wishlistsRes] = await Promise.all([
                    fetch("/api/events"),
                    fetch("/api/wishlists")
                ]);

                if (eventsRes.ok) {
                    const data = await eventsRes.json();
                    setEvents(data);
                }

                if (wishlistsRes.ok) {
                    const data = await wishlistsRes.json();
                    setWishlists(data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white drop-shadow-lg">Dashboard</h1>
                    <Link href="/create">
                        <button className="bg-primary text-background-secondary px-4 py-2 rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
                            <Plus size={20} /> <span className="hidden sm:inline">Create</span>
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Events Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="text-primary" /> My Events
                            </h2>
                            {events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event, index) => (
                                        <motion.div
                                            key={event._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link href={`/event/${event._id}`}>
                                                <GlassCard className="h-full hover:border-primary/50 group cursor-pointer relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight className="text-primary" />
                                                    </div>

                                                    <h2 className="text-xl font-bold mb-2 pr-8">{event.name}</h2>

                                                    <div className="space-y-2 text-sm text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-primary" />
                                                            <span>{new Date(event.deadline).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                {event.status}
                                                            </span>
                                                            {event.role === 'owner' && (
                                                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    Owner
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No events yet.</p>
                            )}
                        </section>

                        {/* Wishlists Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Gift className="text-purple-400" /> My Wishlists
                            </h2>
                            {wishlists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlists.map((wishlist, index) => (
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
                                                            {wishlist.role === 'owner' ? (
                                                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    My Wishlist
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                    {wishlist.ownerName}'s Wishlist
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No wishlists yet.</p>
                            )}
                        </section>
                    </div>
                )}

                {!loading && events.length === 0 && wishlists.length === 0 && (
                    <GlassCard className="text-center py-16 mt-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Get Started</h3>
                        <p className="text-gray-400 mb-6">Create your first event or wishlist to spread the joy.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/create">
                                <button className="px-6 py-3 bg-primary text-background-secondary font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
                                    <Plus size={20} /> Create
                                </button>
                            </Link>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
