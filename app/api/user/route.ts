import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
// import { User } from '@/models/User'; // مدل کاربر

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
    }
}

const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
}));

export async function GET(request: Request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        // اعتبارسنجی توکن
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}