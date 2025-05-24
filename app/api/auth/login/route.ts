import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { User } from '@/models/User'; // مدل کاربر را وارد کنید

// اتصال به دیتابیس
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

// مدل کاربر (فرض می‌کنیم این مدل وجود دارد)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
});
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(request: Request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        // پیدا کردن کاربر
        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // بررسی رمز عبور
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // تولید توکن JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' } // توکن برای ۱ ساعت معتبر است
        );

        return NextResponse.json({ token, user: { email: user.email, name: user.name } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}