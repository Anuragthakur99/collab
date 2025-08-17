import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberIds: []
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('https://collab-cgos.onrender.com/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://collab-cgos.onrender.com/api/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://collab-cgos.onrender.com/api/teams', formData);
      setFormData({ name: '', description: '', memberIds: [] });
      setShowCreateForm(false);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const canCreateTeam = user.role === 'admin' || user.role === 'project_manager';

  return (
    <div className="teams">
      <div className="teams-header">
        <h1>Teams</h1>
        {canCreateTeam && (
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            Create Team
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Team</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Team Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              <div className="member-selection">
                <h3>Select Members:</h3>
                {allUsers.map(user => (
                  <label key={user._id} className="member-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(user._id)}
                      onChange={() => handleMemberToggle(user._id)}
                    />
                    {user.name} ({user.email})
                  </label>
                ))}
              </div>
              
              <div className="form-actions">
                <button type="submit">Create Team</button>
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="teams-grid">
        {teams.map(team => (
          <div key={team._id} className="team-card">
            <h3>{team.name}</h3>
            <p>{team.description}</p>
            
            <div className="team-members">
              <h4>Members ({team.members?.length || 0})</h4>
              <div className="member-list">
                {team.members?.map(member => (
                  <span key={member._id} className="member-tag">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="team-projects">
              <h4>Projects ({team.projectCount || 0})</h4>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="no-teams">
          <p>You're not part of any teams yet.</p>
        </div>
      )}
    </div>
  );
};

export default Teams;
