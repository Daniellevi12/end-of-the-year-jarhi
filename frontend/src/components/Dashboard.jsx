import React, { useState, useEffect, useContext } from 'react';
import EventForm from './EventForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  // Match your backend 'id' key
  const currentUserId = user?.id || user?._id;

  const fetchEvents = async () => {
    if (!currentUserId) return;
    try {
      // Passing the correct ID key to the backend
      const res = await axios.get(`http://localhost:5000/api/events?userId=${currentUserId}`);
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentUserId]);

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px', fontFamily: 'Inter, Roboto, Arial, sans-serif' },
    wrapper: { maxWidth: '1100px', margin: '0 auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', marginBottom: '30px' },
    userActions: { display: 'flex', alignItems: 'center', gap: '12px' },
    smallBtn: { padding: '8px 14px', backgroundColor: '#ffffff22', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer' },
    primaryBtn: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    card: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    eventItem: { backgroundColor: 'white', padding: '18px', borderRadius: '12px', borderLeft: '6px solid #667eea', boxShadow: '0 6px 18px rgba(102,126,234,0.07)', transition: 'transform .15s ease, box-shadow .15s ease', cursor: 'default' },
    tag: { fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eef2ff', color: '#334155', fontWeight: '700' },
    empty: { textAlign: 'center', color: 'white', padding: '50px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '15px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', marginBottom: '30px' }}>
          <h1>📊 Dashboard</h1>
          <div style={styles.userActions}>
            <span style={{ marginRight: '6px' }}>Hi, {user?.name}</span>
            <button onClick={() => navigate('/')} style={styles.smallBtn}>⤺ First Page</button>
            <button onClick={() => { logout(); navigate('/'); }} style={styles.primaryBtn}>Logout</button>
          </div>
        </div>

        <div style={styles.card}>
          <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: showForm ? '20px' : '0', cursor: 'pointer' }}>
            {showForm ? "✕ Close Form" : "+ Create New Event"}
          </button>
          {showForm && (
            <EventForm
              user={user}
              onEventCreated={() => { fetchEvents(); setShowForm(false); }}
            />
          )}
        </div>

        <h2 style={{ color: 'white', marginBottom: '20px' }}>Your Events</h2>

        {events.length === 0 ? (
          <div style={styles.empty}>
            <h3>No events at the moment.</h3>
            <p>Create an event or wait for an invite!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {events.map(e => (
              <div key={e._id} style={styles.eventItem}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.tag}>
                    {String(e.creator?._id || e.creator) === String(currentUserId) ? "Organizer" : "Invited"}
                  </span>
                  <span style={{ fontSize: '12px', color: '#667085' }}>{(e.attendees?.length ?? e.attendeesCount ?? 0)} attendee{(e.attendees?.length ?? e.attendeesCount ?? 0) !== 1 ? 's' : ''}</span>
                </div>

                <h4 style={{ margin: '0 0 10px 0' }}>{e.name}</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>📅 {new Date(e.date).toLocaleDateString()}</p>
                <p style={{ color: '#666', fontSize: '14px', margin: '6px 0 10px 0' }}>📍 {e.location}</p>
                {e.description && (
                  <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{e.description.length > 120 ? e.description.slice(0, 120) + '...' : e.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;