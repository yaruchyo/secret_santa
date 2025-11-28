import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import ProfileForm from './ProfileForm';
import Link from 'next/link';
import Aurora from "@/components/Aurora";
import StaggeredMenu from "@/components/StaggeredMenu";
import FloatingDock from "@/components/FloatingDock";
import GlassCard from "@/components/GlassCard";
import { User, LogIn } from "lucide-react";

async function getUser(userId) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (user) {
        return {
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt?.toISOString()
        };
    }
    return null;
}

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-foreground">
                <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
                <div className="relative z-10">
                    <GlassCard className="text-center animate-fade-in max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold mb-4 text-gold-gradient">Access Denied</h2>
                        <p className="text-gray-400 mb-6">Please log in to view your profile</p>
                        <Link href="/login">
                            <button className="btn btn-primary flex items-center gap-2 mx-auto">
                                <LogIn size={18} /> Login
                            </button>
                        </Link>
                    </GlassCard>
                </div>
            </div>
        );
    }

    let decoded;
    try {
        decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (e) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-foreground">
                <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
                <div className="relative z-10">
                    <GlassCard className="text-center animate-fade-in max-w-md mx-auto">
                        <h2 className="text-2xl font-serif font-bold mb-4 text-gold-gradient">Session Expired</h2>
                        <p className="text-gray-400 mb-6">Please log in again</p>
                        <Link href="/login">
                            <button className="btn btn-primary flex items-center gap-2 mx-auto">
                                <LogIn size={18} /> Login
                            </button>
                        </Link>
                    </GlassCard>
                </div>
            </div>
        );
    }

    const user = await getUser(decoded.userId);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-foreground">
                <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
                <div className="relative z-10">
                    <GlassCard className="text-center animate-fade-in max-w-md mx-auto">
                        <h2 className="text-2xl font-serif font-bold mb-4 text-gold-gradient">User Not Found</h2>
                        <Link href="/login">
                            <button className="btn btn-primary flex items-center gap-2 mx-auto">
                                <LogIn size={18} /> Login
                            </button>
                        </Link>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden text-foreground">
            <Aurora colorStops={["#0a1f1c", "#1a2f2b", "#000000"]} amplitude={0.5} />
            <StaggeredMenu />
            <FloatingDock />

            <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
                <GlassCard className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background-secondary text-2xl font-bold shadow-lg">
                            {user.name?.charAt(0) || <User />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gold-gradient">Edit Profile</h1>
                            <p className="text-gray-400 text-sm">Update your personal information</p>
                        </div>
                    </div>

                    <ProfileForm user={user} />
                </GlassCard>
            </div>
        </div>
    );
}
