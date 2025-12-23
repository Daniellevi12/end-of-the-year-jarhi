import React, { useState } from 'react';
import axios from 'axios';

const EventForm = ({ onEventCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        location: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send data to your backend
            const response = await axios.post('http://localhost:5000/api/events', formData);

            alert('Event created successfully!');

            // Clear the form fields after success
            setFormData({
                name: '',
                date: '',
                location: '',
                description: ''
            });

            // If the Dashboard passed a refresh function, call it now
            if (onEventCreated) {
                onEventCreated();
            }

            console.log("Server Response:", response.data);
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Make sure the backend is running!');
        }
    };

    return (
        <div className="event-form" style={{ maxWidth: '400px', margin: '20px 0' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Event Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div>
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Tel Aviv"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What is the event about?"
                        style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    Create Event
                </button>
            </form>
        </div>
    );
};

export default EventForm;