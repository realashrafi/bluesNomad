import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import GameRoom from '@/models/GameRoom';

async function connectDB(): Promise<void> {
    try {
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI!);
            console.log('MongoDB connected');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('MongoDB connection failed');
    }
}

export async function POST(req: Request) {
    try {
        console.log('POST /api/game/create_room called');
        await connectDB();
        const { roomId, gameMode, side } = await req.json();
        console.log('Request body:', { roomId, gameMode, side });

        if (!roomId || !['1v1', '2v2', '3v3', '4v4'].includes(gameMode) || !['SideA', 'SideB'].includes(side)) {
            console.log('Invalid input');
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.log('No token provided');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
        const userId = new mongoose.Types.ObjectId(decoded.userId);
        console.log('User ID:', userId);

        const existingRoom = await GameRoom.findOne({ roomId });
        if (existingRoom) {
            console.log('Room already exists');
            return NextResponse.json({ error: 'Room already exists' }, { status: 400 });
        }

        const room = new GameRoom({
            roomId,
            gameMode,
            sideA: side === 'SideA' ? [userId] : [],
            sideB: side === 'SideB' ? [userId] : [],
            readyUsers: [],
        });
        console.log('New room created:', room);

        await room.save();
        console.log('Room saved:', room);

        return NextResponse.json({
            room: { roomId: room.roomId, sideA: room.sideA, sideB: room.sideB, readyUsers: room.readyUsers },
        });
    } catch (error) {
        console.error('Error in create_room:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}