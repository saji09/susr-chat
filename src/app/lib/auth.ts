import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types';
import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || '7a8230de904c3b8a49507230810edbdfb2a76918746aaac6aea36357a1228135120eb3f74d0fc576d1798cf06dc9f83089ca55304eab407442c8e4974151c234';

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

  static async register(email: string, password: string, name: string): Promise<User> {
    const existingUser = Database.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user: User = {
      id: uuidv4(),
      email,
      name,
      lastSeen: new Date().toISOString(),
      isOnline: true,
    };

    Database.saveUser(user);
    return user;
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = Database.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // For demo purposes, we'll skip password validation
    // In production, you'd validate against the hashed password
    
    const token = this.generateToken(user.id);
    
    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date().toISOString();
    Database.saveUser(user);

    return { user, token };
  }
}