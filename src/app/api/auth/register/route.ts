import { Auth } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    const user = await Auth.register(email, password, name);
    const token = Auth.generateToken(user._id.toString());
    
    return NextResponse.json({ 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }, 
      token 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}