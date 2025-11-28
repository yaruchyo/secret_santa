"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, Calendar, User, PlusCircle, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

const allDockItems = [
    { title: "Home", icon: Home, path: "/", hideWhenLoggedIn: true },
    { title: "My Events", icon: Calendar, path: "/dashboard", requireAuth: true },
    { title: "Create", icon: PlusCircle, path: "/create" },
    { title: "Join", icon: Gift, path: "/join" },
    { title: "Profile", icon: User, path: "/profile", requireAuth: true },
    { title: "Login", icon: LogIn, path: "/login", hideWhenLoggedIn: true },
];

export default function FloatingDock() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check auth status via API endpoint
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                setIsLoggedIn(data.isLoggedIn);
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, [pathname]);

    // Filter items based on auth status
    const dockItems = allDockItems.filter(item => {
        if (item.hideWhenLoggedIn && isLoggedIn) return false;
        if (item.requireAuth && !isLoggedIn) return false;
        return true;
    });

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 hidden md:flex">
            <motion.div
                className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            >
                {dockItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link key={item.path} href={item.path}>
                            <motion.div
                                className={`relative p-3 rounded-xl flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300 ${isActive
                                    ? "bg-primary/20 text-primary"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                    }`}
                                whileHover={{ scale: 1.1, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.title}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
