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

    try {
        const { code } = await request.json();
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        if (wishlist.code !== code) {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 400 });
        }

        // Add user to subscribers if not already there
        if (!wishlist.subscribers.includes(user.userId) && wishlist.ownerId !== user.userId) {
            await db.collection('wishlists').updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { subscribers: user.userId } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error joining wishlist:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
