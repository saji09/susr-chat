import { NextRequest, NextResponse } from 'next/server';
import { Auth } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Incoming register body:', body);

    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await Auth.register(email, password, name);
    const token = Auth.generateToken(user.id);

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  }
}
