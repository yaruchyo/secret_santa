import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import PublicPreview from '@/components/PublicPreview';
import { ObjectId } from 'mongodb';

export default async function InvitePage({ params }) {
    const { inviteId } = await params;
    const user = await getUserFromSession();

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // 1. Find the invite target (Event or Wishlist)
    let type = 'event';
    let data = await db.collection('events').findOne({ inviteId });

    if (!data) {
        type = 'wishlist';
        data = await db.collection('wishlists').findOne({ inviteId });
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <h1 className="text-2xl font-bold">Invalid Invite Link</h1>
            </div>
        );
    }

    // 2. Check restrictions (Deadline, Status)
    const now = new Date();
    if (new Date(data.deadline) < now) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <h1 className="text-2xl font-bold">This invite has expired (Deadline passed)</h1>
            </div>
        );
    }

    if (type === 'event' && data.status !== 'active') {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <h1 className="text-2xl font-bold">This event has already started (Matching completed)</h1>
            </div>
        );
    }

    // 3. If not logged in, show Public Preview
    if (!user) {
        // Serialize data for client component
        const serializedData = {
            ...data,
            _id: data._id.toString(),
            deadline: data.deadline.toISOString(),
            createdAt: data.createdAt.toISOString(),
            // Sanitize sensitive data
            participants: data.participants ? data.participants.map(p => ({ ...p, email: undefined })) : [],
            subscribers: data.subscribers || [],
        };
        return <PublicPreview data={serializedData} type={type} inviteId={inviteId} />;
    }

    // 4. Logged in - Handle Join Logic
    const userId = user.userId;
    let alreadyJoined = false;

    if (type === 'event') {
        alreadyJoined = data.participants.some(p => p.userId === userId);
    } else {
        alreadyJoined = data.subscribers.includes(userId);
    }

    if (!alreadyJoined) {
        // Add to participants/subscribers
        if (type === 'event') {
            await db.collection('events').updateOne(
                { _id: data._id },
                {
                    $push: {
                        participants: {
                            userId: userId,
                            name: user.name,
                            email: user.email,
                            wishlist: []
                        }
                    }
                }
            );
        } else {
            await db.collection('wishlists').updateOne(
                { _id: data._id },
                { $addToSet: { subscribers: userId } }
            );
        }

        // Add Friend Connection (Bidirectional)
        const ownerId = data.ownerId;
        if (ownerId !== userId) {
            // Add owner to user's friends
            await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { friends: ownerId } }
            );
            // Add user to owner's friends
            await db.collection('users').updateOne(
                { _id: new ObjectId(ownerId) },
                { $addToSet: { friends: userId } }
            );
        }
    }

    // 5. Redirect to the actual page
    if (type === 'event') {
        redirect(`/events/${data._id}`);
    } else {
        redirect(`/wishlist/${data._id}`);
    }
}
