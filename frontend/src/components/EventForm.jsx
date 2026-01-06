import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventForm = ({ onEventCreated, user }) => {
    const [formData, setFormData] = useState({ name: '', date: '', location: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const currentUserId = user?.id || user?._id;

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/auth/users/search?query=${searchTerm}&exclude=${currentUserId}`);
                    setSearchResults(res.data);
                } catch (err) { console.error(err); }
            } else { setSearchResults([]); }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUserId) return alert("Session expired.");
        try {
            const eventData = {
                ...formData,
                invitedGuests: selectedUsers.map(u => u._id),
                creator: currentUserId
            };
            await axios.post('http://localhost:5000/api/events', eventData);
            onEventCreated();
            setFormData({ name: '', date: '', location: '', description: '' });
            setSelectedUsers([]);
            setSearchTerm('');
        } catch (err) { alert(err.response?.data?.message || "Error creating event"); }
    };

    const styles = {
        input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
        dropdown: { position: 'absolute', width: '100%', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        item: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
        chip: { backgroundColor: '#6c5ce7', color: 'white', padding: '5px 12px', borderRadius: '20px', marginRight: '5px', display: 'inline-block', fontSize: '13px' },
        btn: { width: '100%', padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
    };

    return (
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <input placeholder="Event Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={styles.input} />
            <input placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={styles.input} />

            <div style={{ position: 'relative' }}>
                <input placeholder="Invite friends..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.input} />
                {searchResults.length > 0 && (
                    <div style={styles.dropdown}>
                        {searchResults.map(u => (
                            <div key={u._id} onClick={() => { setSelectedUsers([...selectedUsers, u]); setSearchTerm(''); setSearchResults([]); }} style={styles.item}>
                                {u.name} ({u.email})
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ marginBottom: '15px' }}>
                {selectedUsers.map(u => <span key={u._id} style={styles.chip}>{u.name}</span>)}
            </div>
            <button type="submit" style={styles.btn}>Create Event</button>
        </form>
    );
};

export default EventForm;