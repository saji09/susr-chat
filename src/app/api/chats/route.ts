import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/db';
import Chat from '../../models/Chat';
import { Auth } from '../../lib/auth';

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
    
    await dbConnect();
    
    const chats = await Chat.find({ participants: decoded.userId })
      .populate('participants', 'name email isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}