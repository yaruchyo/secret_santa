"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function RevealOverlay({ onReveal, isRevealed: initialIsRevealed = false }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(initialIsRevealed);
    const [showHintText, setShowHintText] = useState(true);
    const [allowScroll, setAllowScroll] = useState(false);
    const isDragging = useRef(false);
    const isInitialized = useRef(false);

    // Sync internal state with prop
    useEffect(() => {
        if (initialIsRevealed && !isRevealed) {
            setIsRevealed(true);
            setShowHintText(false);
            setAllowScroll(true);
        }
    }, [initialIsRevealed, isRevealed]);

    useEffect(() => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Set canvas size to match container
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Only draw initial overlay once
        if (!isInitialized.current) {
            // Fill with "Frosted" look - semi-transparent to see content beneath
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add noise/texture
            for (let i = 0; i < canvas.width * canvas.height * 0.05; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.2})`; // Gold noise
                ctx.fillRect(x, y, 2, 2);
            }

            isInitialized.current = true;
        }

        const scratch = (x, y) => {
            // Use destination-out to erase
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Fully opaque to fully erase
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = "source-over"; // Reset
        };

        const checkReveal = () => {
            if (isRevealed) return;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let transparentPixels = 0;
            const totalPixels = data.length / 4;

            // Sample every 100th pixel for performance
            for (let i = 0; i < totalPixels; i += 100) {
                const alpha = data[i * 4 + 3];
                if (alpha < 128) { // Consider semi-transparent as scratched
                    transparentPixels++;
                }
            }

            const scratchPercentage = (transparentPixels / (totalPixels / 100)) * 100;
            console.log('Scratch %:', scratchPercentage.toFixed(2), 'Transparent:', transparentPixels, 'Total samples:', totalPixels / 100);

            // Hide hint text and enable scrolling at 20%
            if (scratchPercentage > 20) {
                console.log('✅ 20% threshold reached - hiding text and enabling scroll');
                setShowHintText(false);
                setAllowScroll(true);
            }

            // Full reveal at 50%
            if (scratchPercentage > 50) {
                console.log('✅ 50% threshold reached - triggering full reveal');
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

        const handleMove = (e) => {
            if (!isDragging.current) return;

            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;

            if (clientX === undefined || clientY === undefined) return;

            const x = clientX - rect.left;
            const y = clientY - rect.top;

            scratch(x, y);
            checkReveal();
        };

        const startDrag = (e) => {
            isDragging.current = true;
            // Also scratch at the initial point
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;

            if (clientX !== undefined && clientY !== undefined) {
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                scratch(x, y);
                checkReveal();
            }
        };

        const stopDrag = () => {
            isDragging.current = false;
        };

        // Mouse events
        canvas.addEventListener("mousedown", startDrag);
        canvas.addEventListener("mouseup", stopDrag);
        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseleave", stopDrag);

        // Touch events
        canvas.addEventListener("touchstart", startDrag, { passive: true });
        canvas.addEventListener("touchend", stopDrag);
        canvas.addEventListener("touchmove", handleMove, { passive: true });

        return () => {
            canvas.removeEventListener("mousedown", startDrag);
            canvas.removeEventListener("mouseup", stopDrag);
            canvas.removeEventListener("mousemove", handleMove);
            canvas.removeEventListener("mouseleave", stopDrag);
            canvas.removeEventListener("touchstart", startDrag);
            canvas.removeEventListener("touchend", stopDrag);
            canvas.removeEventListener("touchmove", handleMove);
        };
    }, [isRevealed, onReveal]);

    return (
        <AnimatePresence>
            {!isRevealed && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-20"
                    style={{ touchAction: allowScroll ? 'auto' : 'none' }}
                >
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full rounded-2xl cursor-crosshair"
                    />
                    {showHintText && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                            Scratch to Reveal
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
