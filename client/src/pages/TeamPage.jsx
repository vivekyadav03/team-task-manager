// src/pages/TeamPage.jsx
// View all team members — Admin only

import { useState, useEffect } from 'react';
import { authService, taskService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Users, Shield, User, CheckSquare, Calendar, Mail } from 'lucide-react';

// Member card component
const MemberCard = ({ member, taskStats }) => {
  const stats = taskStats[member._id] || { total: 0, completed: 0, inProgress: 0 };
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="card-hover p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 
                        flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white truncate">{member.name}</h3>
            {member.role === 'admin' && (
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-slate-500" />
            <p className="text-xs text-slate-400 truncate">{member.email}</p>
          </div>
        </div>
      </div>

      {/* Task stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-900">
          <p className="text-lg font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-900">
          <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-900">
          <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-xs text-slate-500">Done</p>
        </div>
      </div>

      {/* Completion progress */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Completion rate</span>
            <span className="font-medium text-slate-300">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Joined date */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-700/50">
        <Calendar className="w-3 h-3" />
        Joined {formatDate(member.createdAt)}
      </div>
    </div>
  );
};

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          authService.getAllUsers(),
          taskService.getAll(),
        ]);
        setUsers(usersRes.data.users || []);
        setAllTasks(tasksRes.data.tasks || []);
      } catch (err) {
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute task stats per user
  const taskStats = allTasks.reduce((acc, task) => {
    if (task.assignedTo) {
      const userId = task.assignedTo._id || task.assignedTo;
      if (!acc[userId]) acc[userId] = { total: 0, completed: 0, inProgress: 0 };
      acc[userId].total++;
      if (task.status === 'Completed') acc[userId].completed++;
      if (task.status === 'In Progress') acc[userId].inProgress++;
    }
    return acc;
  }, {});

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = filteredUsers.filter((u) => u.role === 'admin');
  const members = filteredUsers.filter((u) => u.role === 'member');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Team Members</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {users.length} member{users.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: users.length, color: '#6366f1' },
          { label: 'Admins', value: admins.length, color: '#8b5cf6' },
          { label: 'Members', value: members.length, color: '#10b981' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 text-sm"
        />
      </div>

      {/* Admins section */}
      {admins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-slate-300">
              Admins ({admins.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {admins.map((user) => (
              <MemberCard key={user._id} member={user} taskStats={taskStats} />
            ))}
          </div>
        </div>
      )}

      {/* Members section */}
      {members.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">
              Members ({members.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {members.map((user) => (
              <MemberCard key={user._id} member={user} taskStats={taskStats} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No members found"
          description="No users match your search."
        />
      )}
    </div>
  );
};

export default TeamPage;
