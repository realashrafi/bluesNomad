import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    name: { type: String, required: true }
}, { timestamps: true, strict: true }); // اضافه کردن strict: true
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, password, name } = await req.json();
        console.log('Received:', { email, password, name });

        if (!email || !password || !name) {
            return NextResponse.json({ error: "ایمیل، پسورد یا نام خالیه!" }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "کاربر قبلاً ثبت‌نام کرده!" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            name
        });
        console.log('New user before save:', newUser.toObject()); // لاگ قبل از ذخیره
        const result = await newUser.save();
        console.log('Saved user:', result.toObject()); // لاگ بعد از ذخیره
        console.log('Password stored:', !!result.password); // تأیید وجود password

        return NextResponse.json({ message: "ثبت‌نام با موفقیت انجام شد", userId: result._id });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: "یه خطایی پیش اومده!" }, { status: 500 });
    }
}