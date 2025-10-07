import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    access_token?: string;
    refresh_token?: string;
    encSalt: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        access_token: { type: String },
        refresh_token: { type: String },
        encSalt: { type: String, required: true },
    },
    { timestamps: true }
);

// Prevent model overwrite in dev
export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
