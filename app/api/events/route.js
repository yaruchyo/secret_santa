import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Find events where I am the owner OR a participant
    const events = await db.collection('events').find({
        $or: [
            { ownerId: user.userId },
            { 'participants.userId': user.userId }
        ]
    }).toArray();

    return NextResponse.json(events);
}

export async function POST(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, deadline } = await request.json();

        if (!name || !deadline) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // Generate a unique 6-character invitation code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newEvent = {
            name,
            deadline: new Date(deadline),
            ownerId: user.userId,
            ownerName: user.name,
            code,
            participants: [{ userId: user.userId, wishlist: [] }], // Owner auto-joins
            status: 'active', // active, matched
            inviteId: crypto.randomUUID(),
            createdAt: new Date(),
        };

        const result = await db.collection('events').insertOne(newEvent);

        return NextResponse.json({ ...newEvent, _id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
