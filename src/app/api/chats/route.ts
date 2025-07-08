import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../lib/database';
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
    
    const chats = Database.getChatsByUser(decoded.userId);
    
    // Get chat details with participant names
    const chatsWithDetails = chats.map(chat => {
      const otherParticipants = chat.participants.filter(p => p !== decoded.userId);
      const participantDetails = otherParticipants.map(p => Database.getUserById(p)).filter(Boolean);
      
      return {
        ...chat,
        participantDetails,
        lastMessage: chat.lastMessage
      };
    });
    
    return NextResponse.json(chatsWithDetails);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}