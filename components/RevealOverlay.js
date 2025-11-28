"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function RevealOverlay({ onReveal, isRevealed: initialIsRevealed = false }) {
    const canvasRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(initialIsRevealed);
    const [isDragging, setIsDragging] = useState(false);

    // Sync internal state with prop
    useEffect(() => {
        if (initialIsRevealed && !isRevealed) {
            setIsRevealed(true);
        }
    }, [initialIsRevealed]);

    useEffect(() => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        canvas.width = width;
        canvas.height = height;

        // Fill with "Frosted" look
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(0, 0, width, height);

        // Add noise/texture
        for (let i = 0; i < width * height * 0.05; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.2})`; // Gold noise
            ctx.fillRect(x, y, 2, 2);
        }

        ctx.globalCompositeOperation = "destination-out";

        const handleMove = (e) => {
            if (!isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();

            checkReveal();
        };

        const checkReveal = () => {
            if (isRevealed) return;

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            let cleared = 0;
            const total = data.length / 4;

            for (let i = 0; i < total; i += 100) {
                if (data[i * 4 + 3] === 0) cleared++;
            }

            if (cleared / (total / 100) > 0.4) {
                triggerReveal();
            }
        };

        const triggerReveal = () => {
            setIsRevealed(true);
            if (onReveal) onReveal();

            // Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#d4af37', '#f9d77e', '#ffffff']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#d4af37', '#f9d77e', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        };

        canvas.addEventListener("mousedown", () => setIsDragging(true));
        canvas.addEventListener("mouseup", () => setIsDragging(false));
        canvas.addEventListener("mousemove", handleMove);

        canvas.addEventListener("touchstart", () => setIsDragging(true));
        canvas.addEventListener("touchend", () => setIsDragging(false));
        canvas.addEventListener("touchmove", handleMove);

        return () => {
            if (canvas) {
                canvas.removeEventListener("mousedown", () => setIsDragging(true));
                canvas.removeEventListener("mouseup", () => setIsDragging(false));
                canvas.removeEventListener("mousemove", handleMove);
                // ... touch events
            }
        };
    }, [isDragging, isRevealed, onReveal]);

    return (
        <AnimatePresence>
            {!isRevealed && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-20 cursor-crosshair touch-none"
                >
                    <canvas ref={canvasRef} className="w-full h-full rounded-2xl" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Scratch to Reveal
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
