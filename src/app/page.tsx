'use client';

import { useState, useEffect } from 'react';
import { User, Chat, Message } from './types';
import LoginForm from './components/LoginForm';
import ChatSidebar from './components/ChatSidebar';
import ChatArea from './components/ChatArea';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchChats();
      fetchUsers();
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedChat && token) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat, token]);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
  try {
    setIsLoading(true);
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed');
  } finally {
    setIsLoading(false);
  }
};

const handleRegister = async ({ name, email, password }: { name: string; email: string; password: string }) => {
  try {
    setIsLoading(true);
    const response = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed');
  } finally {
    setIsLoading(false);
  }
};

  const fetchChats = async () => {
    try {
      const response = await apiCall('/api/chats');
      setChats(response);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiCall('/api/users');
      setUsers(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await apiCall(`/api/messages?chatId=${chatId}`);
      setMessages(response);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !token) return;

    try {
      const response = await apiCall('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          chatId: selectedChat._id,
          content,
        }),
      });

      setMessages(prev => [...prev, response]);
      fetchChats(); // Refresh chats to update last message
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewChat = async (userId: string) => {
  try {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const response = await apiCall('/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        participants: [userId], // Current user will be added automatically by backend
        type: 'private'
      }),
    });

    // Update chats list
    setChats(prev => {
      // Check if chat already exists in state
      const exists = prev.some(c => c._id === response._id);
      return exists ? prev : [...prev, response];
    });
    
    // Select the new chat
    setSelectedChat(response);
    setSidebarVisible(false);
    
    // Fetch initial messages
    fetchMessages(response._id);
  } catch (error) {
    console.error('Failed to create new chat:', error);
    alert(`Failed to create chat: ${error.message}`);
  }
};

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setChats([]);
    setUsers([]);
    setSelectedChat(null);
    setMessages([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setSidebarVisible(false);
  };

  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="chat-container">
      <ChatSidebar
        user={user}
        chats={chats}
        users={users}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        selectedChatId={selectedChat?._id}
        onLogout={handleLogout}
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
      <ChatArea
        currentUser={user}
        selectedChat={selectedChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onShowSidebar={() => setSidebarVisible(true)}
      />
    </div>
  );
}