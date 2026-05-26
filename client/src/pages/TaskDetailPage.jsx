// src/pages/TaskDetailPage.jsx
// View a single task with full details and activity log

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/common/StatusBadge';
import { formatDate, timeAgo, isTaskOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Edit, Calendar, User, FolderKanban,
  Clock, Activity, CheckCircle, ChevronDown,
} from 'lucide-react';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await taskService.getById(id);
        setTask(data.task);
      } catch (err) {
        toast.error('Failed to load task');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const { data } = await taskService.update(id, { status: newStatus });
      setTask(data.task);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!task) return null;

  const overdue = isTaskOverdue(task);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <Calendar className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <strong>This task is overdue</strong> — it was due on {formatDate(task.dueDate)}.
            Please update the status or extend the deadline.
          </p>
        </div>
      )}

      {/* Main task card */}
      <div className={`card p-6 animate-slide-up ${overdue ? 'border-red-500/30' : ''}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className={`text-2xl font-bold mb-2 ${overdue ? 'text-red-300' : 'text-white'}`}>
              {task.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {overdue && <OverdueBadge />}
            </div>
          </div>
          {isAdmin && (
            <Link
              to={`/tasks/${id}/edit`}
              className="btn-secondary flex-shrink-0"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        {task.description && (
          <p className="text-slate-300 text-sm leading-relaxed mb-5 pb-5 border-b border-slate-700/50">
            {task.description}
          </p>
        )}

        {/* Task meta info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">Project</p>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: task.project?.color || '#6366f1' }}
              />
              <p className="text-sm font-medium text-white truncate">
                {task.project?.title || 'Unknown'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Assigned To</p>
            <div className="flex items-center gap-1.5">
              {task.assignedTo ? (
                <>
                  <div className="w-5 h-5 rounded-md bg-primary-600 flex items-center justify-center 
                                  text-xs font-bold text-white flex-shrink-0">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {task.assignedTo.name}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Unassigned</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Due Date</p>
            <p className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-white'}`}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Created By</p>
            <p className="text-sm font-medium text-white truncate">
              {task.createdBy?.name || '—'}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-700/50">
          <span>Created {timeAgo(task.createdAt)}</span>
          <span>·</span>
          <span>Updated {timeAgo(task.updatedAt)}</span>
        </div>
      </div>

      {/* Quick status update (for both admin and members) */}
      <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary-400" />
          Update Status
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['Todo', 'In Progress', 'Completed'].map((status) => {
            const colors = {
              'Todo': 'border-slate-600 text-slate-400 hover:border-slate-500',
              'In Progress': 'border-blue-500/40 text-blue-400 hover:border-blue-500',
              'Completed': 'border-emerald-500/40 text-emerald-400 hover:border-emerald-500',
            };
            const activeColors = {
              'Todo': 'bg-slate-700/60 border-slate-500 text-slate-200',
              'In Progress': 'bg-blue-500/20 border-blue-500 text-blue-300',
              'Completed': 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
            };
            const isActive = task.status === status;

            return (
              <button
                key={status}
                onClick={() => !isActive && handleStatusChange(status)}
                disabled={statusLoading || isActive}
                className={`
                  py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-200
                  disabled:cursor-not-allowed
                  ${isActive ? activeColors[status] : colors[status] + ' bg-transparent'}
                `}
              >
                {statusLoading && isActive ? (
                  <LoadingSpinner size="sm" className="mx-auto" />
                ) : (
                  status
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      {task.activityLog && task.activityLog.length > 0 && (
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-400" />
            Activity Log
          </h3>
          <div className="space-y-3">
            {[...task.activityLog].reverse().map((entry, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  {index < task.activityLog.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-700 mt-1 mb-0" style={{ minHeight: '16px' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">
                      {entry.user?.name || 'Someone'}
                    </span>
                    {' — '}
                    {entry.action}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timeAgo(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;
