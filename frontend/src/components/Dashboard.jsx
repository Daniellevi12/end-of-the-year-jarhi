import React, { useState, useEffect, useContext } from 'react';
import EventForm from './EventForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const currentUserId = user?.id || user?._id;

  const fetchEvents = async () => {
    if (!currentUserId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/events?userId=${currentUserId}`);
      setEvents(res.data);
      if (expandedEvent) {
        const updated = res.data.find(e => e._id === expandedEvent._id);
        setExpandedEvent(updated);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, [currentUserId]);

  const handleAddItem = async (e, eventId) => {
    e.preventDefault();
    if (!newItemName) return;
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/items`, {
        itemName: newItemName, userId: currentUserId, userName: user.name
      });
      setNewItemName("");
      fetchEvents();
    } catch (err) { alert("Error adding item"); }
  };

  const handleDeleteItem = async (eventId, itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}/items/${itemId}?userId=${currentUserId}`);
      fetchEvents();
    } catch (err) { alert(err.response?.data?.message || "Unauthorized"); }
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '40px 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    wrapper: { maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.5)' },
    headerTitle: { fontSize: '2.5rem', fontWeight: '700', color: '#2d3436', letterSpacing: '-0.5px' },
    headerUser: { display: 'flex', alignItems: 'center', gap: '15px' },
    card: { backgroundColor: 'white', padding: '22px', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.8)', ':hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 25px rgba(0,0,0,0.12)' } },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' },
    modal: { background: 'white', padding: '35px', borderRadius: '20px', width: '90%', maxWidth: '500px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f2f5' },
    empty: { textAlign: 'center', padding: '100px 20px', color: '#636e72' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Dashboard</h1>
          <div style={styles.headerUser}>
            <span style={{ fontSize: '16px', color: '#2d3436', fontWeight: '500' }}>Welcome, {user?.name}</span>
            <button onClick={() => navigate('/')} style={{ padding: '10px 24px', backgroundColor: '#5f7983', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '14px' }} onMouseOver={(e) => e.target.style.backgroundColor = '#4a5f6b'} onMouseOut={(e) => e.target.style.backgroundColor = '#5f7983'}>← Back to Home</button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '10px 24px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '14px' }} onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'} onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}>Logout</button>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 28px', backgroundColor: '#6c5ce7', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#5f4dd9'; e.target.style.boxShadow = '0 6px 16px rgba(108, 92, 231, 0.4)'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#6c5ce7'; e.target.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.3)'; }}>
            {showForm ? "✕ Close Form" : "+ Create Event"}
          </button>
          {showForm && (
            <div style={{ background: 'white', padding: '35px', borderRadius: '16px', marginTop: '20px', boxShadow: '0 10px 35px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)' }}>
              <EventForm user={user} onEventCreated={() => { fetchEvents(); setShowForm(false); }} />
            </div>
          )}
        </div>

        <h2 style={{ marginBottom: '24px', fontSize: '1.8rem', fontWeight: '700', color: '#2d3436' }}>Upcoming Events</h2>
        {events.length === 0 ? (
          <div style={styles.empty}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#2d3436' }}>No events yet</h3>
            <p style={{ fontSize: '15px', color: '#636e72' }}>Create your first event to get started!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {events.map(e => (
              <div key={e._id} style={{ ...styles.card, ':hover': undefined }} onMouseOver={(el) => { el.currentTarget.style.transform = 'translateY(-6px)'; el.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)'; }} onMouseOut={(el) => { el.currentTarget.style.transform = 'translateY(0)'; el.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }} onClick={() => setExpandedEvent(e)}>
                <span style={{ fontSize: '11px', color: '#6c5ce7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {String(e.creator?._id || e.creator) === String(currentUserId) ? "🎯 Organizer" : "👥 Guest"}
                </span>
                <h3 style={{ margin: '12px 0 14px 0', fontSize: '1.3rem', fontWeight: '700', color: '#2d3436' }}>{e.name}</h3>
                <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '8px' }}>📍 {e.location}</p>
                <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '12px' }}>📅 {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <div style={{ marginTop: '14px', fontSize: '13px', color: '#00b894', fontWeight: '600' }}>📦 {e.items?.length || 0} items added</div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL FOR ITEMS */}
        {expandedEvent && (
          <div style={styles.modalOverlay} onClick={() => setExpandedEvent(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2d3436', marginBottom: '8px' }}>{expandedEvent.name}</h2>
              <p style={{ color: '#636e72', marginBottom: '24px', fontSize: '15px' }}>Items to bring:</p>

              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '24px', borderRadius: '10px', border: '1px solid #f0f2f5', padding: '12px' }}>
                {expandedEvent.items.length === 0 && <p style={{ color: '#b2bec3', textAlign: 'center', padding: '20px 0' }}>No items yet. Be the first to add!</p>}
                {expandedEvent.items.map(item => (
                  <div key={item._id} style={styles.itemRow}>
                    <span style={{ flex: 1 }}><strong style={{ color: '#2d3436' }}>{item.name}</strong> <small style={{ color: '#99a9b9', fontSize: '13px' }}>— {item.addedByName}</small></span>
                    {(String(item.addedBy) === String(currentUserId) || String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId)) && (
                      <button onClick={() => handleDeleteItem(expandedEvent._id, item._id)} style={{ border: 'none', background: 'none', color: '#ff7675', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '4px 8px', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = '#ff5252'} onMouseOut={(e) => e.target.style.color = '#ff7675'}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => handleAddItem(e, expandedEvent._id)} style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                <input
                  placeholder="I'll bring..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1px solid #dfe6e9', fontSize: '15px', fontFamily: 'inherit', transition: 'border-color 0.2s ease' }} onFocus={(e) => e.target.style.borderColor = '#6c5ce7'} onBlur={(e) => e.target.style.borderColor = '#dfe6e9'}
                />
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '14px' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#00a884'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#00b894'; }}>Add</button>
              </form>
              <button onClick={() => setExpandedEvent(null)} style={{ width: '100%', background: '#f0f2f5', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#636e72', transition: 'all 0.2s ease', fontSize: '14px' }} onMouseOver={(e) => e.target.style.background = '#e0e3e9'} onMouseOut={(e) => e.target.style.background = '#f0f2f5'}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;