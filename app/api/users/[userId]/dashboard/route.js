import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const { userId } = await params;
    const currentUser = await getUserFromSession();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Verify user exists
    const targetUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check friendship (optional but recommended)
    // For now, allowing if authenticated as per previous logic, but ideally check `friends` array.

    try {
        // Fetch wishlists where targetUser is the owner AND isPublic is true
        const wishlists = await db.collection('wishlists').find({
            ownerId: userId,
            $or: [
                { isPublic: true },
                { isPublic: { $exists: false } } // Backward compatibility - treat missing as public
            ]
        }).toArray();

        // We do NOT return events as per "not events" requirement from earlier, 
        // and to preserve secrecy of other circles.

        return NextResponse.json({
            user: {
                name: targetUser.name,
                email: targetUser.email // Maybe hide email?
            },
            wishlists: wishlists
        });
    } catch (error) {
        console.error('Error fetching friend dashboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
