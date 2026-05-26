// src/pages/TaskFormPage.jsx
// Create or edit a task — includes smart priority detection

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { taskService, projectService, authService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, CheckSquare, Zap, AlertTriangle, ChevronDown } from 'lucide-react';

// Keywords that trigger smart priority suggestion
const HIGH_PRIORITY_KEYWORDS = ['urgent', 'critical', 'production', 'emergency', 'asap', 'blocker'];

const TaskFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project'); // Pre-fill project from URL

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
    project: preselectedProject || '',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});
  const [priorityAlert, setPriorityAlert] = useState(false); // Smart detection alert

  const titleRef = useRef('');
  const descRef = useRef('');

  // Fetch projects and users for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          projectService.getAll(),
          authService.getAllUsers(),
        ]);
        setProjects(projectsRes.data.projects || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  // If editing, fetch existing task data
  useEffect(() => {
    if (isEditing) {
      const fetchTask = async () => {
        try {
          const { data } = await taskService.getById(id);
          const t = data.task;
          setFormData({
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
            assignedTo: t.assignedTo?._id || '',
            project: t.project?._id || '',
          });
        } catch (err) {
          toast.error('Failed to load task');
          navigate('/tasks');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchTask();
    }
  }, [id, isEditing]);

  // Smart priority detection — runs on title/description change
  const checkSmartPriority = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    const hasKeyword = HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw));
    setPriorityAlert(hasKeyword && formData.priority !== 'High');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    // Run smart detection when title or description changes
    if (name === 'title') {
      checkSmartPriority(value, descRef.current);
      titleRef.current = value;
    }
    if (name === 'description') {
      checkSmartPriority(titleRef.current, value);
      descRef.current = value;
    }
    // Hide alert if user manually sets High priority
    if (name === 'priority' && value === 'High') {
      setPriorityAlert(false);
    }
  };

  const applyHighPriority = () => {
    setFormData((prev) => ({ ...prev, priority: 'High' }));
    setPriorityAlert(false);
    toast.success('Priority set to High ✓');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.project) newErrors.project = 'Please select a project';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clean up empty optional fields
    const payload = {
      ...formData,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate || null,
      description: formData.description || '',
    };

    setLoading(true);
    try {
      if (isEditing) {
        await taskService.update(id, payload);
        toast.success('Task updated successfully!');
      } else {
        const { data } = await taskService.create(payload);
        toast.success('Task created!');
        // Notify if priority was auto-detected
        if (data.prioritySuggested) {
          toast('⚡ Smart detection set priority to High', { icon: '🧠' });
        }
      }
      navigate('/tasks');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save task');
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
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      {/* Smart priority alert */}
      {priorityAlert && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl 
                         bg-amber-500/10 border border-amber-500/30 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                🧠 Smart Priority Detection
              </p>
              <p className="text-xs text-amber-400/80">
                Keywords like "urgent", "critical", or "production" detected — suggest High priority.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={applyHighPriority}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg 
                       bg-amber-500/20 border border-amber-500/40 text-amber-300 
                       hover:bg-amber-500/30 transition-colors flex-shrink-0"
          >
            Set High
          </button>
        </div>
      )}

      {/* Form card */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 
                          flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-slate-400">
              {isEditing ? 'Update task details' : 'Add a new task to a project'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Fix critical production bug"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            <p className="text-xs text-slate-500 mt-1">
              Tip: Using words like "urgent" or "critical" triggers smart priority detection 🧠
            </p>
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
              placeholder="Describe what needs to be done..."
            />
          </div>

          {/* Project */}
          <div>
            <label className="label">Project *</label>
            <div className="relative">
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className={`input appearance-none pr-8 ${errors.project ? 'border-red-500' : ''}`}
              >
                <option value="">— Select a project —</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {errors.project && <p className="text-red-400 text-xs mt-1">{errors.project}</p>}
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input appearance-none pr-8"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label">Priority</label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input appearance-none pr-8"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assign To & Due Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assign To</label>
              <div className="relative">
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="input appearance-none pr-8"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="input [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
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
                  {isEditing ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormPage;
