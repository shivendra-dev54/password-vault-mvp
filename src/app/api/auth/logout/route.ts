import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { connectDB } from "@/db";
import { User } from "@/db/schemas/user.schema";

export async function POST(request: NextRequest) {
    try {
        const refresh_token_old = request.cookies.get("refresh_token")?.value;
        if (!refresh_token_old) return NextResponse.json(ApiResponse.response(400, "No refresh token found", null, false), { status: 400 });

        await connectDB();

        const user = await User.findOne({ refresh_token: refresh_token_old });
        if (user) {
            user.access_token = "";
            user.refresh_token = "";
            await user.save();
        }

        const response = NextResponse.json(ApiResponse.response(201, "Logged out successfully.", {}, true), { status: 201 });

        response.cookies.set({ name: "access_token", value: "", httpOnly: true, path: "/", expires: new Date(0) });
        response.cookies.set({ name: "refresh_token", value: "", httpOnly: true, path: "/", expires: new Date(0) });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
