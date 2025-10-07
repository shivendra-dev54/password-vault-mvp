import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { connectDB } from "@/db";
import { User } from "@/db/schemas/user.schema";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email?.trim()) return NextResponse.json(
            ApiResponse.response(
                400,
                "Email is required",
                null,
                false
            ),
            {
                status: 400
            }
        );

        if (!password?.trim()) return NextResponse.json(
            ApiResponse.response(
                400,
                "Password is required",
                null,
                false
            ),
            {
                status: 400
            }
        );

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json(
            ApiResponse.response(400, "User not found.", null, false),
            { status: 400 }
        );

        const isCorrect = await argon2.verify(user.password, password);
        if (!isCorrect) return NextResponse.json(
            ApiResponse.response(400, "Password is incorrect", null, false),
            { status: 400 }
        );

        const access_token = jwt.sign(
            { data: { id: user._id, username: user.username, email: user.email } },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "1h" }
        );
        const refresh_token = jwt.sign(
            { data: { id: user._id, username: user.username, email: user.email } },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "7d" }
        );

        user.access_token = access_token;
        user.refresh_token = refresh_token;
        await user.save();

        const response = NextResponse.json(
            ApiResponse.response(
                201,
                "User signed in successfully",
                { username: user.username, email: user.email }
            ),
            {
                status: 201
            }
        );

        const isProd = process.env.NODE_ENV === "production";
        response.cookies.set({
            name: "access_token",
            value: access_token,
            httpOnly: true,
            path: "/",
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            maxAge: 60 * 60, // 1 hour
        });

        response.cookies.set({
            name: "refresh_token",
            value: refresh_token,
            httpOnly: true,
            path: "/",
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(
            500,
            "Internal server error",
            null,
            false
        ),
            {
                status: 500
            }
        );
    }
}
