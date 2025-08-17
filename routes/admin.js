const express = require('express');
const { User, Team, Project, Task, ActivityLog } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', auth, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('name email role');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all teams (admin only)
router.get('/teams', auth, authorize(['admin']), async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name email')
      .populate('createdBy', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete team
router.delete('/teams/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects (admin only)
router.get('/projects', auth, authorize(['admin']), async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('team', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/projects/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks (admin only)
router.get('/tasks', auth, authorize(['admin']), async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name')
      .populate('assignedUsers', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/tasks/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system analytics
router.get('/analytics', auth, authorize(['admin']), async (req, res) => {
  try {
    const [userCount, teamCount, projectCount, taskCount] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments()
    ]);

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers: userCount,
      totalTeams: teamCount,
      totalProjects: projectCount,
      totalTasks: taskCount,
      tasksByStatus,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;