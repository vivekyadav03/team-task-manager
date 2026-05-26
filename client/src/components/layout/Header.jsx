// src/components/layout/Header.jsx
// Top navigation bar

import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

// Map routes to page titles
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'New Project',
  '/tasks': 'Tasks',
  '/tasks/new': 'New Task',
  '/team': 'Team Members',
  '/profile': 'Profile',
};

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Get current page title (handle dynamic routes like /projects/:id)
  const getTitle = () => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (path.startsWith('/projects/') && path.includes('/edit')) return 'Edit Project';
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path.startsWith('/tasks/')) return 'Task Details';
    return 'TaskFlow';
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm
                       flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{getTitle()}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* User avatar */}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 
                          flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
