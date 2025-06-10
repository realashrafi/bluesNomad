import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "@/models/User";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGODB_URI!);
            // console.log("Connected to MongoDB via Mongoose");
        } catch (error) {
            // console.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, password, name } = await req.json();
        // console.log('Received:', { email, password, name });

        if (!email || !password || !name) {
            return NextResponse.json({ error: "ایمیل، پسورد یا نام خالیه!" }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "کاربر قبلاً ثبت‌نام کرده!" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log('Hashed password:', hashedPassword);

        const newUserData = { email, password: hashedPassword, name };
        // console.log('New user data:', newUserData);
        const newUser = new UserModel(newUserData);
        // console.log('New user before save (raw):', newUser.toObject());
        // console.log('Password in newUser:', !!newUser.password);

        const result = await newUser.save();
        // console.log('Saved user (raw):', result.toObject());
        // console.log('Password stored:', !!result.password);

        return NextResponse.json({ message: "ثبت‌نام با موفقیت", userId: result._id });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: "یه خطایی!" }, { status: 500 });
    }
}