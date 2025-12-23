import React, { useState, useEffect } from 'react';
import EventForm from './EventForm'; // Import the form
import axios from 'axios';
import { Link } from 'react-router-dom';

// Inside Dashboard return:
<Link to="/create-event">
  <button style={{ padding: '10px 20px', cursor: 'pointer' }}>+ Create New Event</button>
</Link>

const Dashboard = () => {
  const [events, setEvents] = useState([]);

  // Function to fetch events so we can see them on the dashboard
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Dashboard</h1>

      <section style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>Create a New Event</h3>
        {/* We pass fetchEvents as a prop so the list updates automatically after saving */}
        <EventForm onEventCreated={fetchEvents} />
      </section>

      <section>
        <h3>Your Events</h3>
        <div className="event-list">
          {events.length === 0 ? <p>No events found.</p> : events.map(event => (
            <div key={event._id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
              <h4>{event.name}</h4>
              <p>{new Date(event.date).toLocaleDateString()} - {event.location}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;