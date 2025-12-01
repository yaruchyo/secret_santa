import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Find wishlists where I am the owner OR a subscriber
    const wishlists = await db.collection('wishlists').find({
        $or: [
            { ownerId: user.userId },
            { subscribers: user.userId }
        ]
    }).toArray();

    const wishlistsWithRole = wishlists.map(w => ({
        ...w,
        role: w.ownerId === user.userId ? 'owner' : 'subscriber'
    }));

    return NextResponse.json(wishlistsWithRole);
}

export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, deadline, items } = await request.json();

        if (!name || !deadline) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // Generate a unique 6-character invitation code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newWishlist = {
            name,
            deadline: new Date(deadline),
            ownerId: user.userId,
            ownerName: user.name,
            code,
            items: items || [], // Array of { id, name, links: [], bookedBy: null, bookedByName: null }
            subscribers: [], // Array of userIds
            createdAt: new Date(),
        };

        const result = await db.collection('wishlists').insertOne(newWishlist);

        return NextResponse.json({ ...newWishlist, _id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Create wishlist error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
