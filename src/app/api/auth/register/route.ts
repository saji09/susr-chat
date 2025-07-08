import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    const user = await Auth.register(email, password, name);
    const token = Auth.generateToken(user.id);
    
    return NextResponse.json({ user, token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  }
}