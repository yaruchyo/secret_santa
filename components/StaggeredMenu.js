"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { title: "Home", path: "/" },
    { title: "My Events", path: "/dashboard" },
    { title: "Create Event", path: "/create" },
    { title: "Join Event", path: "/join" },
    { title: "Profile", path: "/profile" },
];

const sidebar = {
    open: (height = 1000) => ({
        clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 40px)`,
        transition: {
            type: "spring",
            stiffness: 20,
            restDelta: 2,
        },
    }),
    closed: {
        clipPath: "circle(30px at calc(100% - 40px) 40px)",
        transition: {
            delay: 0.5,
            type: "spring",
            stiffness: 400,
            damping: 40,
        },
    },
};

const variants = {
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
        },
    },
};

export default function StaggeredMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            initial={false}
            animate={isOpen ? "open" : "closed"}
            className="fixed top-0 right-0 bottom-0 w-[300px] z-50 md:hidden pointer-events-none"
        >
            <motion.div
                className="absolute top-0 right-0 bottom-0 w-full bg-background-secondary/95 backdrop-blur-xl border-l border-glass-border pointer-events-auto"
                variants={sidebar}
            />

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-[18px] right-[18px] w-[50px] h-[50px] rounded-full bg-transparent z-50 flex items-center justify-center focus:outline-none pointer-events-auto"
                aria-label="Toggle Menu"
            >
                <svg width="23" height="23" viewBox="0 0 23 23">
                    <Path
                        variants={{
                            closed: { d: "M 2 2.5 L 20 2.5" },
                            open: { d: "M 3 16.5 L 17 2.5" },
                        }}
                    />
                    <Path
                        d="M 2 9.423 L 20 9.423"
                        variants={{
                            closed: { opacity: 1 },
                            open: { opacity: 0 },
                        }}
                        transition={{ duration: 0.1 }}
                    />
                    <Path
                        variants={{
                            closed: { d: "M 2 16.346 L 20 16.346" },
                            open: { d: "M 3 2.5 L 17 16.346" },
                        }}
                    />
                </svg>
            </button>

            {/* Menu Items */}
            <motion.ul
                variants={variants}
                className="absolute top-[100px] right-[40px] w-[220px] p-0 m-0 list-none z-40 text-right pointer-events-auto"
            >
                {menuItems.map((item) => (
                    <motion.li
                        key={item.path}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mb-6 flex items-center justify-end cursor-pointer"
                    >
                        <Link
                            href={item.path}
                            className={`text-2xl font-serif font-bold ${pathname === item.path ? "text-primary" : "text-foreground"
                                } hover:text-primary transition-colors`}
                        >
                            {item.title}
                        </Link>
                    </motion.li>
                ))}
            </motion.ul>
        </motion.nav>
    );
}

const Path = (props) => (
    <motion.path
        fill="transparent"
        strokeWidth="3"
        stroke="var(--primary)"
        strokeLinecap="round"
        {...props}
    />
);