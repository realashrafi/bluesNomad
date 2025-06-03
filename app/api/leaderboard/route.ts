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
    stage: { type: String, required: true },
    isSuccess: { type: Boolean, required: true },
    isUsedHint: { type: Boolean, required: true },
    unUsedHints: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
}));

export async function GET() {
    try {
        await connectDB();

        const leaderboard = await GameScoreModel.aggregate([
            // مرحله 1: گروه‌بندی بر اساس کاربر و استیج
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        stage: '$stage'
                    },
                    bestScore: { $max: '$score' },
                    maxLevel: { $max: '$level' },
                    latestStage: { $last: '$stage' },
                    successCount: { $sum: { $cond: ['$isSuccess', 1, 0] } }, // شمارش موفقیت‌ها در هر استیج
                    hintsUsed: { $sum: { $cond: ['$isUsedHint', 1, 0] } }, // شمارش استفاده از راهنما
                    unUsedHints: { $last: '$unUsedHints' }, // آخرین مقدار راهنماهای استفاده‌نشده
                    latestTimestamp: { $max: '$timestamp' } // جدیدترین زمان
                }
            },
            // مرحله 2: گروه‌بندی مجدد فقط بر اساس userId
            {
                $group: {
                    _id: '$_id.userId',
                    totalScore: { $sum: '$bestScore' }, // جمع بهترین امتیازهای هر استیج
                    maxLevel: { $max: '$maxLevel' },
                    stages: { $push: '$latestStage' }, // جمع‌آوری استیج‌ها
                    totalSuccesses: { $sum: '$successCount' }, // جمع کل موفقیت‌ها
                    totalHintsUsed: { $sum: '$hintsUsed' }, // جمع کل استفاده از راهنما
                    totalUnUsedHints: { $sum: '$unUsedHints' }, // جمع کل راهنماهای استفاده‌نشده
                    lastPlayed: { $max: '$latestTimestamp' }, // آخرین زمان بازی
                    stagesPlayed: { $sum: 1 } // تعداد استیج‌های بازی‌شده
                }
            },
            // مرحله 3: محاسبه بالاترین استیج
            {
                $addFields: {
                    highestStage: {
                        $reduce: {
                            input: '$stages',
                            initialValue: 0,
                            in: {
                                $max: [
                                    '$$value',
                                    {
                                        $toInt: {
                                            $arrayElemAt: [
                                                { $split: ['$$this', 'stage'] },
                                                1
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // مرحله 4: اتصال به مجموعه users
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            // مرحله 5: انتخاب فیلدهای مورد نیاز
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    totalScore: 1,
                    highestStage: 1,
                    maxLevel: 1,
                    totalSuccesses: 1,
                    totalHintsUsed: 1,
                    totalUnUsedHints: 1,
                    lastPlayed: 1,
                    stagesPlayed: 1,
                    _id: 0
                }
            },
            // مرحله 6: مرتب‌سازی بر اساس امتیاز کل و سپس سطح
            { $sort: { totalScore: -1, maxLevel: -1 } }
        ]);

        return NextResponse.json({ leaderboard });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}