"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Type, Check, Loader2, Eye, Lock } from "lucide-react";
import Aurora from "@/components/Aurora";
import Link from "next/link";

export default function CreateWishlistWizard({ isLoggedIn }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        deadline: "",
        isPublic: true, // Default to public
    });

    const createWishlist = async () => {
        const isoDeadline = new Date(formData.deadline).toISOString();

        const res = await fetch("/api/wishlists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: formData.name,
                deadline: isoDeadline,
                items: [], // Initialize with empty items
                isPublic: formData.isPublic
            }),
        });

        if (res.ok) {
            const data = await res.json();
            router.push(`/wishlist/${data._id}`);
            router.refresh();
        } else {
            alert("Failed to create wishlist");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createWishlist();
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-transparent text-foreground overflow-hidden relative">
            {/* Left Panel - Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative z-10">
                <div className="max-w-md mx-auto w-full space-y-8">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-serif font-bold">Create your wishlist</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-purple-400 uppercase tracking-widest font-bold mb-2">
                                    Name
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. My Birthday Wishlist"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-purple-400 uppercase tracking-widest font-bold mb-2">
                                    Exchange Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-purple-400 uppercase tracking-widest font-bold mb-3">
                                    Privacy
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublic: true })}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.isPublic
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        <Eye className="mx-auto mb-2" size={24} />
                                        <div className="text-sm font-bold">Public</div>
                                        <div className="text-xs mt-1">Friends can see and subscribe</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublic: false })}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${!formData.isPublic
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        <Lock className="mx-auto mb-2" size={24} />
                                        <div className="text-sm font-bold">Private</div>
                                        <div className="text-xs mt-1">Invite link only</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <div className="pt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.name || !formData.deadline}
                            className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors rounded-xl font-bold flex items-center justify-center gap-2 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    Create Wishlist <Check size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="hidden md:flex w-1/2 bg-black/20 backdrop-blur-3xl items-center justify-center relative p-8">
                <div className="absolute inset-0 overflow-hidden">
                    <Aurora colorStops={["#1a0b2e", "#000000", "#2d1b4e"]} amplitude={0.5} />
                </div>
                <div className="relative z-10 w-full max-w-md">
                    <p className="text-center text-white/30 uppercase tracking-widest text-xs mb-8">Live Preview</p>

                    {/* Preview Card */}
                    <div className="aspect-[3/4] bg-[#1a0b2e] rounded-xl border border-purple-500/30 relative overflow-hidden shadow-2xl flex flex-col p-8">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="mb-8">
                                <p className="text-purple-400 text-xs uppercase tracking-[0.2em] mb-2">My Wishlist</p>
                                <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                                    {formData.name || "Wishlist Name"}
                                </h2>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 w-full">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Exchange Date</p>
                                <p className="font-serif text-lg">
                                    {formData.deadline ? new Date(formData.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Select Date"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
