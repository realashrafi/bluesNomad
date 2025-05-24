import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import client from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "ایمیل یا پسورد خالیه!" }, { status: 400 });
        }

        const db = client.db("blues-nomad");
        const users = db.collection("users");

        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "کاربر قبلاً ثبت‌نام کرده!" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });

        return NextResponse.json({ message: "ثبت‌نام با موفقیت انجام شد", userId: result.insertedId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "یه خطایی پیش اومده!" }, { status: 500 });
    }
}
