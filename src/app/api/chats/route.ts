import { Auth } from '@/app/lib/auth';
import { Database } from '@/app/lib/database';
import Chat from '@/app/models/Chat';
import { NextRequest, NextResponse } from 'next/server';

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
    
    const chats = await Database.getChatsByUser(decoded.userId);
    return NextResponse.json(chats);
  } catch (error: unknown) {
    console.error('Error fetching chats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
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
    
    const { participants, type = 'private' } = await request.json();
    
    if (!participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: 'Participants array required' },
        { status: 400 }
      );
    }
    
    // Convert all to strings and ensure uniqueness
    const allParticipants = [...new Set([
      decoded.userId, 
      ...participants.map((p: any) => p.toString())
    ])];
    
    // Check for existing chat
    const existingChat = await Database.getChatByParticipants(allParticipants);
    if (existingChat) {
      return NextResponse.json(existingChat);
    }
    
    // Create new chat
    const newChat = await Database.saveChat({
      participants: allParticipants,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Populate the response
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email isOnline lastSeen')
      .lean();
    
    return NextResponse.json(populatedChat);
  } catch (error: unknown) {
    console.error('Error creating chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create chat';
    return NextResponse.json(
      { 
        error: 'Failed to create chat',
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}