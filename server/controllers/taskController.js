// controllers/taskController.js
// Handles all task-related operations

const Task = require('../models/Task');
const Project = require('../models/Project');
const { AppError } = require('../middleware/errorHandler');

// Keywords that suggest high priority (AI-like smart detection)
const HIGH_PRIORITY_KEYWORDS = ['urgent', 'critical', 'production', 'emergency', 'asap', 'blocker'];

/**
 * Helper: Check if task title/description suggests high priority
 */
const detectPriority = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  return HIGH_PRIORITY_KEYWORDS.some((keyword) => text.includes(keyword));
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (Admin only)
 * @access  Private/Admin
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return next(new AppError('Project not found.', 404));
    }

    // Smart priority detection: override if keywords found
    let finalPriority = priority || 'Medium';
    const suggestedHigh = detectPriority(title, description || '');
    if (suggestedHigh && priority !== 'Low') {
      finalPriority = 'High';
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: finalPriority,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      project,
      createdBy: req.user._id,
      // Initial activity log entry
      activityLog: [
        {
          user: req.user._id,
          action: `Task created with status "${status || 'Todo'}" and priority "${finalPriority}"`,
        },
      ],
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'title');
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task,
      // Alert frontend if priority was auto-detected
      prioritySuggested: suggestedHigh && priority !== 'High',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with optional filters
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, assignedTo, search } = req.query;

    // Build filter object
    let filter = {};

    // Members can only see their assigned tasks
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    // Apply optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;

    // Search by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title color')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Add isOverdue flag to each task
    const tasksWithOverdue = tasks.map((task) => {
      const taskObj = task.toObject();
      taskObj.isOverdue =
        task.dueDate &&
        task.status !== 'Completed' &&
        new Date() > new Date(task.dueDate);
      return taskObj;
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks: tasksWithOverdue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'title color')
      .populate('createdBy', 'name email')
      .populate('activityLog.user', 'name email');

    if (!task) {
      return next(new AppError('Task not found.', 404));
    }

    // Members can only see their own tasks
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Access denied. This task is not assigned to you.', 403));
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin: full update, Member: status only)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found.', 404));
    }

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return next(new AppError('Access denied. This task is not assigned to you.', 403));
      }
      // Members can only change status
      const { status } = req.body;
      if (!status) {
        return next(new AppError('Members can only update task status.', 400));
      }

      task.activityLog.push({
        user: req.user._id,
        action: `Status changed from "${task.status}" to "${status}"`,
      });
      task.status = status;
      await task.save();

      await task.populate('assignedTo', 'name email');
      await task.populate('project', 'title color');

      return res.json({
        success: true,
        message: 'Task status updated!',
        task,
      });
    }

    // Admin can update all fields
    const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

    // Track changes in activity log
    const changes = [];
    if (status && status !== task.status) changes.push(`Status: "${task.status}" → "${status}"`);
    if (priority && priority !== task.priority) changes.push(`Priority: "${task.priority}" → "${priority}"`);
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) changes.push(`Assignee changed`);

    if (changes.length > 0) {
      task.activityLog.push({
        user: req.user._id,
        action: changes.join(', '),
      });
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (project) task.project = project;

    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'title color');
    await task.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully!',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (Admin only)
 * @access  Private/Admin
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found.', 404));
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    let taskFilter = {};
    let projectFilter = {};

    // Members see only their stats
    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = req.user._id;
    }

    const now = new Date();

    // Aggregate task statistics
    const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: 'Completed' }),
        Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
        Task.countDocuments({ ...taskFilter, status: 'Todo' }),
        Task.countDocuments({
          ...taskFilter,
          dueDate: { $lt: now },
          status: { $ne: 'Completed' },
        }),
      ]);

    // Get project count
    const totalProjects =
      req.user.role === 'admin'
        ? await require('../models/Project').countDocuments({})
        : await require('../models/Project').countDocuments({ members: req.user._id });

    // Get recent tasks (last 5)
    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name')
      .populate('project', 'title color')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Get tasks by priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentTasks,
      priorityBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
};
