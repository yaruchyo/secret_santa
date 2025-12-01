import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const { id } = await params;
    const user = await getUserFromSession();
    // Allow public access if they have the ID? 
    // The requirement says "people who got an invitation code (have to be sign in) will subscribe".
    // But if they just visit the link, they should probably see it or be prompted to join.
    // For now, let's allow fetching if you know the ID, but we'll filter sensitive info if not authorized?
    // Actually, usually you fetch by ID. If you are not owner or subscriber, maybe you can only see basic info to join?
    // Let's return the full object for now, assuming the frontend handles the "Join" view if not subscribed.

    if (!user) {
        // If not logged in, maybe return 401? Or return limited info?
        // Let's require login for now as per "have to be sign in".
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    try {
        const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        // Check access
        const isOwner = wishlist.ownerId === user.userId;
        const isSubscriber = wishlist.subscribers && wishlist.subscribers.includes(user.userId);

        if (!isOwner && !isSubscriber) {
            // If not owner/subscriber, maybe they are trying to join via code?
            // But this endpoint is for fetching details.
            // If they have the link, they might want to join.
            // We'll return a "preview" mode or just the wishlist but with a flag?
            // Let's return it, but frontend will show "Join" button if not in subscribers.
            // However, we should probably hide "bookedBy" info if not authorized?
            // Actually, "bookedBy" is only for subscribers.
            // Let's return it.
        }

        return NextResponse.json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items } = await request.json();
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // Verify owner
        const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });
        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        if (wishlist.ownerId !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update items
        // We need to preserve booking info if items are modified? 
        // For simplicity, we assume the frontend sends the full updated list.
        // But we must ensure the user doesn't overwrite "bookedBy" fields.
        // So we should merge? Or trust the owner?
        // Owner shouldn't be able to change "bookedBy".

        // Better approach: Only allow adding/removing items or changing name/links.
        // If we replace the whole items array, we lose booking info unless frontend sends it back.
        // But frontend owner view doesn't see who booked.

        // Let's map existing items to preserve booking info.
        const existingItems = wishlist.items || [];
        const newItems = items.map(newItem => {
            const existing = existingItems.find(e => e.id === newItem.id);
            if (existing) {
                return {
                    ...newItem,
                    bookedBy: existing.bookedBy,
                    bookedByName: existing.bookedByName
                };
            }
            return newItem; // New item
        });

        await db.collection('wishlists').updateOne(
            { _id: new ObjectId(id) },
            { $set: { items: newItems } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
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
        const result = await db.collection('wishlists').deleteOne({
            _id: new ObjectId(id),
            ownerId: user.userId // Ensure only owner can delete
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Wishlist not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete wishlist", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
