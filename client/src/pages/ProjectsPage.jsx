// src/pages/ProjectsPage.jsx
// Lists all projects

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { calcProgress, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FolderKanban, Plus, Trash2, Edit, Users, CheckSquare,
  ArrowRight, MoreVertical, Eye,
} from 'lucide-react';

// Status badge for project
const ProjectStatusBadge = ({ status }) => {
  const config = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'on-hold': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`badge border ${config[status] || config.active}`}>
      {status === 'on-hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Single project card
const ProjectCard = ({ project, isAdmin, onDelete }) => {
  const progress = calcProgress(project.completedCount, project.taskCount);

  return (
    <div className="card-hover group p-5 animate-fade-in">
      {/* Color accent bar */}
      <div
        className="h-1 w-12 rounded-full mb-4"
        style={{ background: project.color || '#6366f1' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base group-hover:text-primary-300 
                         transition-colors truncate">
            {project.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Created {timeAgo(project.createdAt)}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{project.completedCount || 0}/{project.taskCount || 0} tasks</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: project.color || '#6366f1',
            }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map((member, i) => (
            <div
              key={member._id || i}
              className="w-7 h-7 rounded-full border-2 border-slate-800 
                         bg-gradient-to-br from-primary-500 to-violet-500 
                         flex items-center justify-center text-xs font-bold text-white"
              title={member.name}
            >
              {member.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-slate-800 
                            bg-slate-700 flex items-center justify-center text-xs text-slate-300">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <Link
          to={`/projects/${project._id}`}
          className="flex-1 btn-secondary text-xs py-1.5 justify-center"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Link>
        {isAdmin && (
          <>
            <Link
              to={`/projects/${project._id}/edit`}
              className="btn-secondary text-xs py-1.5 px-2.5"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => onDelete(project)}
              className="btn-danger text-xs py-1.5 px-2.5"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProjects(data.projects || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await projectService.delete(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Project deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete project');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Link to="/projects/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Projects grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isAdmin={isAdmin}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            isAdmin
              ? 'Create your first project to get started.'
              : 'You have not been added to any projects yet.'
          }
          action={
            isAdmin && (
              <Link to="/projects/new" className="btn-primary">
                <Plus className="w-4 h-4" />
                Create First Project
              </Link>
            )
          }
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also delete all associated tasks. This action cannot be undone.`}
      />
    </div>
  );
};

export default ProjectsPage;
