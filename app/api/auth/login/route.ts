import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGODB_URI!);
            console.log("Connected to MongoDB via Mongoose");
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }
}

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
        console.log('Received:', { email, password });

        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        console.log('User found:', { email: user.email, passwordExists: !!user.password, password: user.password });

        if (!user.password) {
            return NextResponse.json({ error: 'Password not set for this user' }, { status: 500 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('Generated token:', token);

        // ارسال توکن در بدنه پاسخ JSON
        return NextResponse.json({
            user: { email: user.email, name: user.name },
            token: token
        });
    } catch (error) {
        console.error('Error:', error);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}