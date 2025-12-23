import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventForm = () => {
    const [formData, setFormData] = useState({ name: '', date: '', location: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // 1. Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/auth/users/search?query=${searchTerm}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error("Search error", err);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // Wait 300ms after user stops typing (Debounce)

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const addUser = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeUser = (id) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventData = { ...formData, attendees: selectedUsers.map(u => u._id) };
            await axios.post('http://localhost:5000/api/events', eventData);
            alert('Event Created successfully!');
            setFormData({ name: '', date: '', location: '', description: '' });
            setSelectedUsers([]);
        } catch (err) {
            alert("Error saving event");
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', fontFamily: 'Arial' }}>
            <h2>Create New Event</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input name="name" placeholder="Event Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
                <input name="date" type="date" onChange={(e) => setFormData({ ...formData, date: e.target.value })} required style={styles.input} />

                {/* Search Container */}
                <div style={{ position: 'relative' }}>
                    <label>Invite Friends:</label>
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Start typing a name..."
                        style={styles.input}
                    />

                    {/* Dropdown Results (Google Style) */}
                    {searchTerm.length >= 2 && (
                        <div style={styles.dropdown}>
                            {isSearching ? <div style={styles.item}>Searching...</div> : null}
                            {!isSearching && searchResults.length === 0 ? <div style={styles.item}>No users found</div> : null}
                            {searchResults.map(user => (
                                <div key={user._id} onClick={() => addUser(user)} style={styles.item}>
                                    {user.name} <span style={{ fontSize: '12px', color: '#888' }}>({user.email})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Users Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {selectedUsers.map(u => (
                        <span key={u._id} style={styles.chip}>
                            {u.name} <button type="button" onClick={() => removeUser(u._id)} style={styles.chipBtn}>x</button>
                        </span>
                    ))}
                </div>

                <button type="submit" style={styles.submitBtn}>Create Event</button>
            </form>
        </div>
    );
};

// Simple Styles
const styles = {
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    dropdown: {
        position: 'absolute', top: '100%', left: 0, right: 0,
        backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0 0 4px 4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '200px', overflowY: 'auto'
    },
    item: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
    chip: { backgroundColor: '#e0e0e0', padding: '5px 10px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center' },
    chipBtn: { marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default EventForm;