// controllers/projectController.js
// Handles all project-related operations

const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin only)
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, members, color } = req.body;

    // Validate that member IDs exist in the database
    if (members && members.length > 0) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return next(new AppError('One or more member IDs are invalid.', 400));
      }
    }

    const project = await Project.create({
      title,
      description,
      members: members || [],
      createdBy: req.user._id,
      color: color || '#6366f1',
    });

    // Populate member details for the response
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects (Admin sees all, Members see their projects)
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admin can see all projects
      query = Project.find({});
    } else {
      // Members only see projects they're part of
      query = Project.find({ members: req.user._id });
    }

    const projects = await query
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 }); // Newest first

    // Get task count for each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedCount = await Task.countDocuments({
          project: project._id,
          status: 'Completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json({
      success: true,
      count: projects.length,
      projects: projectsWithTaskCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role createdAt')
      .populate('createdBy', 'name email');

    if (!project) {
      return next(new AppError('Project not found.', 404));
    }

    // Members can only access projects they're part of
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return next(new AppError('Access denied. You are not a member of this project.', 403));
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      project,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project (Admin only)
 * @access  Private/Admin
 */
const updateProject = async (req, res, next) => {
  try {
    const { title, description, members, status, color } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('Project not found.', 404));
    }

    // Validate member IDs if provided
    if (members && members.length > 0) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return next(new AppError('One or more member IDs are invalid.', 400));
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, members, status, color },
      { new: true, runValidators: true }
    )
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Project updated successfully!',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and all its tasks (Admin only)
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('Project not found.', 404));
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and all associated tasks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add members to a project (Admin only)
 * @access  Private/Admin
 */
const addMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError('Project not found.', 404));
    }

    // Add members that aren't already in the project
    const newMembers = memberIds.filter(
      (id) => !project.members.includes(id)
    );

    project.members.push(...newMembers);
    await project.save();

    await project.populate('members', 'name email role');

    res.json({
      success: true,
      message: 'Members added successfully!',
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
};
