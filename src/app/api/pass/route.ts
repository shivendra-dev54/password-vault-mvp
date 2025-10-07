import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { Pass } from "@/db/schemas/pass.schema";
import { User } from "@/db/schemas/user.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { encryptVaultItem, decryptVaultItem } from "@/utils/crypto";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const userHeader = req.headers.get("x-user");
        const userId = JSON.parse(userHeader!)?.data.id;
        if (!userId) {
            return NextResponse.json(
                ApiResponse.response(
                    401,
                    "Unauthorized",
                    userId,
                    false
                ),
                { status: 401 }
            );
        }

        const { title, username, password, url, notes } = await req.json();

        if (!title || !username || !password) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Missing required fields",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json(ApiResponse.response(404, "User not found", null, false), { status: 404 });

        // derive 256-bit key from user's encSalt
        const key = crypto.createHash("sha256").update(user.encSalt).digest();

        const plaintext = JSON.stringify({ title, username, password, url, notes });
        const { iv, ciphertext } = encryptVaultItem(plaintext, key);

        const vaultItem = await Pass.create({ userId, iv, ciphertext });

        return NextResponse.json(ApiResponse.response(201, "Vault item created", { id: vaultItem._id }), { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const userHeader = req.headers.get("x-user");
        const userId = JSON.parse(userHeader!)?.data.id;
        if (!userId) {
            return NextResponse.json(
                ApiResponse.response(
                    401,
                    "Unauthorized",
                    userId,
                    false
                ),
                { status: 401 }
            );
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json(ApiResponse.response(404, "User not found", null, false), { status: 404 });

        const key = crypto.createHash("sha256").update(user.encSalt).digest();

        const items = await Pass.find({ userId });

        const decryptedItems = items.map(item => {
            const decrypted = JSON.parse(decryptVaultItem(item.ciphertext, item.iv, key));
            return { id: item._id, ...decrypted };
        });

        return NextResponse.json(ApiResponse.response(200, "Vault items fetched", decryptedItems), { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
