import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // 1. Check Events
        const event = await db.collection('events').findOne({ code: code });

        if (event) {
            // Add to participants if not already there
            const isParticipant = event.participants.some(p => p.userId === user.userId);
            if (!isParticipant) {
                await db.collection('events').updateOne(
                    { _id: event._id },
                    {
                        $push: {
                            participants: {
                                userId: user.userId,
                                name: user.name,
                                email: user.email,
                                wishlist: []
                            }
                        }
                    }
                );
            }
            return NextResponse.json({ type: 'event', id: event._id });
        }

        // 2. Check Wishlists
        const wishlist = await db.collection('wishlists').findOne({ code: code });

        if (wishlist) {
            // Add to subscribers if not already there
            const isSubscriber = wishlist.subscribers.includes(user.userId);
            if (!isSubscriber) {
                await db.collection('wishlists').updateOne(
                    { _id: wishlist._id },
                    { $addToSet: { subscribers: user.userId } }
                );
            }
            return NextResponse.json({ type: 'wishlist', id: wishlist._id });
        }

        return NextResponse.json({ error: 'Invalid code' }, { status: 404 });

    } catch (error) {
        console.error('Join error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
