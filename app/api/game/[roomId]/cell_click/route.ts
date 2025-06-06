import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import GameRoom from '@/models/GameRoom';
import ReactionGameResult from '@/models/ReactionGameResult';

async function connectDB(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        await connectDB();
        const { roomId } = await params; // Await params
        const { cellId, reactionTime } = await req.json();

        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
        const userId = new mongoose.Types.ObjectId(decoded.userId);

        const room = await GameRoom.findOne({ roomId });
        if (!room || !room.isActive) {
            return NextResponse.json({ error: 'Room not active or not found' }, { status: 400 });
        }

        const sideIndex = room.sideA.includes(userId) ? 0 : 4;
        if (cellId < sideIndex || cellId >= sideIndex + 4) {
            return NextResponse.json({ error: 'Invalid cell for this user' }, { status: 400 });
        }

        let gameResult = await ReactionGameResult.findOne({ roomId });
        if (!gameResult) {
            gameResult = new ReactionGameResult({
                roomId,
                gameMode: room.gameMode,
                sideAReactionTimes: [],
                sideBReactionTimes: [],
            });
        }

        if (room.sideA.includes(userId)) {
            if (!gameResult.sideAReactionTimes.some((r) => r.userId.equals(userId))) {
                gameResult.sideAReactionTimes.push({ userId, reactionTime });
            }
        } else {
            if (!gameResult.sideBReactionTimes.some((r) => r.userId.equals(userId))) {
                gameResult.sideBReactionTimes.push({ userId, reactionTime });
            }
        }

        await gameResult.save();

        const totalPlayers = room.sideA.length + room.sideB.length;
        if (gameResult.sideAReactionTimes.length + gameResult.sideBReactionTimes.length >= totalPlayers) {
            const sideAAvg =
                gameResult.sideAReactionTimes.reduce((sum: number, r: { reactionTime: number }) => sum + r.reactionTime, 0) /
                gameResult.sideAReactionTimes.length;
            const sideBAvg =
                gameResult.sideBReactionTimes.reduce((sum: number, r: { reactionTime: number }) => sum + r.reactionTime, 0) /
                gameResult.sideBReactionTimes.length;
            gameResult.winner = sideAAvg < sideBAvg ? 'SideA' : sideBAvg < sideAAvg ? 'SideB' : 'Draw';
            room.isActive = false;
            await Promise.all([gameResult.save(), room.save()]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing cell click:', error);
        return NextResponse.json({ error: 'Failed to process click' }, { status: 500 });
    }
}