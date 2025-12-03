"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import { ArrowRight, Gift, Sparkles, LayoutDashboard, Calendar, Heart, HelpCircle } from "lucide-react";

export default function HomeClient({ isLoggedIn }) {
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col items-center text-center px-4">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Aurora
                    colorStops={["#0a1f1c", "#1a2f2b", "#d4af37"]}
                    speed={0.5}
                    amplitude={1.2}
                />
            </div>

            {/* Navigation */}
            <StaggeredMenu />
            <FloatingDock />

            {/* Hero Section */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8 min-h-screen flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium tracking-wider uppercase backdrop-blur-md">
                        The Social Wishlist
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white drop-shadow-lg">
                        Make Every Gift <br />
                        <span className="text-gold-gradient italic">Meaningful</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        The ultimate social wishlist platform. Create universal lists, follow friends, and organize Secret Santa events for any occasion.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link href="/create">
                        <button className="group relative px-8 py-4 bg-primary text-background-secondary font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center gap-2 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Create Wishlist <ArrowRight size={20} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </button>
                    </Link>

                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <button className="group px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                                My Dashboard <LayoutDashboard size={20} className="text-primary" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/join">
                            <button className="group px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                                Join Event <Gift size={20} className="text-primary" />
                            </button>
                        </Link>
                    )}
                </motion.div>

                {!isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="pt-4"
                    >
                        <Link href="/login" className="text-sm text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">
                            Don't have an account? Create one
                        </Link>
                    </motion.div>
                )}

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex justify-center"
                >
                    <div className="animate-bounce text-white/30">
                        <ArrowRight className="rotate-90" size={24} />
                    </div>
                </motion.div>
            </div>

            {/* SEO Content Section */}
            <article className="relative z-10 max-w-4xl mx-auto pb-24 space-y-24 text-left">
                {/* Features */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        Why Choose <span className="text-primary">Everyone Santa</span>?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <Gift className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Universal Wishlists</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Add items from any store. Create lists for birthdays, weddings, or just because. Share them with anyone.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <Sparkles className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Social Gifting</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Follow friends to see their lists. Never guess what to get them again. Perfect for year-round surprises.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <LayoutDashboard className="text-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Event Organizer</h3>
                            <p className="text-gray-400 leading-relaxed">
                                The world's best Secret Santa generator is built right in. Organize sophisticated gift exchanges with ease.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        How It <span className="text-primary">Works</span>
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Create & Curate</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Build your dream wishlist by adding items from any online store. Organize lists for different occasions or keep one master list.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Connect & Share</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Share your profile with friends and family. Subscribe to their lists to get notified when they add new wishes.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/50">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Gift & Celebrate</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Whether it's a birthday, holiday, or a Secret Santa event, always know exactly what to give. Mark items as purchased to avoid duplicates.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Occasions Section */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        Perfect for <span className="text-primary">Every Occasion</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Calendar, title: "Birthdays", desc: "Make your special day memorable. Share your birthday wishlist with friends." },
                            { icon: Gift, title: "Holidays", desc: "The ultimate tool for Christmas, Hanukkah, and holiday gift exchanges." },
                            { icon: Heart, title: "Weddings", desc: "A modern, universal registry for your new beginning together." },
                            { icon: Sparkles, title: "Just Because", desc: "Keep track of things you love year-round. Never forget a great find." }
                        ].map((item, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors text-center">
                                <item.icon className="text-primary mx-auto mb-4" size={24} />
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section for GEO */}
                <section className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { q: "What is a social wishlist?", a: "A social wishlist allows you to create a list of gifts you want from any store and share it with friends and family. You can also follow your friends' lists to know exactly what to get them for birthdays and holidays." },
                            { q: "Can I use Everyone Santa for birthdays?", a: "Yes! Everyone Santa is designed for year-round gifting. Create wishlists for birthdays, weddings, baby showers, or any special occasion." },
                            { q: "Is the Secret Santa generator free?", a: "Yes, our Secret Santa generator is completely free to use for organizing holiday gift exchanges with friends, family, or colleagues." },
                            { q: "How do I share my list?", a: "Simply copy your unique profile link or invite friends directly through the platform via email or social media." }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                                        <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SEO Text Block */}
                <section className="space-y-6 text-center max-w-3xl mx-auto pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-serif font-bold text-white">
                        The Modern Way to <span className="text-primary">Give & Receive</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Everyone Santa is more than just a <strong>Secret Santa generator</strong>. It's a comprehensive <strong>social gifting platform</strong> designed to bring people together. Whether you're organizing a <strong>holiday gift exchange</strong>, creating a <strong>birthday wishlist</strong>, or managing a <strong>wedding registry</strong>, we make the process seamless and fun. Say goodbye to spreadsheets and duplicate gifts. Join the community making gifting meaningful again.
                    </p>
                </section>
            </article>
        </main>
    );
}
