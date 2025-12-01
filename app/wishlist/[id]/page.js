import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import WishlistView from '@/components/WishlistView';
import { getUserFromSession } from '@/lib/auth';

async function getWishlist(id, user) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Validate ID format
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return null;
    }

    let wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

    if (!wishlist) return null;

    // Process data for serialization
    wishlist._id = wishlist._id.toString();
    wishlist.deadline = wishlist.deadline.toISOString();
    wishlist.createdAt = wishlist.createdAt.toISOString();

    return wishlist;
}

export default async function Page({ params }) {
    const { id } = await params;
    const user = await getUserFromSession();

    if (!user) {
        // If not logged in, redirect to login or show restricted view?
        // For now, let's show a basic message or redirect.
        // Ideally, we should redirect to login with callback URL.
        // But for MVP, let's just show a message.
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Login</h1>
                    <p className="mb-4">You need to be logged in to view this wishlist.</p>
                    <a href="/join" className="text-purple-400 hover:underline">Login / Sign Up</a>
                </div>
            </div>
        );
    }

    const wishlist = await getWishlist(id, user);

    if (!wishlist) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <h1 className="text-2xl font-bold">Wishlist not found</h1>
            </div>
        );
    }

    return <WishlistView wishlist={wishlist} currentUser={user} />;
}
