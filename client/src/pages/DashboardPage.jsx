// src/pages/DashboardPage.jsx
// Main dashboard with stats, charts, and recent activity

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/common/StatusBadge';
import { formatDate, timeAgo, isTaskOverdue } from '../utils/helpers';
import {
  FolderKanban, CheckSquare, Clock, AlertCircle,
  TrendingUp, ArrowRight, BarChart3, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// Stat card component
const StatCard = ({ title, value, icon: Icon, color, subtitle, delay = 0 }) => (
  <div
    className="card p-5 animate-slide-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
           style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-300">{title}</div>
    {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
  </div>
);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-slate-300">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.value} {p.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await taskService.getDashboardStats();
        setStats(data.stats);
        setRecentTasks(data.recentTasks || []);

        // Format priority data for pie chart
        const pData = (data.priorityBreakdown || []).map((p) => ({
          name: p._id,
          value: p.count,
          color: p._id === 'High' ? '#ef4444' : p._id === 'Medium' ? '#f59e0b' : '#6b7280',
        }));
        setPriorityData(pData);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Data for status bar chart
  const statusData = stats
    ? [
        { name: 'Todo', tasks: stats.todoTasks, color: '#6b7280' },
        { name: 'In Progress', tasks: stats.inProgressTasks, color: '#3b82f6' },
        { name: 'Completed', tasks: stats.completedTasks, color: '#10b981' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-slate-400 mt-1">
          Here's what's happening with your {isAdmin ? 'team' : 'tasks'} today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Projects"
          value={stats?.totalProjects || 0}
          icon={FolderKanban}
          color="#6366f1"
          delay={0.05}
        />
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={CheckSquare}
          color="#8b5cf6"
          delay={0.1}
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          icon={Target}
          color="#10b981"
          subtitle={`${stats?.completionRate || 0}% rate`}
          delay={0.15}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks || 0}
          icon={BarChart3}
          color="#3b82f6"
          delay={0.2}
        />
        <StatCard
          title="Pending"
          value={stats?.todoTasks || 0}
          icon={Clock}
          color="#f59e0b"
          delay={0.25}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          icon={AlertCircle}
          color="#ef4444"
          subtitle={stats?.overdueTasks > 0 ? 'Needs attention' : 'All on time!'}
          delay={0.3}
        />
      </div>

      {/* Completion progress bar */}
      <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">Overall Progress</h3>
            <p className="text-sm text-slate-400">Task completion rate</p>
          </div>
          <span className="text-2xl font-bold text-primary-400">
            {stats?.completionRate || 0}%
          </span>
        </div>
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-violet-500 rounded-full transition-all duration-1000"
            style={{ width: `${stats?.completionRate || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{stats?.completedTasks || 0} completed</span>
          <span>{(stats?.totalTasks || 0) - (stats?.completedTasks || 0)} remaining</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart - Status breakdown */}
        <div className="lg:col-span-3 card p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            Tasks by Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - Priority breakdown */}
        <div className="lg:col-span-2 card p-5 animate-slide-up" style={{ animationDelay: '0.45s' }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            By Priority
          </h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No task data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h3 className="font-semibold text-white">Recent Tasks</h3>
          <Link
            to="/tasks"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTasks.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {recentTasks.map((task) => {
              const overdue = isTaskOverdue(task);
              return (
                <div
                  key={task._id}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 
                               transition-colors ${overdue ? 'border-l-2 border-red-500' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${overdue ? 'text-red-400' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.project?.title} · {timeAgo(task.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {overdue && <OverdueBadge />}
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No tasks yet. {isAdmin && 'Create your first task!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
