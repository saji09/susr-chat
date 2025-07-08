import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const { user, token } = await Auth.login(email, password);
    
    return NextResponse.json({ user, token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}