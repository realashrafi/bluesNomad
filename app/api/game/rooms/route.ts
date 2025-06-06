import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

export async function GET(req: Request) {
    try {
        console.log('GET /api/game/rooms called');
        await connectDB();

        const rooms = await GameRoom.find({}).select('roomId gameMode sideA sideB isActive');
        console.log('Rooms found:', rooms);

        return NextResponse.json({ rooms });
    } catch (error) {
        console.error('Error in get_rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}