"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Gift, Link as LinkIcon, Share2, Check, Lock, User, ExternalLink, Loader2, Plus, X, Trash2, Copy, Sparkles as SparklesIcon, LogOut, Clock } from "lucide-react";
import Aurora from "@/components/Aurora";
import GlassCard from "@/components/GlassCard";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WishlistView({ wishlist: initialWishlist, currentUser }) {
    const router = useRouter();
    const [wishlist, setWishlist] = useState(initialWishlist);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemLink, setNewItemLink] = useState("");
    const [timeLeft, setTimeLeft] = useState("");

    const isOwner = wishlist.ownerId === currentUser.userId;
    const isSubscriber = wishlist.subscribers && wishlist.subscribers.includes(currentUser.userId);
    const canView = isOwner || isSubscriber;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(wishlist.code);
        alert("Code copied to clipboard!");
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setJoining(true);
        try {
            const res = await fetch(`/api/wishlists/${wishlist._id}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: joinCode }),
            });

            if (res.ok) {
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to join");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setJoining(false);
        }
    };

    const handleBook = async (itemId, action) => {
        // Optimistic update
        const originalItems = [...wishlist.items];
        const updatedItems = wishlist.items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    bookedBy: action === 'book' ? currentUser.userId : null,
                    bookedByName: action === 'book' ? currentUser.name : null
                };
            }
            return item;
        });

        setWishlist({ ...wishlist, items: updatedItems });

        try {
            const res = await fetch(`/api/wishlists/${wishlist._id}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, action }),
            });

            if (!res.ok) {
                setWishlist({ ...wishlist, items: originalItems });
                const data = await res.json();
                alert(data.error || "Failed to update booking");
            }
        } catch (error) {
            console.error(error);
            setWishlist({ ...wishlist, items: originalItems });
            alert("An error occurred");
        }
    };

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;

        const newItem = {
            id: crypto.randomUUID(),
            name: newItemName,
            links: newItemLink ? [newItemLink] : [],
            bookedBy: null,
            bookedByName: null
        };

        const updatedItems = [...wishlist.items, newItem];
        setWishlist({ ...wishlist, items: updatedItems });
        setNewItemName("");
        setNewItemLink("");

        try {
            await fetch(`/api/wishlists/${wishlist._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: updatedItems }),
            });
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        const updatedItems = wishlist.items.filter(i => i.id !== itemId);
        setWishlist({ ...wishlist, items: updatedItems });

        try {
            await fetch(`/api/wishlists/${wishlist._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: updatedItems }),
            });
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleDeleteWishlist = async () => {
        if (!confirm("Are you sure you want to delete this wishlist? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/wishlists/${wishlist._id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/dashboard");
                router.refresh();
            } else {
                alert("Failed to delete wishlist");
            }
        } catch (error) {
            console.error("Failed to delete wishlist", error);
        }
    };

    const handleLeaveWishlist = async () => {
        if (!confirm("Are you sure you want to leave this wishlist?")) return;

        try {
            const res = await fetch(`/api/wishlists/${wishlist._id}/leave`, {
                method: "POST",
            });

            if (res.ok) {
                router.push("/dashboard");
                router.refresh();
            } else {
                alert("Failed to leave wishlist");
            }
        } catch (error) {
            console.error("Failed to leave wishlist", error);
        }
    };

    // Timer Logic (countdown to deadline)
    useEffect(() => {
        if (!wishlist) return;
        const timer = setInterval(() => {
            const now = new Date();
            const deadline = new Date(wishlist.deadline);
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Deadline passed!");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [wishlist]);

    if (!canView) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-foreground">
                <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
                <div className="relative z-10 max-w-md w-full p-4">
                    <GlassCard className="p-8 text-center">
                        <Lock size={48} className="mx-auto text-purple-400 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Private Wishlist</h1>
                        <p className="text-gray-400 mb-6">
                            You need an invitation code to view this wishlist.
                        </p>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter 6-character code"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest uppercase font-mono focus:border-purple-500 outline-none"
                                maxLength={6}
                                required
                            />
                            <button
                                type="submit"
                                disabled={joining}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {joining ? <Loader2 className="animate-spin" /> : "Join Wishlist"}
                            </button>
                        </form>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#1a0b2e", "#000000", "#2d1b4e"]} amplitude={0.5} />

            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-12 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs uppercase tracking-widest font-bold"
                    >
                        {isOwner ? "My Wishlist" : `Wishlist by ${wishlist.ownerName}`}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-lg"
                    >
                        {wishlist.name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-6 text-gray-400"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-400" />
                            <span>{new Date(wishlist.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        {timeLeft && (
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-purple-400" />
                                <span className="font-mono font-bold">{timeLeft}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Gift size={16} className="text-purple-400" />
                            <span>{wishlist.items.length} Items</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Items List */}
                        <GlassCard className="border-purple-500/20">
                            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                                <SparklesIcon className="text-purple-400" /> Items
                            </h2>

                            <div className="space-y-4 mb-6">
                                <AnimatePresence>
                                    {wishlist.items.map((item, index) => {
                                        const isBooked = !!item.bookedBy;
                                        const bookedByMe = item.bookedBy === currentUser.userId;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`flex flex-col gap-2 bg-white/5 p-4 rounded-xl border ${isBooked ? "border-purple-500/30 bg-purple-900/10" : "border-white/10"} group`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono text-purple-400/50">{index + 1}</span>
                                                    <div className="flex-1">
                                                        <span className={`text-lg ${isBooked ? "text-gray-400 line-through" : "text-gray-200"}`}>{item.name}</span>
                                                        {item.links && item.links.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {item.links.map((link, i) => link && (
                                                                    <a
                                                                        key={i}
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                                                    >
                                                                        <ExternalLink size={10} /> Link {i + 1}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-gray-500 hover:text-error transition-colors p-2"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}

                                                    {!isOwner && (
                                                        <div>
                                                            {isBooked ? (
                                                                bookedByMe ? (
                                                                    <button
                                                                        onClick={() => handleBook(item.id, 'unbook')}
                                                                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        Unbook
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-purple-300 italic">
                                                                        Booked by {item.bookedByName}
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBook(item.id, 'book')}
                                                                    className="px-3 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-purple-900/20"
                                                                >
                                                                    Book
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {isOwner && (
                                <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                                        placeholder="Add a wish..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newItemLink}
                                            onChange={(e) => setNewItemLink(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                                            placeholder="Add a link (optional)..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleAddItem}
                                            disabled={!newItemName.trim()}
                                            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        {/* Invitation Code */}
                        {isOwner && (
                            <GlassCard className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                                <p className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-2">Invitation Code</p>
                                <div
                                    onClick={handleCopyCode}
                                    className="flex items-center justify-between bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-black/30 transition-colors group"
                                >
                                    <span className="text-3xl font-mono font-bold text-white tracking-wider">{wishlist.code}</span>
                                    <Copy size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Click to copy & share with friends</p>
                            </GlassCard>
                        )}

                        {/* Subscribers List */}
                        <GlassCard>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                Subscribers <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{wishlist.subscribersDetails?.length || 0}</span>
                            </h3>
                            {wishlist.subscribersDetails && wishlist.subscribersDetails.length > 0 ? (
                                <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {wishlist.subscribersDetails.map((subscriber, i) => (
                                        <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                                                {subscriber.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{subscriber.name}</p>
                                            </div>
                                            {subscriber.isOwner && (
                                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Owner</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No subscribers yet.</p>
                            )}
                        </GlassCard>

                        {/* Admin / Actions */}
                        {isOwner ? (
                            <button
                                onClick={handleDeleteWishlist}
                                className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete Wishlist
                            </button>
                        ) : isSubscriber && (
                            <button
                                onClick={handleLeaveWishlist}
                                className="w-full py-4 rounded-xl border border-white/10 text-gray-400 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Leave Wishlist
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
