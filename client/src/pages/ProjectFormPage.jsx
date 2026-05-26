// src/pages/ProjectFormPage.jsx
// Create or edit a project

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService, authService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { PROJECT_COLORS } from '../utils/helpers';
import { Save, ArrowLeft, FolderKanban, Users } from 'lucide-react';

const ProjectFormPage = () => {
  const { id } = useParams(); // If id exists, we're editing
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    members: [],
    color: '#6366f1',
    status: 'active',
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});

  // Fetch all users for member selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await authService.getAllUsers();
        setAllUsers(data.users || []);
      } catch (err) {
        toast.error('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  // If editing, fetch current project data
  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        try {
          const { data } = await projectService.getById(id);
          const p = data.project;
          setFormData({
            title: p.title,
            description: p.description || '',
            members: p.members.map((m) => m._id),
            color: p.color || '#6366f1',
            status: p.status || 'active',
          });
        } catch (err) {
          toast.error('Failed to load project');
          navigate('/projects');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isEditing]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await projectService.update(id, formData);
        toast.success('Project updated successfully!');
      } else {
        await projectService.create(formData);
        toast.success('Project created successfully!');
      }
      navigate('/projects');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Form card */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 
                          flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-sm text-slate-400">
              {isEditing ? 'Update project details' : 'Set up a new team project'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Project Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Website Redesign"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
              placeholder="Brief description of the project..."
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="label">Project Color</label>
            <div className="flex gap-3 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                    formData.color === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Status (only when editing) */}
          {isEditing && (
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {/* Team members */}
          <div>
            <label className="label flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </label>
            {allUsers.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => toggleMember(user._id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg border text-left
                      transition-all duration-200
                      ${formData.members.includes(user._id)
                        ? 'bg-primary-600/20 border-primary-500/40 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${formData.members.includes(user._id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                      }
                    `}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs opacity-60 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full
                      ${user.role === 'admin'
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-slate-700 text-slate-400'
                      }`}>
                      {user.role}
                    </span>
                    {formData.members.includes(user._id) && (
                      <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center 
                                       justify-center text-white text-xs flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No users found.</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {formData.members.length} member{formData.members.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormPage;
