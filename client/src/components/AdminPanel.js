import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      switch (activeTab) {
        case 'users':
          const usersRes = await axios.get('https://collab-cgos.onrender.com/api/admin/users');
          setUsers(usersRes.data);
          break;
        case 'teams':
          const teamsRes = await axios.get('https://collab-cgos.onrender.com/api/admin/teams');
          setTeams(teamsRes.data);
          break;
        case 'projects':
          const projectsRes = await axios.get('https://collab-cgos.onrender.com/api/admin/projects');
          setProjects(projectsRes.data);
          break;
        case 'tasks':
          const tasksRes = await axios.get('https://collab-cgos.onrender.com/api/admin/tasks');
          setTasks(tasksRes.data);
          break;
        case 'analytics':
          const analyticsRes = await axios.get('https://collab-cgos.onrender.com/api/admin/analytics');
          setAnalytics(analyticsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.patch(`https://collab-cgos.onrender.com/api/admin/users/${userId}/role`, {
        role: newRole
      });
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      await axios.delete(`https://collab-cgos.onrender.com/api/admin/${type}/${id}`);
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        {['users', 'teams', 'projects', 'tasks', 'analytics'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-management">
            <h2>User Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                      >
                        <option value="team_member">Team Member</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteItem('users', user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="teams-management">
            <h2>Team Management</h2>
            <div className="admin-grid">
              {teams.map(team => (
                <div key={team._id} className="admin-card">
                  <h3>{team.name}</h3>
                  <p>{team.description}</p>
                  <p><strong>Created by:</strong> {team.createdBy?.name}</p>
                  <p><strong>Members:</strong> {team.members?.length || 0}</p>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteItem('teams', team._id)}
                  >
                    Delete Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-management">
            <h2>Project Management</h2>
            <div className="admin-grid">
              {projects.map(project => (
                <div key={project._id} className="admin-card">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p><strong>Team:</strong> {project.team?.name}</p>
                  <p><strong>Status:</strong> {project.status}</p>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteItem('projects', project._id)}
                  >
                    Delete Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-management">
            <h2>Task Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project?.name}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>
                      {task.assignedUsers?.map(user => user.name).join(', ')}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteItem('tasks', task._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="analytics">
            <h2>System Analytics</h2>
            <div className="analytics-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{analytics.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h3>Total Teams</h3>
                <p className="stat-number">{analytics.totalTeams}</p>
              </div>
              <div className="stat-card">
                <h3>Total Projects</h3>
                <p className="stat-number">{analytics.totalProjects}</p>
              </div>
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <p className="stat-number">{analytics.totalTasks}</p>
              </div>
            </div>
            
            <div className="charts">
              <div className="chart-section">
                <h3>Tasks by Status</h3>
                {analytics.tasksByStatus.map(item => (
                  <div key={item._id} className="chart-item">
                    <span>{item._id}:</span> <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
              
              <div className="chart-section">
                <h3>Users by Role</h3>
                {analytics.usersByRole.map(item => (
                  <div key={item._id} className="chart-item">
                    <span>{item._id}:</span> <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
