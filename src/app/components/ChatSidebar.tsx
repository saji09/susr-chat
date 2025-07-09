'use client';

import { useState } from 'react';
import { User, Chat } from '../types';

interface ChatSidebarProps {
  user: User;
  chats: Chat[];
  users: User[];
  onChatSelect: (chat: Chat) => void;
  onNewChat: (userEmail: string) => void;
  selectedChatId?: string;
  onLogout: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  user,
  chats,
  users,
  onChatSelect,
  onNewChat,
  selectedChatId,
  onLogout,
  isVisible,
  onClose
}: ChatSidebarProps) {
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const otherParticipant = (chat as any).participantDetails?.[0];
    return otherParticipant?.name || 'Unknown';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`sidebar ${isVisible ? 'active' : ''}`}>
      <div className="header">
        <div className="d-flex align-items-center">
          <div className="avatar me-3">
            {getInitials(user.name)}
          </div>
          <h5 className="mb-0">{user.name}</h5>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-outline-light"
            onClick={() => setShowNewChatModal(true)}
          >
            New Chat
          </button>
          <button 
            className="btn btn-sm btn-outline-light"
            onClick={onLogout}
          >
            Logout
          </button>
          <button 
            className="btn btn-sm btn-outline-light d-md-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="chat-list">
        {chats.map(chat => (
          <div
            key={chat._id}
            className={`chat-item ${selectedChatId === chat._id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="avatar">
              {getInitials(getChatName(chat))}
            </div>
            <div className="chat-info">
              <div className="chat-name">{getChatName(chat)}</div>
              <div className="last-message">
                {chat.lastMessage?.content || 'No messages yet'}
              </div>
            </div>
            {chat.lastMessage && (
              <div className="text-muted small">
                {formatTime(chat.lastMessage.timestamp)}
              </div>
            )}
          </div>
        ))}
      </div>

      {showNewChatModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Start New Chat</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowNewChatModal(false)}
                />
              </div>
              <div className="modal-body">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="d-flex align-items-center p-2 border-bottom cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onNewChat(u.email);
                      setShowNewChatModal(false);
                    }}
                  >
                    <div className="avatar me-3">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div className="fw-bold">{u.name}</div>
                      <div className="text-muted small">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}