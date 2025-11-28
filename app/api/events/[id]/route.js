import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { runMatching } from '@/lib/matching';

export async function GET(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        let event = await db.collection('events').findOne({ _id: new ObjectId(id) });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Lazy Trigger: Check if deadline passed and still active
        if (event.status === 'active' && new Date() > new Date(event.deadline)) {
            await runMatching(db, event._id);
            // Re-fetch event after matching
            event = await db.collection('events').findOne({ _id: new ObjectId(id) });
        }

        // Populate participants
        if (event.participants && event.participants.length > 0) {
            const userIds = event.participants.map(p => new ObjectId(p.userId));
            const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
            const userMap = users.reduce((acc, u) => {
                acc[u._id.toString()] = u;
                return acc;
            }, {});

            event.participants = event.participants.map(p => {
                const userDetails = userMap[p.userId] || {};
                return {
                    ...p,
                    name: userDetails.name || p.name || 'Unknown',
                    email: userDetails.email || p.email || 'Unknown'
                };
            });
        }

        // Filter data based on role
        const isOwner = event.ownerId === user.userId;
        const participant = event.participants.find(p => p.userId === user.userId);

        if (!isOwner && !participant) {
            // Allow viewing basic info to join? Or restrict?
            // For now, return basic info so they can see what they are joining if they have the link
            // But maybe better to only allow if they are in participants list or owner.
            // If they are not in, they should probably use the join flow.
            // But let's return it so the UI can decide.
        }

        // Hide assignments from non-owners? 
        // Actually, assignments should be private. Each user should only see their own assignment.
        if (event.assignments) {
            if (participant) {
                // Assignments might still use email if they were created before migration or if runMatching uses email
                // But we should try to match by email OR userId if we update assignments later
                // For now, let's assume assignments use email as per current runMatching
                const myAssignment = event.assignments.find(a => a.giverEmail === user.email);
                event.myAssignment = myAssignment;
            }
            // Remove full assignments list for privacy unless owner? 
            // Even owner shouldn't necessarily see who got who to keep it secret?
            // Usually owner manages it. Let's hide full assignments list from everyone to keep it SECRET Santa.
            delete event.assignments;
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { wishlist } = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        await db.collection('events').updateOne(
            { _id: new ObjectId(id), 'participants.userId': user.userId },
            { $set: { 'participants.$.wishlist': wishlist } }
        );

        return NextResponse.json({ message: 'Wishlist updated' });
    } catch (error) {
        console.error('Update wishlist error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
