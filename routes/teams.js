const express = require('express');
const { Team, User, Project } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create team
router.post('/', auth, authorize(['admin', 'project_manager']), async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    
    const team = new Team({
      name,
      description,
      createdBy: req.user.id,
      members: memberIds || []
    });
    await team.save();

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's teams
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 
      $or: [{ createdBy: req.user.id }, { members: req.user.id }] 
    }).populate('members', 'name email').populate('createdBy', 'name email');
    
    // Add project counts to each team
    const teamsWithProjects = await Promise.all(
      teams.map(async (team) => {
        const projectCount = await Project.countDocuments({ team: team._id });
        return {
          ...team.toObject(),
          projectCount
        };
      })
    );
    
    res.json(teamsWithProjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team details
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');
    
    const projects = await Project.find({ team: req.params.id });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ ...team.toObject(), projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;