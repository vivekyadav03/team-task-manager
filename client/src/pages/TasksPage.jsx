// src/pages/TasksPage.jsx
// Lists all tasks with search and filter capabilities

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/common/StatusBadge';
import { formatDate, timeAgo, isTaskOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  CheckSquare, Plus, Trash2, Edit, Search, Filter,
  X, Eye, Calendar, User, SortDesc, ChevronDown,
} from 'lucide-react';

// Filter bar component
const FilterBar = ({ filters, onChange, onClear }) => {
  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="input text-sm pr-8 min-w-[140px] appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={filters.priority}
            onChange={(e) => onChange('priority', e.target.value)}
            className="input text-sm pr-8 min-w-[140px] appearance-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="btn-secondary text-sm flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

// Task row component
const TaskRow = ({ task, isAdmin, onDelete, onStatusChange }) => {
  const overdue = isTaskOverdue(task);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    await onStatusChange(task._id, newStatus);
    setStatusLoading(false);
  };

  return (
    <tr className={`table-row ${overdue ? 'bg-red-500/3' : ''}`}>
      {/* Title */}
      <td className="table-cell">
        <div className="flex items-start gap-2">
          {overdue && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
          )}
          <div className="min-w-0">
            <Link
              to={`/tasks/${task._id}`}
              className={`font-medium text-sm hover:text-primary-400 transition-colors line-clamp-1
                ${overdue ? 'text-red-300' : 'text-white'}`}
            >
              {task.title}
            </Link>
            {task.project && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                📁 {task.project.title}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="table-cell">
        {isAdmin ? (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusLoading}
            className="bg-transparent text-xs border border-slate-700 rounded-lg px-2 py-1 
                       text-slate-300 cursor-pointer hover:border-slate-500 transition-colors
                       focus:outline-none focus:border-primary-500 disabled:opacity-50"
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )}
      </td>

      {/* Priority */}
      <td className="table-cell hidden sm:table-cell">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Assigned To */}
      <td className="table-cell hidden md:table-cell">
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-violet-500 
                            flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 truncate max-w-[100px]">
              {task.assignedTo.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-500">Unassigned</span>
        )}
      </td>

      {/* Due Date */}
      <td className="table-cell hidden lg:table-cell">
        {task.dueDate ? (
          <div className={`flex items-center gap-1 text-sm ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(task.dueDate)}
            {overdue && <OverdueBadge />}
          </div>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="table-cell">
        <div className="flex items-center gap-1">
          <Link
            to={`/tasks/${task._id}`}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <Link
                to={`/tasks/${task._id}/edit`}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });

  const fetchTasks = useCallback(async () => {
    try {
      // Build query params from filters (only non-empty values)
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const { data } = await taskService.getAll(params);
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce search — refetch after 400ms of no typing
  useEffect(() => {
    const timer = setTimeout(fetchTasks, 400);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '' });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await taskService.delete(deleteTarget._id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      toast.success('Task deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overdueCount = tasks.filter(isTaskOverdue).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tasks</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-400 font-medium">
                · {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        )}
      </div>

      {/* Overdue warning banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-sm text-red-300">
            <strong>{overdueCount} task{overdueCount > 1 ? 's are' : ' is'} overdue.</strong>
            {' '}Please review and update them.
          </p>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      {/* Tasks table */}
      {tasks.length > 0 ? (
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50 bg-slate-900/50">
                <tr>
                  <th className="table-header text-left">Task</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left hidden sm:table-cell">Priority</th>
                  <th className="table-header text-left hidden md:table-cell">Assigned To</th>
                  <th className="table-header text-left hidden lg:table-cell">Due Date</th>
                  <th className="table-header text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    onDelete={setDeleteTarget}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters to find tasks.'
              : isAdmin
              ? 'Create your first task to get started.'
              : 'No tasks are assigned to you yet.'
          }
          action={
            isAdmin && !filters.search && !filters.status && !filters.priority ? (
              <Link to="/tasks/new" className="btn-primary">
                <Plus className="w-4 h-4" />
                Create First Task
              </Link>
            ) : null
          }
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TasksPage;
