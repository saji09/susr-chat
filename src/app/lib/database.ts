import mongoose from "mongoose";
import User from "../models/User";
import Chat from "../models/Chat";
import Message from "../models/Message";
import db from "./db";

export class Database {
  // Users
  static async getUsers(): Promise<any[]> {
    await db();
    return User.find().select("-password").lean();
  }

  static async saveUser(user: any): Promise<void> {
    await db();
    await User.findOneAndUpdate(
      { _id: user._id || new mongoose.Types.ObjectId() },
      user,
      { upsert: true, new: true }
    );
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    await db();
    return User.findOne({ email }).select("+password").lean();
  }

  static async getUserById(id: string): Promise<any | null> {
    await db();
    return User.findById(id).select("-password").lean();
  }

  // Messages
  static async getMessages(): Promise<any[]> {
    await db();
    return Message.find().lean();
  }

  static async saveMessage(message: any): Promise<void> {
    await db();
    const newMessage = new Message(message);
    await newMessage.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(message.chatId, {
      lastMessage: newMessage._id,
      updatedAt: new Date(),
    });
  }

  static async getMessagesByChat(chatId: string): Promise<any[]> {
    await db();
    return Message.find({ chatId })
      .populate("senderId", "name email")
      .sort({ timestamp: 1 })
      .lean();
  }

  // Chats
  static async getChats(): Promise<any[]> {
    await db();
    return Chat.find()
      .populate("participants", "name email isOnline lastSeen")
      .populate("lastMessage")
      .lean();
  }

  static async saveChat(chatData: any): Promise<any> {
  await db();
  const chat = new Chat(chatData);
  await chat.save();
  return chat;
}

static async getChatByParticipants(participantIds: string[]): Promise<any | null> {
  await db();
  return Chat.findOne({
    participants: { $all: participantIds },
    type: 'private'
  })
  .populate('participants', 'name email isOnline lastSeen')
  .lean();
}

  static async getChatsByUser(userId: string): Promise<any[]> {
    await db();
    return Chat.find({ participants: userId })
      .populate("participants", "name email isOnline lastSeen")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();
  }

}
