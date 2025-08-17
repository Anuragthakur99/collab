import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">CollabTool</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/teams">Teams</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/tasks">My Tasks</Link>
        {user.role === 'admin' && (
          <Link to="/admin">Admin Panel</Link>
        )}
      </div>
      
      <div className="nav-user">
        <span>Welcome, {user.name}</span>
        <span className="user-role">({user.role})</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;