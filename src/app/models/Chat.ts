import mongoose, { Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  updatedAt: Date;
  type: 'private' | 'group';
  lastMessage?: mongoose.Types.ObjectId;
}

const ChatSchema = new mongoose.Schema<IChat>({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  updatedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['private', 'group'], default: 'private' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);