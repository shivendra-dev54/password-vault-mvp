import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { connectDB } from "@/db";
import { User } from "@/db/schemas/user.schema";

export async function POST(request: NextRequest) {
    try {
        const refresh_token_old = request.cookies.get("refresh_token")?.value;
        if (!refresh_token_old?.trim()) return NextResponse.json(ApiResponse.response(400, "Refresh token not found.", null, false), { status: 400 });

        await connectDB();

        const user = await User.findOne({ refresh_token: refresh_token_old });
        if (!user) return NextResponse.json(ApiResponse.response(400, "Token does not match DB.", null, false), { status: 400 });

        const access_token_new = jwt.sign(
            {
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "1h" }
        );

        const refresh_token_new = jwt.sign(
            {
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "7d" }
        );

        user.access_token = access_token_new;
        user.refresh_token = refresh_token_new;
        await user.save();

        const response = NextResponse.json(ApiResponse.response(201, "Tokens refreshed successfully", { username: user.username, email: user.email }), { status: 201 });

        const isProd = process.env.NODE_ENV === "production";
        response.cookies.set({
            name: "access_token",
            value: access_token_new,
            httpOnly: true,
            path: "/",
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            maxAge: 60 * 60, // 1 hour
        });

        response.cookies.set({
            name: "refresh_token",
            value: refresh_token_new,
            httpOnly: true,
            path: "/",
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
