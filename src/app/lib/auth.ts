import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from './db';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class Auth {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  static async register(email: string, password: string, name: string) {
  try {
    await dbConnect();
    console.log('Successfully connected to MongoDB');
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      isOnline: true,
      lastSeen: new Date()
    });

    console.log('User created successfully:', user.email);
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

  static async login(email: string, password: string): Promise<{ user: any; token: string }> {
    await dbConnect();
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id.toString());
    
    // Update user online status
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Remove password before returning
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, token };
  }
}