import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socketService from '../services/socket';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    
    // Connect to socket for real-time updates
    socketService.connect();
    socketService.onTaskUpdated((data) => {
      setTasks(prev => prev.map(task => 
        task._id === data.taskId 
          ? { ...task, status: data.status }
          : task
      ));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks/my-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      
      setTasks(prev => prev.map(task => 
        task._id === taskId 
          ? { ...task, status: newStatus }
          : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#ffa500';
      case 'in_progress': return '#007bff';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="tasks">
      <div className="tasks-header">
        <h1>My Tasks</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'todo' ? 'active' : ''}
            onClick={() => setFilter('todo')}
          >
            To Do
          </button>
          <button 
            className={filter === 'in_progress' ? 'active' : ''}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <div key={task._id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="task-meta">
              <span className="project-name">{task.project?.name}</span>
              <span className="priority">{task.priority}</span>
            </div>
            
            <div className="task-status">
              <span 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status.replace('_', ' ')}
              </span>
              
              <select 
                value={task.status}
                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                className="status-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {task.dueDate && (
              <div className="due-date">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="no-tasks">
          <p>No tasks found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;