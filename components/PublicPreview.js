"use client";

import Link from "next/link";
import { Users, Gift, Calendar, Sparkles } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Aurora from "@/components/Aurora";

export default function PublicPreview({ data, type, inviteId }) {
    const isEvent = type === 'event';
    const userCount = isEvent ? data.participants.length : data.subscribers.length;
    const itemsCount = isEvent ? 0 : data.items.length;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
            <div className="relative z-10 max-w-md w-full p-4">
                <GlassCard className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                            {isEvent ? <Sparkles size={32} className="text-purple-400" /> : <Gift size={32} className="text-purple-400" />}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
                        <p className="text-gray-400">
                            Invited by <span className="text-purple-400 font-medium">{data.ownerName}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <Users className="mx-auto mb-1 text-purple-400" size={20} />
                            <div className="font-bold text-xl">{userCount}</div>
                            <div className="text-xs text-gray-400">Participants</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <Calendar className="mx-auto mb-1 text-purple-400" size={20} />
                            <div className="font-bold text-xl">
                                {new Date(data.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-400">Deadline</div>
                        </div>
                    </div>

                    {!isEvent && data.items.length > 0 && (
                        <div className="text-left bg-white/5 p-4 rounded-xl border border-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Wishlist Preview</h3>
                            <ul className="space-y-2">
                                {data.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Link
                        href={`/login?callbackUrl=/invite/${inviteId}`}
                        className="block w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/20"
                    >
                        Subscribe to Join
                    </Link>
                </GlassCard>
            </div>
        </div>
    );
}
