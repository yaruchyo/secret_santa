import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Find the wishlist
    const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

    if (!wishlist) {
        return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Check if user is already subscribed
    if (wishlist.subscribers && wishlist.subscribers.includes(user.userId)) {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }

    // Check if user is the owner
    if (wishlist.ownerId === user.userId) {
        return NextResponse.json({ error: 'Cannot subscribe to your own wishlist' }, { status: 400 });
    }

    // Verify that the user is a friend of the owner
    const currentUserData = await db.collection('users').findOne({ _id: new ObjectId(user.userId) });
    const isFriend = currentUserData?.friends && currentUserData.friends.includes(wishlist.ownerId);

    if (!isFriend) {
        return NextResponse.json({ error: 'You must be friends with the owner to subscribe' }, { status: 403 });
    }

    // Add user to subscribers
    await db.collection('wishlists').updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { subscribers: user.userId } }
    );

    // Ensure bidirectional friendship (should already exist, but just in case)
    await db.collection('users').updateOne(
        { _id: new ObjectId(user.userId) },
        { $addToSet: { friends: wishlist.ownerId } }
    );
    await db.collection('users').updateOne(
        { _id: new ObjectId(wishlist.ownerId) },
        { $addToSet: { friends: user.userId } }
    );

    return NextResponse.json({ success: true });
}
