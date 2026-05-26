// src/utils/helpers.js
// Utility functions used across the app

import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Format a date to a human-readable relative string
 * e.g., "2 days ago", "in 3 hours"
 */
export const timeAgo = (date) => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date to a standard display format
 * e.g., "Jan 15, 2024"
 */
export const formatDate = (date) => {
  if (!date) return 'No date';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a due date with smart labels (Today, Tomorrow, Overdue)
 */
export const formatDueDate = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isToday(d)) return { label: 'Due Today', overdue: false, urgent: true };
    if (isTomorrow(d)) return { label: 'Due Tomorrow', overdue: false, urgent: true };
    if (isPast(d)) return { label: `Overdue · ${formatDate(date)}`, overdue: true, urgent: false };
    return { label: formatDate(date), overdue: false, urgent: false };
  } catch {
    return { label: 'Invalid date', overdue: false, urgent: false };
  }
};

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task) => {
  if (!task.dueDate || task.status === 'Completed') return false;
  return isPast(new Date(task.dueDate));
};

/**
 * Get initials from a name (e.g., "John Doe" → "JD")
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get color for project (default palette if not set)
 */
export const getProjectColor = (color) => {
  return color || '#6366f1';
};

/**
 * Calculate progress percentage
 */
export const calcProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get error message from axios error
 */
export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

// Color palette for projects
export const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#06b6d4', // Cyan
];
