import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
    const user = await getUserFromSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, email, password } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // Check if email is taken by another user
        if (email !== user.email) {
            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
            }
        }

        const updateData = {
            name,
            email,
            updatedAt: new Date()
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(user.userId) },
            { $set: updateData }
        );

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
