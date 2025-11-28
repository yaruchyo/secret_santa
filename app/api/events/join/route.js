import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        const event = await db.collection('events').findOne({ code: code.toUpperCase() });

        if (!event) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
        }

        if (event.status !== 'active') {
            return NextResponse.json({ error: 'Event is closed' }, { status: 400 });
        }

        // Check if already joined
        const isParticipant = event.participants.some(p => p.userId === user.userId);
        if (isParticipant) {
            return NextResponse.json({ message: 'Already joined', eventId: event._id }, { status: 200 });
        }

        // Add to participants
        await db.collection('events').updateOne(
            { _id: event._id },
            { $push: { participants: { userId: user.userId, wishlist: [] } } }
        );

        return NextResponse.json({ message: 'Joined successfully', eventId: event._id }, { status: 200 });
    } catch (error) {
        console.error('Join event error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
