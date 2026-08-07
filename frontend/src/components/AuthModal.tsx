import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, fullName, password, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail('admin@example.com');
    setPassword('AdminPass123!');
    setSubmitting(true);
    try {
      await login('admin@example.com', 'AdminPass123!');
      onClose();
    } catch (err) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-gray-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide font-mono">
            {isRegister ? 'Provision Account' : 'Authenticate Credentials'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            JWT Token Management Layer & Role Authorization
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-rose-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Requested Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="user">User</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all font-mono uppercase tracking-wider"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Authenticate'}
          </button>
        </form>

        {!isRegister && (
          <div className="mt-4 pt-4 border-t border-gray-800/80">
            <button
              onClick={handleDemoAdminLogin}
              disabled={submitting}
              className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>One-Click Auto Sign In (Admin Seed)</span>
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearError();
            }}
            className="text-xs text-gray-400 hover:text-white font-mono underline"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
