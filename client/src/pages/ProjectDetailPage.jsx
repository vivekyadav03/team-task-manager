// src/pages/ProjectDetailPage.jsx
// View a single project with its tasks

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/common/StatusBadge';
import { formatDate, timeAgo, isTaskOverdue, calcProgress } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Edit, Users, CheckSquare, Plus,
  Calendar, User, AlertCircle, FolderKanban,
} from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await projectService.getById(id);
        setProject(data.project);
        setTasks(data.tasks || []);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) return null;

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const progress = calcProgress(completedTasks, tasks.length);

  // Group tasks by status
  const tasksByStatus = {
    'Todo': tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    'Completed': tasks.filter((t) => t.status === 'Completed'),
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Project header */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${project.color}20`, border: `2px solid ${project.color}50` }}
            >
              <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{project.title}</h2>
              {project.description && (
                <p className="text-slate-400 mt-1 max-w-2xl">{project.description}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Created by {project.createdBy?.name} · {timeAgo(project.createdAt)}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Link
              to={`/projects/${id}/edit`}
              className="btn-secondary flex-shrink-0"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        {/* Progress */}
        <div className="mt-5 pt-5 border-t border-slate-700/50">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="font-semibold text-white">
              {completedTasks}/{tasks.length} tasks · {progress}%
            </span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: project.color }}
            />
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-400" />
            Team Members ({project.members?.length || 0})
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700 
                         rounded-lg px-3 py-2"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-violet-500 
                              flex items-center justify-center text-xs font-bold text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-slate-500 capitalize">{member.role}</p>
              </div>
            </div>
          ))}
          {project.members?.length === 0 && (
            <p className="text-sm text-slate-500">No members added yet.</p>
          )}
        </div>
      </div>

      {/* Tasks by status */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Tasks ({tasks.length})</h3>
          {isAdmin && (
            <Link
              to={`/tasks/new?project=${id}`}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Link>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No tasks in this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={status} />
                  <span className="text-xs text-slate-500">({statusTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {statusTasks.map((task) => {
                    const overdue = isTaskOverdue(task);
                    return (
                      <div
                        key={task._id}
                        className={`card p-4 ${overdue ? 'border-red-500/40 overdue-pulse' : ''}`}
                      >
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-sm font-medium text-white hover:text-primary-400 
                                     transition-colors line-clamp-2"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <PriorityBadge priority={task.priority} />
                          {overdue && <OverdueBadge />}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignedTo?.name || 'Unassigned'}
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
