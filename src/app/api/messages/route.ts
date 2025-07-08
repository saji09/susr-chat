import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../lib/database';
import { Auth } from '../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = Auth.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }
    
    const messages = Database.getMessagesByChat(chatId);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = Auth.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { chatId, content, recipientEmail } = await request.json();
    
    let finalChatId = chatId;
    
    // If no chatId provided, create/find chat with recipient
    if (!chatId && recipientEmail) {
      const recipient = Database.getUserByEmail(recipientEmail);
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
      
      let chat = Database.getChatByParticipants([decoded.userId, recipient.id]);
      if (!chat) {
        chat = {
          id: uuidv4(),
          participants: [decoded.userId, recipient.id],
          updatedAt: new Date().toISOString(),
          type: 'private'
        };
        Database.saveChat(chat);
      }
      finalChatId = chat.id;
    }
    
    const message = {
      id: uuidv4(),
      chatId: finalChatId,
      senderId: decoded.userId,
      content,
      timestamp: new Date().toISOString(),
      type: 'text' as const,
      status: 'sent' as const
    };
    
    Database.saveMessage(message);
    
    // Update chat's last message
    const chat = Database.getChats().find(c => c.id === finalChatId);
    if (chat) {
      chat.lastMessage = message;
      chat.updatedAt = new Date().toISOString();
      Database.saveChat(chat);
    }
    
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}