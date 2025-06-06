import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import GameRoom from '@/models/GameRoom';
import ReactionGameResult from '@/models/ReactionGameResult';

async function connectDB(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        await connectDB();
        const { roomId } = await params; // Await params to get roomId

        const room = await GameRoom.findOne({ roomId });
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const gameResult = await ReactionGameResult.findOne({ roomId });
        return NextResponse.json({
            room: {
                roomId: room.roomId,
                sideA: room.sideA,
                sideB: room.sideB,
                readyUsers: room.readyUsers,
                isActive: room.isActive,
                grid: room.grid,
                startTime: room.startTime,
            },
            gameResult: gameResult
                ? {
                    sideAReactionTimes: gameResult.sideAReactionTimes,
                    sideBReactionTimes: gameResult.sideBReactionTimes,
                    winner: gameResult.winner,
                }
                : null,
        });
    } catch (error) {
        console.error('Error checking room:', error);
        return NextResponse.json({ error: 'Failed to check room' }, { status: 500 });
    }
}