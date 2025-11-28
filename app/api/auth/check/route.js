import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ isLoggedIn: false });
        }

        try {
            jwt.verify(token.value, process.env.JWT_SECRET);
            return NextResponse.json({ isLoggedIn: true });
        } catch (e) {
            return NextResponse.json({ isLoggedIn: false });
        }
    } catch (error) {
        return NextResponse.json({ isLoggedIn: false });
    }
}
