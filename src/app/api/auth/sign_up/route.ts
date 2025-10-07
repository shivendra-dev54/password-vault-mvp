import * as argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { connectDB } from "@/db";
import { User } from "@/db/schemas/user.schema";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();

        if (!username?.trim()) return NextResponse.json(ApiResponse.response(400, "Username is required", null, false), { status: 400 });
        if (!email?.trim()) return NextResponse.json(ApiResponse.response(400, "Email is required", null, false), { status: 400 });
        if (!password?.trim()) return NextResponse.json(ApiResponse.response(400, "Password is required", null, false), { status: 400 });

        await connectDB();

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const msg = existingUser.username === username ? "User with same username exists." : "User with same email exists.";
            return NextResponse.json(ApiResponse.response(400, msg, null, false), { status: 400 });
        }

        const hashed_pass = await argon2.hash(password);
        const encSalt = crypto.randomBytes(16).toString("base64"); // 128-bit salt for vault encryption

        const user = await User.create({ username, email, password: hashed_pass, encSalt });

        return NextResponse.json(
            ApiResponse.response(201, "User registered successfully", { username: user.username, email: user.email }),
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
