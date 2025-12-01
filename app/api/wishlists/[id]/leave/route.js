import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
    const { id } = await params;
    const user = await getUserFromSession();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Validate ID format
    if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        // Prevent owner from leaving their own wishlist
        if (wishlist.ownerId === user.userId) {
            return NextResponse.json({ error: 'Cannot leave your own wishlist. Use delete instead.' }, { status: 403 });
        }

        // Remove user from subscribers
        await db.collection('wishlists').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { subscribers: user.userId } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to leave wishlist", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
