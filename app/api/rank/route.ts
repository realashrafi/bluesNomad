import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

// تعریف مدل User
const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}));

// تعریف مدل GameScore
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

export async function POST(request: Request) {
    try {
        await connectDB();

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 });
        }

        if (!mongoose.isValidObjectId(userId)) {
            return NextResponse.json({ error: 'شناسه کاربر نامعتبر است' }, { status: 400 });
        }

        // بررسی وجود کاربر
        const userExists = await UserModel.findById(userId);
        if (!userExists) {
            return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
        }

        // محاسبه امتیاز و عملکرد کاربران با استفاده از aggregation
        const leaderboard = await GameScoreModel.aggregate([
            // مرحله 1: گروه‌بندی بر اساس کاربر و استیج
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        stage: '$stage'
                    },
                    bestScore: { $max: '$score' },
                    maxLevel: { $max: '$level' }
                }
            },
            // مرحله 2: گروه‌بندی مجدد فقط بر اساس userId
            {
                $group: {
                    _id: '$_id.userId',
                    totalScore: { $sum: '$bestScore' }, // جمع بهترین امتیازهای هر استیج
                    maxLevel: { $max: '$maxLevel' }
                }
            },
            // مرحله 3: مرتب‌سازی بر اساس امتیاز کل و سپس سطح
            { $sort: { totalScore: -1, maxLevel: -1 } }
        ]);

        // پیدا کردن رنک کاربر
        const userRank = leaderboard.findIndex(user => user._id.toString() === userId) + 1;

        if (userRank === 0) {
            return NextResponse.json({ error: 'کاربر در لیدربرد یافت نشد' }, { status: 404 });
        }

        // پیدا کردن آخرین استیجی که کاربر با موفقیت کامل کرده
        const allStages = await GameScoreModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), isSuccess: true } }, // فقط اسنادی که isSuccess: true هستند
            { $sort: { timestamp: -1 } }, // مرتب‌سازی بر اساس جدیدترین timestamp
            { $limit: 1 }, // جدیدترین سند
            { $project: { stage: 1, _id: 0 } } // فقط فیلد stage را برگردان
        ]);

        const lastAllSuccessStage = allStages.length > 0 ? allStages[0].stage : null;

        // بررسی اینکه آیا کاربر در ۵ رتبه برتر است و stage8 را کامل کرده
        const isTopFive = userRank <= 5 && lastAllSuccessStage === 'stage8';

        // پاسخ نهایی
        return NextResponse.json({
            rank: userRank,
            isTopFive: isTopFive
        });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}