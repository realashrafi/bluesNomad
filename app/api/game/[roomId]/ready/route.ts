import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import GameRoom from '@/models/GameRoom';

async function connectDB(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        await connectDB();
        const { roomId } = await params; // Await params
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
        const userId = new mongoose.Types.ObjectId(decoded.userId);

        const room = await GameRoom.findOne({ roomId });
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!room.readyUsers.includes(userId)) {
            room.readyUsers.push(userId);
        }

        if (room.readyUsers.length === room.sideA.length + room.sideB.length) {
            room.isActive = true;
            room.grid = Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0));
            room.startTime = Date.now();
        }

        await room.save();
        return NextResponse.json({ room: { roomId: room.roomId, sideA: room.sideA, sideB: room.sideB, readyUsers: room.readyUsers, isActive: room.isActive, grid: room.grid, startTime: room.startTime } });
    } catch (error) {
        console.error('Error setting ready:', error);
        return NextResponse.json({ error: 'Failed to set ready' }, { status: 500 });
    }
}