import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { Pass } from "@/db/schemas/pass.schema";
import { User } from "@/db/schemas/user.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { encryptVaultItem } from "@/utils/crypto";
import crypto from "crypto";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await params to get the id
    const { id } = await params;
    
    const userHeader = req.headers.get("x-user");
    const userId = JSON.parse(userHeader!)?.data.id;
    if (!userId)
      return NextResponse.json(
        ApiResponse.response(401, "Unauthorized", null, false),
        { status: 401 }
      );

    const { title, username, password, url, notes } = await req.json();

    const vaultItem = await Pass.findById(id);
    if (!vaultItem || vaultItem.userId.toString() !== userId)
      return NextResponse.json(
        ApiResponse.response(404, "Vault item not found", null, false),
        { status: 404 }
      );

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json(
        ApiResponse.response(404, "User not found", null, false),
        { status: 404 }
      );

    const key = crypto.createHash("sha256").update(user.encSalt).digest();
    const plaintext = JSON.stringify({ title, username, password, url, notes });
    const { iv, ciphertext } = encryptVaultItem(plaintext, key);

    vaultItem.iv = iv;
    vaultItem.ciphertext = ciphertext;
    await vaultItem.save();

    return NextResponse.json(
      ApiResponse.response(200, "Vault item updated", null),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      ApiResponse.response(500, "Internal server error", null, false),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await params to get the id
    const { id } = await params;
    
    const userHeader = req.headers.get("x-user");
    const userId = JSON.parse(userHeader!)?.data.id;
    if (!userId)
      return NextResponse.json(
        ApiResponse.response(401, "Unauthorized", null, false),
        { status: 401 }
      );

    const vaultItem = await Pass.findById(id);
    if (!vaultItem || vaultItem.userId.toString() !== userId)
      return NextResponse.json(
        ApiResponse.response(404, "Vault item not found", null, false),
        { status: 404 }
      );

    await vaultItem.deleteOne();
    return NextResponse.json(
      ApiResponse.response(200, "Vault item deleted", null),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      ApiResponse.response(500, "Internal server error", null, false),
      { status: 500 }
    );
  }
}