import Link from "next/link";
import Aurora from "@/components/Aurora";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Aurora
                    colorStops={["#0a1f1c", "#1a2f2b", "#d4af37"]}
                    speed={0.5}
                    amplitude={1.2}
                />
            </div>

            <div className="relative z-10 space-y-6">
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-white drop-shadow-lg">
                    404
                </h1>
                <h2 className="text-2xl md:text-3xl font-serif text-gold-gradient italic">
                    Page Not Found
                </h2>
                <p className="text-gray-300 max-w-md mx-auto">
                    It seems you've wandered off the path. Let's get you back to the festivities.
                </p>

                <Link href="/">
                    <button className="group px-8 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm mx-auto">
                        <ArrowLeft size={20} className="text-primary" /> Return Home
                    </button>
                </Link>
            </div>
        </div>
    );
}
