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
        const { itemId, action } = await request.json(); // action: 'book' or 'unbook'
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        const wishlist = await db.collection('wishlists').findOne({ _id: new ObjectId(id) });

        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        // Check if user is subscriber (or owner? owner shouldn't book their own gifts usually, but maybe?)
        // Requirement: "subscribers to a wish list will see the name of who booked it"
        // "owner of the wishlist will see what present is booked but dont see who will buy it"
        // Implies owner doesn't book.

        if (wishlist.ownerId === user.userId) {
            return NextResponse.json({ error: 'Owner cannot book items' }, { status: 403 });
        }

        if (!wishlist.subscribers.includes(user.userId)) {
            return NextResponse.json({ error: 'Must be a subscriber to book' }, { status: 403 });
        }

        const itemIndex = wishlist.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const item = wishlist.items[itemIndex];

        if (action === 'book') {
            if (item.bookedBy) {
                return NextResponse.json({ error: 'Item already booked' }, { status: 400 });
            }

            const updateField = `items.${itemIndex}.bookedBy`;
            const updateNameField = `items.${itemIndex}.bookedByName`;

            await db.collection('wishlists').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        [updateField]: user.userId,
                        [updateNameField]: user.name
                    }
                }
            );
        } else if (action === 'unbook') {
            if (item.bookedBy !== user.userId) {
                return NextResponse.json({ error: 'Not booked by you' }, { status: 403 });
            }

            const updateField = `items.${itemIndex}.bookedBy`;
            const updateNameField = `items.${itemIndex}.bookedByName`;

            await db.collection('wishlists').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        [updateField]: null,
                        [updateNameField]: null
                    }
                }
            );
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error booking item:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
