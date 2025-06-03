import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

// فقط UserModel نیاز است، چون GameScoreModel استفاده نمی‌شود
const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}));

export async function POST(request:Request) {
    try {
        await connectDB();

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'شناسه کاربر الزامی است' }, { status: 400 });
        }

        if (!mongoose.isValidObjectId(userId)) {
            return NextResponse.json({ error: 'شناسه کاربر نامعتبر است' }, { status: 400 });
        }

        const users = await UserModel.find()
            .select('_id createdAt')
            .sort({ createdAt: 1 });

        const userRank = users.findIndex(user => user._id.toString() === userId) + 1;

        if (userRank === 0) {
            return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
        }

        const formattedRank = 1000 + userRank;

        return NextResponse.json({ rank: formattedRank });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}