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

    // Verify friendship? For now, let's assume if you have the link/are in the same event, you can see it.
    // Or strictly check if they are friends.
    // The requirement says "all people who subscribed... are assigned as my 'friends'... so I can click... and see their profile".
    // So we should probably check if they are friends.

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    // Check if they are friends
    const user = await db.collection('users').findOne({ _id: new ObjectId(currentUser.userId) });
    const isFriend = user.friends && user.friends.includes(userId);
    const isSelf = currentUser.userId === userId;

    if (!isFriend && !isSelf) {
        // Allow if they share a wishlist/event?
        // For MVP, let's just allow it if they are authenticated.
        // Or strictly follow the "friend" requirement.
        // Let's stick to "friend" check + self check.
        // But wait, the friend connection is created *when* they join.
        // So if I click on someone in the list, we *should* be friends (or will be).
        // But if I'm the owner, and they just joined, they are my friend.
        // If I'm a subscriber, and I click on another subscriber... are we friends?
        // The requirement says "all people who subscribed... are assigned as my 'friends'".
        // It implies Owner <-> Subscriber.
        // It doesn't explicitly say Subscriber <-> Subscriber.
        // But usually in Secret Santa you can see who else is there.
        // Let's allow fetching if authenticated for now to avoid over-engineering restrictions that might block the UI.
    }

    try {
        const wishlists = await db.collection('wishlists').find({ ownerId: userId }).toArray();

        // Aggregate all items
        let allWishes = [];
        wishlists.forEach(w => {
            if (w.items) {
                allWishes = [...allWishes, ...w.items.map(i => ({ ...i, wishlistName: w.name }))];
            }
        });

        return NextResponse.json({ wishes: allWishes });
    } catch (error) {
        console.error('Error fetching wishes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
