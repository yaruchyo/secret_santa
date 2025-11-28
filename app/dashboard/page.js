"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Plus, ArrowRight, Loader2 } from "lucide-react";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import GlassCard from "@/components/GlassCard";

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/events"); // Assuming this endpoint exists and returns user's events
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white drop-shadow-lg">My Events</h1>
                    <Link href="/create">
                        <button className="bg-primary text-background-secondary px-4 py-2 rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
                            <Plus size={20} /> <span className="hidden sm:inline">Create Event</span>
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : events.length > 0 ? (
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
                    <GlassCard className="text-center py-16">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Events Yet</h3>
                        <p className="text-gray-400 mb-6">You haven't joined or created any Secret Santa events.</p>
                        <Link href="/create">
                            <button className="text-primary hover:text-white font-semibold transition-colors">
                                Create your first event →
                            </button>
                        </Link>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
