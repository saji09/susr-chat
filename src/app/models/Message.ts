import mongoose, { Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video';
  status: 'sent' | 'delivered' | 'read';
}

const MessageSchema = new mongoose.Schema<IMessage>({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);