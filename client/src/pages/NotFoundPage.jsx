// src/pages/NotFoundPage.jsx
// 404 error page

import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Zap } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative animate-slide-up">
        {/* Big 404 */}
        <div className="relative mb-6">
          <h1 className="text-[140px] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(180deg, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 
                            flex items-center justify-center">
              <Zap className="w-10 h-10 text-primary-400" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
