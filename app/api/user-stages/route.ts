import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

// استفاده از همان اسکیمای GameScore
const GameScoreModel = mongoose.models.GameScore || mongoose.model('GameScore', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    stage: { type: String, default: 'stage1' },
    isSuccess: { type: Boolean, default: false },
    isUsedHint: { type: Boolean, default: false },
    unUsedHints: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
}));

export async function GET(request: Request) {
    try {
        await connectDB();

        // اعتبارسنجی توکن
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            console.log('No token provided in GET request');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
            console.log('Token decoded for GET:', decoded);
        } catch (error) {
            console.error('JWT verification error in GET:', error);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // اعتبارسنجی userId
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            console.log('Invalid userId:', decoded.userId);
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }

        const userId = new mongoose.Types.ObjectId(decoded.userId);

        // 1. پیدا کردن آخرین استیج بر اساس timestamp
        const latestStageDoc:any = await GameScoreModel.findOne({ userId })
            .sort({ timestamp: -1 }) // جدیدترین سند
            .select('stage')
            .lean();

        const latestStage = latestStageDoc ? latestStageDoc.stage : null;

        // 2. گرفتن آرایه استیج‌های یکتا
        const uniqueStages = await GameScoreModel.distinct('stage', { userId });

        // 3. پیدا کردن آخرین استیجی که تمام مراحلش isSuccess: true هستند
        const allStages = await GameScoreModel.aggregate([
            { $match: { userId } },
            { $group: {
                    _id: '$stage',
                    allSuccess: { $min: '$isSuccess' }, // اگر همه true باشند، min هم true است
                    maxTimestamp: { $max: '$timestamp' } // برای مرتب‌سازی بر اساس زمان
                } },
            { $match: { allSuccess: true } }, // فقط استیج‌هایی که همه isSuccess=true هستند
            { $sort: { maxTimestamp: -1 } }, // جدیدترین استیج
            { $limit: 1 },
            { $project: { _id: 1 } }
        ]);

        const lastAllSuccessStage = allStages.length > 0 ? allStages[0]._id : null;

        console.log('User stages data:', {
            latestStage,
            uniqueStages,
            lastAllSuccessStage
        });

        return NextResponse.json({
            latestStage,
            uniqueStages,
            lastAllSuccessStage
        }, { status: 200 });

    } catch (error) {
        console.error('GET user-stages error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}