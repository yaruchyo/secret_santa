import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import EventView from '@/components/EventView';
import { runMatching } from '@/lib/matching';

async function getEvent(id, user) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    let event = await db.collection('events').findOne({ _id: new ObjectId(id) });

    if (!event) return null;

    // Lazy Trigger
    if (event.status === 'active' && new Date() > new Date(event.deadline)) {
        await runMatching(db, event._id);
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

        event.participants = event.participants.map(p => ({
            ...p,
            name: userMap[p.userId]?.name || p.name || 'Unknown',
            email: userMap[p.userId]?.email || p.email || 'Unknown'
        }));
    }

    // Process data for serialization
    event._id = event._id.toString();
    event.deadline = event.deadline.toISOString();
    event.createdAt = event.createdAt.toISOString();

    if (event.assignments) {
        const myAssignment = event.assignments.find(a => a.giverEmail === user.email);
        if (myAssignment) {
            event.myAssignment = myAssignment;
        }
        delete event.assignments;
    }

    return event;
}

export default async function Page({ params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return <div>Please login</div>;
    }

    let user;
    try {
        user = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (e) {
        return <div>Invalid session</div>;
    }

    const event = await getEvent(id, user);

    if (!event) {
        return <div>Event not found</div>;
    }

    return <EventView initialEvent={event} user={user} />;
}
