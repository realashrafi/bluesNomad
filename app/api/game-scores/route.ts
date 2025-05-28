import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

const GameScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const GameScoreModel = mongoose.models.GameScore || mongoose.model('GameScore', GameScoreSchema);

export async function POST(request: Request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };

        const { score, level } = await request.json();
        if (!score || !level) {
            return NextResponse.json({ error: 'Score and level are required' }, { status: 400 });
        }

        const gameScore = new GameScoreModel({
            userId: decoded.userId,
            score,
            level,
        });

        await gameScore.save();

        return NextResponse.json({ message: 'Score saved successfully', gameScore }, { status: 201 });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };

        const scores = await GameScoreModel.find({ userId: decoded.userId })
            .sort({ timestamp: -1 })
            .lean();

        return NextResponse.json({ scores });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}