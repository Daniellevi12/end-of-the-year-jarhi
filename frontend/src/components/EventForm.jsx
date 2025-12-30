import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventForm = ({ onEventCreated, user }) => {
    const [formData, setFormData] = useState({ name: '', date: '', location: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // According to your auth.js, the ID is stored in 'user.id'
    const currentUserId = user?.id || user?._id;

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    // We pass the currentUserId to the 'exclude' param we created in auth.js
                    const res = await axios.get(`http://localhost:5000/api/auth/users/search?query=${searchTerm}&exclude=${currentUserId}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error("Search error", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUserId) {
            alert("User session not found. Please log in again.");
            return;
        }

        try {
            const eventData = {
                ...formData,
                attendees: selectedUsers.map(u => u._id),
                creator: currentUserId
            };

            await axios.post('http://localhost:5000/api/events', eventData);
            alert('Event Created Successfully!');

            if (onEventCreated) onEventCreated();

            setFormData({ name: '', date: '', location: '', description: '' });
            setSelectedUsers([]);
            setSearchTerm('');
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || "Server Error"));
        }
    };

    const styles = {
        input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
        dropdown: { position: 'absolute', width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
        item: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' },
        chip: { backgroundColor: '#667eea', color: 'white', padding: '5px 12px', borderRadius: '20px', marginRight: '5px', display: 'inline-block', marginBottom: '5px' },
        btn: { width: '100%', padding: '12px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
    };

    return (
        <div style={{ color: '#333', position: 'relative' }}>
            <form onSubmit={handleSubmit}>
                <input placeholder="Event Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={styles.input} />
                <input placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={styles.input} />

                <textarea placeholder="Description (optional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...styles.input, resize: 'vertical' }} />

                <div style={{ position: 'relative' }}>
                    <input placeholder="Search friends to invite..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.input} />
                    {(isSearching || searchResults.length > 0 || (searchTerm.length >= 2 && !isSearching && searchResults.length === 0)) && (
                        <div style={{ ...styles.dropdown, maxHeight: '220px', overflowY: 'auto' }}>
                            {isSearching && (
                                <div style={styles.item}>Searching...</div>
                            )}
                            {!isSearching && searchResults.length === 0 && searchTerm.length >= 2 && (
                                <div style={styles.item}>No users found</div>
                            )}
                            {searchResults.map(u => (
                                <div key={u._id} onClick={() => { if (!selectedUsers.some(s => s._id === u._id)) setSelectedUsers([...selectedUsers, u]); setSearchTerm(''); setSearchResults([]); }} style={styles.item}>
                                    {u.name} ({u.email})
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ margin: '10px 0', display: 'flex', flexWrap: 'wrap' }}>
                    {selectedUsers.map(u => (
                        <div key={u._id} style={{ display: 'flex', alignItems: 'center', marginRight: '8px', marginBottom: '6px', background: '#667eea', color: '#fff', padding: '6px 10px', borderRadius: '20px' }}>
                            <span style={{ marginRight: '8px' }}>{u.name}</span>
                            <button type="button" onClick={() => setSelectedUsers(selectedUsers.filter(s => s._id !== u._id))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>×</button>
                        </div>
                    ))}
                </div>

                <button type="submit" style={styles.btn}>Create Event</button>
            </form>
        </div>
    );
};

export default EventForm;