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

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        console.log('POST /api/game/[roomId]/join_room called');
        await connectDB();
        const { roomId } = await params;
        console.log('Room ID:', roomId);
        const { gameMode, side } = await req.json();
        console.log('Request body:', { gameMode, side });

        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.log('No token provided');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
        const userId = new mongoose.Types.ObjectId(decoded.userId);
        console.log('User ID:', userId);

        const room = await GameRoom.findOne({ roomId });
        console.log('Existing room:', room);
        if (!room) {
            console.log('Room not found');
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        if (room.gameMode !== gameMode) {
            console.log('Game mode mismatch');
            return NextResponse.json({ error: 'Game mode mismatch' }, { status: 400 });
        }

        const maxPlayersPerSide = parseInt(gameMode[0]);
        if (side === 'SideA' && room.sideA.length < maxPlayersPerSide) {
            if (!room.sideA.includes(userId)) room.sideA.push(userId);
        } else if (side === 'SideB' && room.sideB.length < maxPlayersPerSide) {
            if (!room.sideB.includes(userId)) room.sideB.push(userId);
        } else {
            console.log('Room side is full');
            return NextResponse.json({ error: 'Room side is full' }, { status: 400 });
        }

        await room.save();
        console.log('Room saved:', room);

        return NextResponse.json({
            room: { roomId: room.roomId, sideA: room.sideA, sideB: room.sideB, readyUsers: room.readyUsers },
        });
    } catch (error) {
        console.error('Error in join_room:', error);
        return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }
}