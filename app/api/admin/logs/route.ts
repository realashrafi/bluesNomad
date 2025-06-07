import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// تعریف نوع برای payload توکن JWT
interface JwtPayload {
    userId: string;
    email: string;
}

// تعریف نوع برای سند کاربر
interface User {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    createdAt: Date;
    __v?: number; // فیلد اختیاری برای پشتیبانی از فیلدهای Mongoose
}

// تعریف نوع برای سند GameScore
interface GameLog {
    score: number;
    level: number;
    stage: string;
    isSuccess: boolean;
    isUsedHint: boolean;
    unUsedHints: number;
    timestamp: Date;
    __v?: number; // فیلد اختیاری برای پشتیبانی از فیلدهای Mongoose
}

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

// تعریف مدل User
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// تعریف مدل GameScore
const GameScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    stage: { type: String, required: true },
    isSuccess: { type: Boolean, required: true },
    isUsedHint: { type: Boolean, required: true },
    unUsedHints: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const GameScoreModel = mongoose.models.GameScore || mongoose.model('GameScore', GameScoreSchema);

export async function POST(request: Request) {
    try {
        await connectDB();

        // اعتبارسنجی توکن
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'توکن ارائه نشده است' }, { status: 401 });
        }

        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'توکن نامعتبر است';
            return NextResponse.json({ error: errorMessage }, { status: 401 });
        }

        // شرط ایمیل: فقط ایمیل ادمین اجازه دسترسی دارد
        const adminEmail = 'ccvali@outlook.com'; // ایمیل ادمین
        if (decoded.email !== adminEmail) {
            return NextResponse.json({ error: 'دسترسی غیرمجاز: فقط ادمین می‌تواند پاسخ دریافت کند' }, { status: 403 });
        }

        // گرفتن همه کاربران
        const usersRaw = await UserModel.find().lean();
        if (!usersRaw || usersRaw.length === 0) {
            return NextResponse.json({ error: 'هیچ کاربری یافت نشد' }, { status: 404 });
        }

        // تبدیل به نوع User[] با بررسی دقیق
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        const users: User[] = usersRaw.map(user => ({
            _id: user._id,
            name: user.name as string,
            email: user.email as string,
            createdAt: user.createdAt as Date,
            __v: user.__v as number | undefined,
        }));

        // گرفتن لاگ‌های بازی برای هر کاربر
        const response = await Promise.all(
            users.map(async (user) => {
                const gameLogsRaw = await GameScoreModel.find({ userId: user._id })
                    .select('score level stage isSuccess isUsedHint unUsedHints timestamp')
                    .sort({ timestamp: -1 }) // مرتب‌سازی بر اساس زمان نزولی
                    .lean();

                const gameLogs: GameLog[] = gameLogsRaw.map(log => ({
                    score: log.score as number,
                    level: log.level as number,
                    stage: log.stage as string,
                    isSuccess: log.isSuccess as boolean,
                    isUsedHint: log.isUsedHint as boolean,
                    unUsedHints: log.unUsedHints as number,
                    timestamp: log.timestamp as Date,
                    __v: log.__v as number | undefined,
                }));

                return {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.createdAt
                    },
                    gameLogs: gameLogs.map(log => ({
                        score: log.score,
                        level: log.level,
                        stage: log.stage,
                        isSuccess: log.isSuccess,
                        isUsedHint: log.isUsedHint,
                        unUsedHints: log.unUsedHints,
                        timestamp: log.timestamp
                    }))
                };
            })
        );

        return NextResponse.json({ users: response }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطای ناشناخته';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}