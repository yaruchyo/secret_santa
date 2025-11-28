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

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        const event = await db.collection('events').findOne({ _id: new ObjectId(id) });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // If user is the owner, delete the entire event
        if (event.ownerId === user.userId) {
            await db.collection('events').deleteOne({ _id: new ObjectId(id) });
            return NextResponse.json({ message: 'Event deleted', isOwner: true });
        }

        // Otherwise, remove user from participants
        await db.collection('events').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { participants: { userId: user.userId } } }
        );

        return NextResponse.json({ message: 'Left event successfully', isOwner: false });
    } catch (error) {
        console.error('Leave event error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
