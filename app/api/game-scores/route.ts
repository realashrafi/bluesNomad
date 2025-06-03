import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

async function connectDB(): Promise<void> {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI!);
            // console.log('Connected to MongoDB');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('MongoDB connectivity error');
    }
}

const GameScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    stage: { type: String, default: 'default-stage' },
    isSuccess: { type: Boolean, default: false },
    isUsedHint: { type: Boolean, default: false },
    unUsedHints: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }, // اصلاح تعریف timestamp
});

// حذف مدل قدیمی برای توسعه (در محیط تولید از مهاجرت استفاده کنید)
delete mongoose.models.GameScore;
const GameScoreModel = mongoose.model('GameScore', GameScoreSchema);

export async function POST(request: Request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            // console.log('No token provided in request');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
            // console.log('Token decoded:', decoded);
        } catch (error) {
            console.error('JWT verification error:', error);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        // console.log('Received body:', body);

        const { score, level, stage, isSuccess, isUsedHint, unUsedHints } = body;
        if (!score || !level) {
            // console.log('Missing required fields: score or level');
            return NextResponse.json({ error: 'Score and level are required' }, { status: 400 });
        }

        // اعتبارسنجی userId
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            // console.log('Invalid userId:', decoded.userId);
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }

        const gameScore = new GameScoreModel({
            userId: new mongoose.Types.ObjectId(decoded.userId),
            score,
            level,
            stage: stage || 'default-stage',
            isSuccess: isSuccess ?? false,
            isUsedHint: isUsedHint ?? false,
            unUsedHints: unUsedHints ?? 0,
        });

        await gameScore.save();
        // console.log('Score saved:', gameScore);

        return NextResponse.json({ message: 'Score saved successfully', gameScore }, { status: 201 });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            // console.log('No token provided in GET request');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
            // console.log('Token decoded for GET:', decoded);
        } catch (error) {
            console.error('JWT verification error in GET:', error);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            // console.log('Invalid userId:', decoded.userId);
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }

        const scores = await GameScoreModel.find({ userId: new mongoose.Types.ObjectId(decoded.userId) })
            .sort({ timestamp: -1 })
            .lean();
        // console.log('Retrieved scores:', scores);

        return NextResponse.json({ scores });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}