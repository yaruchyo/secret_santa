import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { isPublic } = await request.json();

    if (typeof isPublic !== 'boolean') {
        return NextResponse.json({ error: 'Invalid isPublic value' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Find the wishlist
    const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

    if (!wishlist) {
        return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Verify user is the owner
    if (wishlist.ownerId !== user.userId) {
        return NextResponse.json({ error: 'Only the owner can change privacy settings' }, { status: 403 });
    }

    // Update privacy setting
    await db.collection('wishlists').updateOne(
        { _id: new ObjectId(id) },
        { $set: { isPublic } }
    );

    return NextResponse.json({ success: true, isPublic });
}
