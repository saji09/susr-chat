'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, User, Chat } from '../types';

interface ChatAreaProps {
  currentUser: User;
  selectedChat?: Chat | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onShowSidebar: () => void;
}

export default function ChatArea({
  currentUser,
  selectedChat,
  messages,
  onSendMessage,
  onShowSidebar
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const otherParticipant = (chat as any).participantDetails?.[0];
    return otherParticipant?.name || 'Unknown';
  };

  if (!selectedChat) {
    return (
      <div className="chat-area">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={onShowSidebar}>
            ☰
          </button>
          <h5 className="mb-0">Select a Chat</h5>
        </div>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center text-muted">
            <h4>Welcome to SUSR Chat</h4>
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="header">
        <div className="d-flex align-items-center">
          <button 
            className="mobile-menu-btn d-md-none me-3"
            onClick={onShowSidebar}
          >
            ☰
          </button>
          <div className="avatar me-3">
            {getInitials(getChatName(selectedChat))}
          </div>
          <div>
            <h6 className="mb-0">{getChatName(selectedChat)}</h6>
            <small className="text-light opacity-75">
              {(selectedChat as any).participantDetails?.[0]?.isOnline ? 'Online' : 'Offline'}
            </small>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${
              message.senderId === currentUser.id ? 'message-sent' : 'message-received'
            }`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="form-control"
        />
        <button type="submit" className="send-button">
          ➤
        </button>
      </form>
    </div>
  );
}