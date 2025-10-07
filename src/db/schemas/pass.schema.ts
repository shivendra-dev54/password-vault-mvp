import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPass extends Document {
    userId: Types.ObjectId;
    iv: string;
    ciphertext: string;
    createdAt: Date;
    updatedAt: Date;
}

const PassSchema: Schema<IPass> = new Schema<IPass>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        iv: { type: String, required: true },
        ciphertext: { type: String, required: true },
    },
    { timestamps: true }
);

export const Pass: Model<IPass> =
    mongoose.models.Pass || mongoose.model<IPass>("Pass", PassSchema);
