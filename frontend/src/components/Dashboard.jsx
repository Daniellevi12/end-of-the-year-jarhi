import React, { useState, useEffect, useContext } from 'react';
import EventForm from './EventForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [inviteEmail, setInviteEmail] = useState(""); // State for inviting
  const [inviteSearchTerm, setInviteSearchTerm] = useState("");
  const [inviteSearchResults, setInviteSearchResults] = useState([]);
  const [selectedInviteUser, setSelectedInviteUser] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, eventId: null, eventName: '' });
  const { user, logout, isLoading } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const currentUserId = user?.id || user?._id;
  const API_BASE = `http://${window.location.hostname}:5000/api/events`;

  const fetchEvents = async () => {
    if (!currentUserId || isLoading) return;
    try {
      const res = await axios.get(`${API_BASE}?userId=${currentUserId}`);
      setEvents(res.data);
      if (expandedEvent) {
        const updated = res.data.find(e => e._id === expandedEvent._id);
        setExpandedEvent(updated);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    if (!isLoading) {
      fetchEvents();
    }
  }, [currentUserId, isLoading]);

  // Search users for invite when expandedEvent modal is open
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inviteSearchTerm.length >= 2 && expandedEvent) {
        try {
          const res = await axios.get(`http://${window.location.hostname}:5000/api/auth/users/search?query=${inviteSearchTerm}&exclude=${currentUserId}`);
          setInviteSearchResults(res.data);
        } catch (err) { console.error(err); }
      } else { 
        setInviteSearchResults([]); 
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [inviteSearchTerm, expandedEvent, currentUserId]);

  // Listen for real-time event updates
  useEffect(() => {
    socket.on("event_created", (newEvent) => {
      // Check if current user is related to this event
      if (String(newEvent.creator._id || newEvent.creator) === String(currentUserId) || 
          newEvent.invitedGuests?.some(g => String(g._id || g) === String(currentUserId))) {
        setEvents(prev => [...prev, newEvent]);
      }
    });

    socket.on("event_updated", (updatedEvent) => {
      // Check if current user is related to this event
      if (String(updatedEvent.creator._id || updatedEvent.creator) === String(currentUserId) || 
          updatedEvent.invitedGuests?.some(g => String(g._id || g) === String(currentUserId))) {
        setEvents(prev => {
          // Check if event already exists in the list
          const exists = prev.find(e => e._id === updatedEvent._id);
          if (exists) {
            // Update existing event
            return prev.map(e => e._id === updatedEvent._id ? updatedEvent : e);
          } else {
            // Add new event if user just got invited
            return [...prev, updatedEvent];
          }
        });
        if (expandedEvent && expandedEvent._id === updatedEvent._id) {
          setExpandedEvent(updatedEvent);
        }
      }
    });

    socket.on("event_deleted", (data) => {
      // If the deletion is for a specific user, only they see it deleted
      if (data.userId && String(data.userId) !== String(currentUserId)) {
        return; // Only the removed user should see it deleted
      }
      setEvents(prev => prev.filter(e => e._id !== data.eventId));
      if (expandedEvent && expandedEvent._id === data.eventId) {
        setExpandedEvent(null);
      }
    });

    return () => {
      socket.off("event_created");
      socket.off("event_updated");
      socket.off("event_deleted");
    };
  }, [currentUserId, expandedEvent]);

  const handleRSVP = async (e, eventId, status) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_BASE}/${eventId}/rsvp`, { userId: currentUserId, status });
      fetchEvents();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleRemoveAttendee = async (eventId, userId) => {
    try {
      await axios.post(`${API_BASE}/${eventId}/remove-guest`, { userId: currentUserId, guestId: userId });
      fetchEvents();
    } catch (err) { alert("Error removing attendee"); }
  };

  const handleInvite = async (e, eventId) => {
    e.preventDefault();
    if (!selectedInviteUser) return alert("Please select a user to invite");
    try {
      await axios.post(`${API_BASE}/${eventId}/invite`, { guestId: selectedInviteUser._id });
      setSelectedInviteUser(null);
      setInviteSearchTerm("");
      setInviteSearchResults([]);
      fetchEvents();
    } catch (err) { alert("Error inviting user"); }
  };

  const handleDeleteEvent = async (e, eventId) => {
    e.stopPropagation();
    const event = events.find(ev => ev._id === eventId);
    setDeleteConfirmModal({ show: true, eventId, eventName: event?.name || 'this event' });
  };

  const confirmDeleteEvent = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteConfirmModal.eventId}?userId=${currentUserId}`);
      setDeleteConfirmModal({ show: false, eventId: null, eventName: '' });
      fetchEvents();
    } catch (err) { alert("Error deleting"); }
  };

  const handleAddItem = async (e, eventId) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/${eventId}/items`, { itemName: newItemName, userId: currentUserId, userName: user.name });
      setNewItemName("");
      fetchEvents();
    } catch (err) { alert("Error adding item"); }
  };

  const handleDeleteItem = async (eventId, itemId) => {
    try {
      await axios.delete(`${API_BASE}/${eventId}/items/${itemId}?userId=${currentUserId}`);
      fetchEvents();
    } catch (err) { alert("Error"); }
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '40px 20px', fontFamily: 'sans-serif' },
    wrapper: { maxWidth: '1100px', margin: '0 auto' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', position: 'relative' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' },
    rsvpGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnComing: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: active ? '#00b894' : '#f0f2f5', color: active ? 'white' : '#636e72' }),
    btnNotComing: (active, disabled) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', backgroundColor: active ? '#ff7675' : '#f0f2f5', color: active ? 'white' : '#636e72', opacity: disabled ? 0.5 : 1 }),
    deleteBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '18px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0' }}>Dashboard</h1>
            <p style={{ margin: 0, fontSize: '16px', color: '#636e72' }}>👋 Welcome, <strong>{user?.name || 'User'}</strong>!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/')} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #00b894 0%, #00a382 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 184, 148, 0.4)', transition: 'transform 0.2s' }}>🏠 Home</button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', transition: 'transform 0.2s' }}>🚪 Logout</button>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#6c5ce7', color: 'white', border: 'none', borderRadius: '10px', marginBottom: '30px' }}>
          {showForm ? "✕ Close" : "+ Create Event"}
        </button>

        {showForm && <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}><EventForm user={user} onEventCreated={() => { fetchEvents(); setShowForm(false); }} /></div>}

        <div style={styles.grid}>
          {events.map(e => {
            const isCreator = String(e.creator?._id || e.creator) === String(currentUserId);
            const isAttending = e.attendees?.some(a => String(a._id || a) === String(currentUserId));
            return (
              <div key={e._id} style={styles.card} onClick={() => setExpandedEvent(e)}>
                {isCreator && <button style={styles.deleteBtn} onClick={(event) => handleDeleteEvent(event, e._id)}>✕</button>}
                <h3>{e.name}</h3>
                <p>📍 {e.location}</p>
                <div style={styles.rsvpGroup}>
                  <button style={styles.btnComing(isAttending)} onClick={(event) => handleRSVP(event, e._id, 'coming')}>✓ Coming</button>
                  <button disabled={isCreator} style={styles.btnNotComing(!isAttending && !isCreator, isCreator)} onClick={(event) => !isCreator && handleRSVP(event, e._id, 'not-coming')}>{isCreator ? "Organizer" : "✕ Not Coming"}</button>
                </div>
              </div>
            );
          })}
        </div>

        {deleteConfirmModal.show && (
          <div style={styles.modalOverlay} onClick={() => setDeleteConfirmModal({ show: false, eventId: null, eventName: '' })}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ marginTop: 0, color: '#2d3436' }}>Delete Event?</h2>
                <p style={{ fontSize: '16px', color: '#636e72', marginBottom: '30px' }}>
                  Are you sure you want to delete <strong>"{deleteConfirmModal.eventName}"</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setDeleteConfirmModal({ show: false, eventId: null, eventName: '' })}
                    style={{ 
                      padding: '12px 30px', 
                      background: '#f0f2f5', 
                      color: '#2d3436', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e8eaed'}
                    onMouseOut={(e) => e.target.style.background = '#f0f2f5'}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteEvent}
                    style={{ 
                      padding: '12px 30px', 
                      background: '#ff7675', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#ff6c6c'}
                    onMouseOut={(e) => e.target.style.background = '#ff7675'}
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedEvent && (
          <div style={styles.modalOverlay} onClick={() => setExpandedEvent(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{expandedEvent.name}</h2>
                <button onClick={() => setExpandedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
              </div>
              
              {/* INVITE SECTION (Organizer only) */}
              {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && (
                <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #6c5ce7', borderRadius: '8px', position: 'relative' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Invite more friends:</p>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Search by name..." 
                      value={inviteSearchTerm} 
                      onChange={e => setInviteSearchTerm(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                    />
                    {inviteSearchResults.length > 0 && !selectedInviteUser && (
                      <div style={{ position: 'absolute', width: '100%', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '5px' }}>
                        {inviteSearchResults.map(u => (
                          <div 
                            key={u._id} 
                            onClick={() => { 
                              setSelectedInviteUser(u);
                              setInviteSearchTerm(u.name);
                              setInviteSearchResults([]);
                            }} 
                            style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' }}
                          >
                            {u.name} ({u.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedInviteUser && (
                    <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: '#f0f2f5', borderRadius: '5px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Selected: <strong>{selectedInviteUser.name}</strong></span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => { 
                            handleInvite({ preventDefault: () => {} }, expandedEvent._id);
                          }}
                          style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          ✓ Invite
                        </button>
                        <button 
                          onClick={() => { 
                            setSelectedInviteUser(null);
                            setInviteSearchTerm('');
                          }}
                          style={{ background: '#ddd', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4>Who's Coming:</h4>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {expandedEvent.attendees?.map(a => (
                  <div key={a._id} style={{ background: '#dfe6e9', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {a.name}
                    {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && String(a._id) !== String(currentUserId) && (
                      <button 
                        onClick={() => handleRemoveAttendee(expandedEvent._id, a._id)}
                        style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 2px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Who's Not Coming Section */}
              {expandedEvent.invitedGuests && expandedEvent.invitedGuests.length > 0 && (
                <>
                  <h4>Who's Not Coming:</h4>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {expandedEvent.invitedGuests
                      .filter(guest => !expandedEvent.attendees?.some(a => String(a._id) === String(guest._id || guest)))
                      .map(guest => (
                        <div key={guest._id || guest} style={{ background: '#ffcccc', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {guest.name || 'Unknown User'}
                          {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && (
                            <button 
                              onClick={() => handleRemoveAttendee(expandedEvent._id, guest._id || guest)}
                              style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 2px' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
              
              <h4>Items:</h4>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                {expandedEvent.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.name} ({item.addedByName})</span>
                    {(String(item.addedBy) === String(currentUserId) || String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId)) && (
                      <button onClick={() => handleDeleteItem(expandedEvent._id, item._id)} style={{ border: 'none', background: 'none', color: 'red' }}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => handleAddItem(e, expandedEvent._id)} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input placeholder="Add item..." value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                <button type="submit" style={{ padding: '8px 15px', background: '#00b894', color: 'white', border: 'none', borderRadius: '5px' }}>Add</button>
              </form>

              <button onClick={() => setExpandedEvent(null)} style={{ width: '100%', padding: '12px', background: '#6c5ce7', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer' }}>← Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;