'use client';

import { useState } from 'react';
import { LoginData, RegisterData } from '../types';

interface LoginFormProps {
  onLogin: (data: LoginData) => void;
  onRegister: (data: RegisterData) => void;
  isLoading: boolean;
}

export default function LoginForm({ onLogin, onRegister, isLoading }: LoginFormProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      onRegister(formData);
    } else {
      onLogin({ email: formData.email, password: formData.password });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isRegisterMode ? 'Create Account' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isRegisterMode ? 'Register' : 'Login')}
          </button>
        </form>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}