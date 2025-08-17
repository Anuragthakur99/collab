const express = require('express');
const { Project, Team, Task, User, ActivityLog } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, authorize(['admin', 'project_manager']), async (req, res) => {
  try {
    const { name, description, teamId } = req.body;
    
    const project = new Project({
      name,
      description,
      team: teamId
    });
    await project.save();

    // Log activity
    const activity = new ActivityLog({
      action: 'Project Created',
      entityType: 'project',
      entityId: project._id,
      user: req.user.id,
      details: { projectName: name }
    });
    await activity.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get projects for user's teams
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 
      $or: [{ createdBy: req.user.id }, { members: req.user.id }] 
    });
    
    const teamIds = teams.map(team => team._id);
    const projects = await Project.find({ team: { $in: teamIds } })
      .populate('team', 'name');
    
    // Add task counts to each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return {
          ...project.toObject(),
          taskCount
        };
      })
    );
    
    res.json(projectsWithTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project details
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        populate: { path: 'members', select: 'name email' }
      });
    
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedUsers', 'name');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;