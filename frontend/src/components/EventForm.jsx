import React, { useState } from 'react';
import axios from 'axios';

const EventForm = () => {
  const [formData, setFormData] = useState({ name: '', date: '', location: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Search for users as you type
  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      const res = await axios.get(`http://localhost:5000/api/auth/users/search?query=${e.target.value}`);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const addUser = (user) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = { ...formData, attendees: selectedUsers.map(u => u._id) };
    await axios.post('http://localhost:5000/api/events', eventData);
    alert('Event Created with Attendees!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Event Name" onChange={handleChange} required />
        <input name="date" type="date" onChange={handleChange} required />
        
        <div style={{ margin: '15px 0' }}>
          <label>Invite Users:</label>
          <input value={searchTerm} onChange={handleSearch} placeholder="Search username..." />
          <ul>
            {searchResults.map(user => (
              <li key={user._id} onClick={() => addUser(user)} style={{ cursor: 'pointer', color: 'blue' }}>
                {user.username} (Click to add)
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Invited:</strong> {selectedUsers.map(u => u.username).join(', ')}
        </div>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventForm;