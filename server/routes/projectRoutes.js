// routes/projectRoutes.js
// All project-related routes

const express = require('express');
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

// All project routes require authentication
router.use(protect);

// GET all projects (Admin: all, Member: their projects)
// POST create project (Admin only)
router
  .route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

// GET, PUT, DELETE single project
router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

// Add members to project (Admin only)
router.post('/:id/members', authorize('admin'), addMembers);

module.exports = router;
