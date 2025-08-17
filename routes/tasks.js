const express = require('express');
const { Task, User, Project, ActivityLog } = require('../models');
const { auth } = require('../middleware/auth');
const { sendTaskAssignmentEmail, sendStatusUpdateEmail } = require('../utils/email');

const router = express.Router();

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, projectId, assignedUserIds, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      project: projectId,
      priority,
      dueDate,
      assignedUsers: assignedUserIds || []
    });
    await task.save();

    // Send email notifications
    if (assignedUserIds && assignedUserIds.length > 0) {
      const users = await User.find({ _id: { $in: assignedUserIds } });
      const project = await Project.findById(projectId);
      users.forEach(user => {
        sendTaskAssignmentEmail(user.email, title, project.name);
      });
    }

    // Log activity
    const activity = new ActivityLog({
      action: 'Task Created',
      entityType: 'task',
      entityId: task._id,
      user: req.user.id,
      details: { taskTitle: title, projectId }
    });
    await activity.save();

    // Emit real-time update
    req.io.to(`project-${projectId}`).emit('taskCreated', {
      task: await Task.findById(task._id).populate('assignedUsers', 'name')
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id)
      .populate('assignedUsers')
      .populate('project');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Log activity
    const activity = new ActivityLog({
      action: 'Task Status Updated',
      entityType: 'task',
      entityId: task._id,
      user: req.user.id,
      details: { oldStatus, newStatus: status, taskTitle: task.title }
    });
    await activity.save();

    // Send email notifications to assigned users
    task.assignedUsers.forEach(user => {
      sendStatusUpdateEmail(user.email, task.title, status);
    });

    // Emit real-time update
    req.io.to(`project-${task.project}`).emit('taskUpdated', {
      taskId: task._id,
      status,
      updatedBy: req.user.name
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's tasks
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedUsers: req.user.id })
      .populate('project', 'name');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity logs
router.get('/activity/:projectId', auth, async (req, res) => {
  try {
    const activities = await ActivityLog.find({ entityType: 'task' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;