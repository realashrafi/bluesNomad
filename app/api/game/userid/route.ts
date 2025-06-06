import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
        return NextResponse.json({ userId: decoded.userId });
    } catch (error) {
        console.error('Error fetching user ID:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}