import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    teamId: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedUserIds: []
  });

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      socketService.connect();
      socketService.joinProject(selectedProject._id);
      
      socketService.onTaskCreated((data) => {
        setSelectedProject(prev => ({
          ...prev,
          tasks: [...prev.tasks, data.task]
        }));
      });
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('https://collab-cgos.onrender.com/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('https://collab-cgos.onrender.com/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`https://collab-cgos.onrender.com/api/projects/${projectId}`);
      setSelectedProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://collab-cgos.onrender.com/api/projects', projectForm);
      setProjectForm({ name: '', description: '', teamId: '' });
      setShowCreateProject(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://collab-cgos.onrender.com/api/tasks', {
        ...taskForm,
        projectId: selectedProject._id
      });
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedUserIds: []
      });
      setShowCreateTask(false);
      fetchProjectDetails(selectedProject._id);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const canCreateProject = user.role === 'admin' || user.role === 'project_manager';

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Projects</h1>
        {canCreateProject && (
          <button 
            className="create-btn"
            onClick={() => setShowCreateProject(true)}
          >
            Create Project
          </button>
        )}
      </div>

      <div className="projects-layout">
        <div className="projects-list">
          {projects.map(project => (
            <div 
              key={project._id} 
              className={`project-item ${selectedProject?._id === project._id ? 'active' : ''}`}
              onClick={() => fetchProjectDetails(project._id)}
            >
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <span className="task-count">
                {project.taskCount || 0} tasks
              </span>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="project-details">
            <div className="project-header">
              <h2>{selectedProject.name}</h2>
              <button 
                className="create-task-btn"
                onClick={() => setShowCreateTask(true)}
              >
                Add Task
              </button>
            </div>
            
            <p>{selectedProject.description}</p>
            
            <div className="tasks-board">
              <div className="task-column">
                <h3>To Do</h3>
                {selectedProject.tasks?.filter(t => t.status === 'todo').map(task => (
                  <div key={task._id} className="task-card">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-assignees">
                      {task.assignedUsers?.map(user => (
                        <span key={user._id} className="assignee">{user.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="task-column">
                <h3>In Progress</h3>
                {selectedProject.tasks?.filter(t => t.status === 'in_progress').map(task => (
                  <div key={task._id} className="task-card">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-assignees">
                      {task.assignedUsers?.map(user => (
                        <span key={user._id} className="assignee">{user.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="task-column">
                <h3>Completed</h3>
                {selectedProject.tasks?.filter(t => t.status === 'completed').map(task => (
                  <div key={task._id} className="task-card">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-assignees">
                      {task.assignedUsers?.map(user => (
                        <span key={user._id} className="assignee">{user.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project Name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
              />
              
              <select
                value={projectForm.teamId}
                onChange={(e) => setProjectForm({...projectForm, teamId: e.target.value})}
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
              
              <div className="form-actions">
                <button type="submit">Create Project</button>
                <button type="button" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              />
              
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
              />
              
              <div className="assignee-selection">
                <h3>Assign to:</h3>
                {selectedProject?.team?.members?.map(user => (
                  <label key={user._id} className="assignee-checkbox">
                    <input
                      type="checkbox"
                      checked={taskForm.assignedUserIds.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTaskForm(prev => ({
                            ...prev,
                            assignedUserIds: [...prev.assignedUserIds, user._id]
                          }));
                        } else {
                          setTaskForm(prev => ({
                            ...prev,
                            assignedUserIds: prev.assignedUserIds.filter(id => id !== user._id)
                          }));
                        }
                      }}
                    />
                    {user.name}
                  </label>
                ))}
              </div>
              
              <div className="form-actions">
                <button type="submit">Create Task</button>
                <button type="button" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
