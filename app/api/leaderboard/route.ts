import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

const GameScoreModel = mongoose.models.GameScore || mongoose.model('GameScore', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
}));

export async function GET() {
    try {
        await connectDB();

        const leaderboard = await GameScoreModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    maxScore: { $max: '$score' },
                    level: { $max: '$level' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    maxScore: 1,
                    level: 1,
                },
            },
            { $sort: { maxScore: -1, level: -1 } },
            { $limit: 10 },
        ]);

        return NextResponse.json({ leaderboard });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}