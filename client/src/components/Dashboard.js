import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teams: 0,
    projects: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, teamsRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks/my-tasks'),
        axios.get('http://localhost:5000/api/teams'),
        axios.get('http://localhost:5000/api/projects')
      ]);

      const tasks = tasksRes.data;
      setRecentTasks(tasks.slice(0, 5));
      
      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        teams: teamsRes.data.length,
        projects: projectsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{stats.completedTasks}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgressTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Teams</h3>
          <p className="stat-number">{stats.teams}</p>
        </div>
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-number">{stats.projects}</p>
        </div>
      </div>

      <div className="recent-tasks">
        <h2>Recent Tasks</h2>
        {recentTasks.length > 0 ? (
          <div className="task-list">
            {recentTasks.map(task => (
              <div key={task._id} className="task-item">
                <h4>{task.title}</h4>
                <p>{task.project?.name}</p>
                <span className={`status ${task.status}`}>{task.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No tasks assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;