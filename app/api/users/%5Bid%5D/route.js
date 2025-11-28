
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ name: user.name });
    } catch (error) {
        console.error('Get user by ID error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
