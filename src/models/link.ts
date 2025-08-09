import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILink extends Document {
  longUrl: string;
  shortCode: string;
  visitCount: number;
  createdAt: Date;
}

const LinkSchema: Schema<ILink> = new Schema({
  longUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  visitCount: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// The following line is important: It prevents Mongoose from redefining the model an error on hot reloads.
const Link: Model<ILink> = mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);

export default Link;
