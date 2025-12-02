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

    // Populate subscriber names (like EventView does with participants)
    // Also include the owner in the list
    const allUserIds = [wishlist.ownerId];
    if (wishlist.subscribers && wishlist.subscribers.length > 0) {
        allUserIds.push(...wishlist.subscribers);
    }

    // Remove duplicates (in case owner is also in subscribers)
    const uniqueUserIds = [...new Set(allUserIds)].map(id => new ObjectId(id));
    const users = await db.collection('users').find({ _id: { $in: uniqueUserIds } }).toArray();
    const userMap = users.reduce((acc, u) => {
        acc[u._id.toString()] = u;
        return acc;
    }, {});

    wishlist.subscribersDetails = allUserIds.map(userId => ({
        userId: userId,
        name: userMap[userId]?.name || 'Unknown',
        email: userMap[userId]?.email || 'Unknown',
        isOwner: userId === wishlist.ownerId
    }));

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

    // Fetch user's friends array
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const currentUserData = await db.collection('users').findOne({ _id: new ObjectId(user.userId) });
    const userWithFriends = {
        ...user,
        friends: currentUserData?.friends || []
    };

    return <WishlistView wishlist={wishlist} currentUser={userWithFriends} />;
}
