import clsx from "clsx";

export default function GlassCard({ children, className, hoverEffect = false }) {
    return (
        <div
            className={clsx(
                "glass rounded-2xl p-8 transition-all duration-300",
                hoverEffect && "hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]",
                className
            )}
        >
            {children}
        </div>
    );
}
