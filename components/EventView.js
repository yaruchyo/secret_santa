"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Clock, Users, Trash2, LogOut, Plus, X, Copy, Check, Sparkles as SparklesIcon, Eye } from "lucide-react";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import GlassCard from "@/components/GlassCard";
import RevealOverlay from "@/components/RevealOverlay";
import Aurora from "@/components/Aurora";

export default function EventView({ initialEvent, user }) {
    const [event, setEvent] = useState(initialEvent);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [newWishItem, setNewWishItem] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [isRevealed, setIsRevealed] = useState(false);
    const router = useRouter();

    const isOwner = event.ownerId === user.userId;
    const isParticipant = event.participants?.some((p) => p.userId === user.userId);

    // Initialize wishlist and check reveal state
    useEffect(() => {
        if (event && user) {
            const me = event.participants?.find((p) => p.userId === user.userId);
            if (me && me.wishlist) {
                const items = Array.isArray(me.wishlist) ? me.wishlist : [me.wishlist];
                setWishlistItems(items.filter((item) => item));
            }

            // Check for persistent reveal state
            if (event.myAssignment) {
                const storageKey = `reveal_${event._id}_${user.userId}`;
                const savedReveal = localStorage.getItem(storageKey);
                if (savedReveal === "true") {
                    setIsRevealed(true);
                }
            }
        }
    }, [event, user]);

    const handleReveal = useCallback(() => {
        setIsRevealed(true);
        // Save state
        const storageKey = `reveal_${event._id}_${user.userId}`;
        localStorage.setItem(storageKey, "true");
    }, [event._id, user.userId]);

    // Poll for updates
    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch(`/api/events/${event._id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [event._id]);

    // Timer Logic
    useEffect(() => {
        if (!event) return;
        const timer = setInterval(() => {
            const now = new Date();
            const deadline = new Date(event.deadline);
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Event Started!");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [event]);

    const handleJoin = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/events/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: joinCode }),
        });
        if (res.ok) {
            const updatedRes = await fetch(`/api/events/${event._id}`);
            const updatedEvent = await updatedRes.json();
            setEvent(updatedEvent);
            setJoinCode("");
            router.refresh();
        } else {
            alert("Failed to join");
        }
    };

    const handleAddWishItem = async () => {
        if (newWishItem.trim()) {
            const updatedItems = [...wishlistItems, newWishItem.trim()];
            setWishlistItems(updatedItems);
            setNewWishItem("");

            await fetch(`/api/events/${event._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wishlist: updatedItems }),
            });
        }
    };

    const handleRemoveWishItem = async (index) => {
        const updatedItems = wishlistItems.filter((_, i) => i !== index);
        setWishlistItems(updatedItems);

        await fetch(`/api/events/${event._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wishlist: updatedItems }),
        });
    };

    const handleLeaveEvent = async () => {
        const confirmMessage = isOwner
            ? "Are you sure you want to delete this event? This action cannot be undone."
            : "Are you sure you want to leave this event?";

        if (!confirm(confirmMessage)) return;

        const res = await fetch(`/api/events/${event._id}/leave`, {
            method: "POST",
        });

        if (res.ok) {
            router.push("/dashboard");
            router.refresh();
        } else {
            alert("Failed to leave event");
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(event.code);
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.8} />

            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-12 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-widest font-bold"
                    >
                        {event.status === "active" ? "Planning Phase" : "Event Matched"}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-lg"
                    >
                        {event.name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-6 text-gray-400"
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            <span className="font-mono">{timeLeft || "Loading..."}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-primary" />
                            <span>{event.participants?.length || 0} Participants</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Assignment Card (The Reveal) */}
                        {event.myAssignment && (
                            <GlassCard className="relative overflow-hidden border-primary/30">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                                    <Gift className="text-primary" /> Your Assignment
                                </h2>

                                <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                                    <RevealOverlay isRevealed={isRevealed} onReveal={handleReveal} />

                                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${isRevealed ? 'z-30' : 'z-0'}`}>
                                        <div className="min-h-full flex flex-col items-center justify-center p-8 text-center">
                                            <p className="text-gray-400 uppercase tracking-widest text-sm mb-4">You are gifting to</p>
                                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-gold-gradient mb-8">
                                                {event.myAssignment.receiverName}
                                            </h3>

                                            <div className="w-full max-w-md bg-white/5 rounded-xl p-6 border border-white/10 text-left">
                                                <p className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Their Wishlist</p>
                                                {event.myAssignment.receiverWishlist && event.myAssignment.receiverWishlist.length > 0 ? (
                                                    <ul className="space-y-3">
                                                        {event.myAssignment.receiverWishlist.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                                                <span className="text-primary/50 font-mono">{i + 1}.</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="italic text-gray-500">They haven't added any wishes yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instant Reveal Button */}
                                {!isRevealed && (
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={handleReveal}
                                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                        >
                                            <Eye size={16} /> Reveal Instantly
                                        </button>
                                    </div>
                                )}
                            </GlassCard>
                        )}

                        {/* My Wishlist */}
                        {event.status === "active" && isParticipant && (
                            <GlassCard>
                                <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                                    <SparklesIcon className="text-primary" /> My Wishlist
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <AnimatePresence>
                                        {wishlistItems.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 group"
                                            >
                                                <span className="font-mono text-primary/50">{index + 1}</span>
                                                <span className="flex-1 text-gray-200">{item}</span>
                                                <button
                                                    onClick={() => handleRemoveWishItem(index)}
                                                    className="text-gray-500 hover:text-error transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newWishItem}
                                        onChange={(e) => setNewWishItem(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAddWishItem()}
                                        placeholder="Add a wish..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleAddWishItem}
                                        className="bg-primary text-background-secondary p-3 rounded-xl hover:bg-primary-hover transition-colors"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Invitation Code */}
                        <GlassCard className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <p className="text-xs text-primary uppercase tracking-widest font-bold mb-2">Invitation Code</p>
                            <div
                                onClick={copyCode}
                                className="flex items-center justify-between bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-black/30 transition-colors group"
                            >
                                <span className="text-3xl font-mono font-bold text-white tracking-wider">{event.code}</span>
                                <Copy size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click to copy & share with friends</p>
                        </GlassCard>

                        {/* Participants List */}
                        <GlassCard>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                Participants <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{event.participants?.length || 0}</span>
                            </h3>
                            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {event.participants?.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background-secondary font-bold">
                                            {p.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{p.name}</p>
                                            {p.wishlist?.length > 0 && (
                                                <p className="text-xs text-primary flex items-center gap-1">
                                                    <Check size={10} /> Wishlist ready
                                                </p>
                                            )}
                                        </div>
                                        {event.ownerId === p.userId && (
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Owner</span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {!isParticipant && event.status === "active" && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Code"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
                                            className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center uppercase"
                                        />
                                        <button onClick={handleJoin} className="flex-1 btn btn-primary py-2 text-sm">
                                            Join Event
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Admin / Actions */}
                        {isParticipant && (
                            <button
                                onClick={handleLeaveEvent}
                                className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all flex items-center justify-center gap-2"
                            >
                                {isOwner ? <Trash2 size={18} /> : <LogOut size={18} />}
                                {isOwner ? "Delete Event" : "Leave Event"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
