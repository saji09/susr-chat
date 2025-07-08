export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  type: 'private' | 'group';
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}