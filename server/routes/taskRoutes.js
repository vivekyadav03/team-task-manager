// routes/taskRoutes.js
// All task-related routes

const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// Dashboard stats route
router.get('/dashboard/stats', getDashboardStats);

// GET all tasks (with filters), POST create task (Admin only)
router
  .route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

// GET, PUT, DELETE single task
router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask) // Both admin and member (member: status only)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
