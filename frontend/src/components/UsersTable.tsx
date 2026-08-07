import React, { useState } from 'react';
import type { User } from '../types';
import { Users, Check, X } from 'lucide-react';
import { api } from '../services/api';

interface UsersTableProps {
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onUpdateUser }) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleRoleChange = async (userId: number, newRole: 'user' | 'analyst' | 'admin') => {
    setUpdatingId(userId);
    try {
      const updated = await api.patch<User>(`/users/${userId}`, { role: newRole });
      onUpdateUser(updated);
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    setUpdatingId(userId);
    try {
      const updated = await api.patch<User>(`/users/${userId}`, { is_active: !currentActive });
      onUpdateUser(updated);
    } catch (err: any) {
      alert(`Failed to toggle user status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              User Management & Access Policy
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Role-Based Access Control (RBAC) & account state management
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Admin Role Authorized
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 uppercase">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-900/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white font-sans">{u.full_name}</div>
                  <div className="text-gray-400 text-[11px]">{u.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <select
                    value={u.role}
                    disabled={updatingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                    u.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {u.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    disabled={updatingId === u.id}
                    onClick={() => handleToggleStatus(u.id, u.is_active)}
                    className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors ${
                      u.is_active
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
