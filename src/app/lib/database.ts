import fs from 'fs';
import path from 'path';
import { User, Message, Chat } from '../types';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize JSON files if they don't exist
const initializeFile = (filename: string, defaultData: any) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initializeFile('users.json', []);
initializeFile('messages.json', []);
initializeFile('chats.json', []);

export class Database {
  private static readFile<T>(filename: string): T[] {
    const filePath = path.join(dataDir, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  private static writeFile<T>(filename: string, data: T[]): void {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  // Users
  static getUsers(): User[] {
    return this.readFile<User>('users.json');
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.writeFile('users.json', users);
  }

  static getUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  }

  static getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  // Messages
  static getMessages(): Message[] {
    return this.readFile<Message>('messages.json');
  }

  static saveMessage(message: Message): void {
    const messages = this.getMessages();
    messages.push(message);
    this.writeFile('messages.json', messages);
  }

  static getMessagesByChat(chatId: string): Message[] {
    const messages = this.getMessages();
    return messages.filter(m => m.chatId === chatId);
  }

  // Chats
  static getChats(): Chat[] {
    return this.readFile<Chat>('chats.json');
  }

  static saveChat(chat: Chat): void {
    const chats = this.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }
    this.writeFile('chats.json', chats);
  }

  static getChatsByUser(userId: string): Chat[] {
    const chats = this.getChats();
    return chats.filter(c => c.participants.includes(userId));
  }

  static getChatByParticipants(participants: string[]): Chat | undefined {
    const chats = this.getChats();
    return chats.find(c => 
      c.participants.length === participants.length &&
      participants.every(p => c.participants.includes(p))
    );
  }
}