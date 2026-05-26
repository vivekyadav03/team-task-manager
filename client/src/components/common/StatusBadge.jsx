// src/components/common/StatusBadge.jsx
// Reusable status and priority badge components

import { Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const config = {
    'Todo': {
      class: 'badge-todo',
      icon: Clock,
    },
    'In Progress': {
      class: 'badge-inprogress',
      icon: Loader,
    },
    'Completed': {
      class: 'badge-completed',
      icon: CheckCircle,
    },
  };

  const cfg = config[status] || config['Todo'];
  const Icon = cfg.icon;

  return (
    <span className={cfg.class}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const config = {
    'Low': { class: 'badge-low', dot: 'bg-slate-400' },
    'Medium': { class: 'badge-medium', dot: 'bg-amber-400' },
    'High': { class: 'badge-high', dot: 'bg-red-400' },
  };

  const cfg = config[priority] || config['Medium'];

  return (
    <span className={cfg.class}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {priority}
    </span>
  );
};

export const OverdueBadge = () => (
  <span className="badge bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse-soft">
    <AlertCircle className="w-3 h-3" />
    Overdue
  </span>
);
