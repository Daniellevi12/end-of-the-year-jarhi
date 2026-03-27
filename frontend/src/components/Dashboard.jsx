import React, { useState, useEffect, useContext } from 'react';
import EventForm from './EventForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';
import API_BASE_URL from '../config';
import './Dashboard.css';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(""); // State for inviting
  const [inviteSearchTerm, setInviteSearchTerm] = useState("");
  const [inviteSearchResults, setInviteSearchResults] = useState([]);
  const [selectedInviteUser, setSelectedInviteUser] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, eventId: null, eventName: '' });
  const [errorMessage, setErrorMessage] = useState(null);
  const { user, logout, isLoading } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const currentUserId = user?.id || user?._id;
  const API_BASE = `${API_BASE_URL}/api/events`;

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
          const res = await axios.get(`${API_BASE_URL}/api/auth/users/search?query=${inviteSearchTerm}&exclude=${currentUserId}`);
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
    const handleEventUpdated = (updatedEvent) => {
      // Check if current user is related to this event (creator, attendee, or invited guest)
      const isCreator = String(updatedEvent.creator._id || updatedEvent.creator) === String(currentUserId);
      const isAttendee = updatedEvent.attendees?.some(a => String(a._id || a) === String(currentUserId));
      const isInvited = updatedEvent.invitedGuests?.some(g => String(g._id || g) === String(currentUserId));
      
      if (isCreator || isAttendee || isInvited) {
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
        
        // Update expanded event if it's currently open
        setExpandedEvent(prevExpanded => {
          if (prevExpanded && prevExpanded._id === updatedEvent._id) {
            return updatedEvent;
          }
          return prevExpanded;
        });
      }
    };

    const handleEventCreated = (newEvent) => {
      // Check if current user is related to this event
      const isCreator = String(newEvent.creator._id || newEvent.creator) === String(currentUserId);
      const isAttendee = newEvent.attendees?.some(a => String(a._id || a) === String(currentUserId));
      const isInvited = newEvent.invitedGuests?.some(g => String(g._id || g) === String(currentUserId));
      
      if (isCreator || isAttendee || isInvited) {
        setEvents(prev => [...prev, newEvent]);
      }
    };

    const handleEventDeleted = (data) => {
      // If the deletion is for a specific user, only they see it deleted
      if (data.userId && String(data.userId) !== String(currentUserId)) {
        return; // Only the removed user should see it deleted
      }
      setEvents(prev => prev.filter(e => e._id !== data.eventId));
      setExpandedEvent(prevExpanded => {
        if (prevExpanded && prevExpanded._id === data.eventId) {
          return null;
        }
        return prevExpanded;
      });
    };

    socket.on("event_created", handleEventCreated);
    socket.on("event_updated", handleEventUpdated);
    socket.on("event_deleted", handleEventDeleted);

    return () => {
      socket.off("event_created", handleEventCreated);
      socket.off("event_updated", handleEventUpdated);
      socket.off("event_deleted", handleEventDeleted);
    };
  }, [currentUserId]);

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
    if (isAddingItem || !newItemName.trim()) return; // Prevent duplicate submissions and empty items
    
    setIsAddingItem(true);
    try {
      await axios.post(`${API_BASE}/${eventId}/items`, { itemName: newItemName, userId: currentUserId, userName: user.name });
      setNewItemName("");
    } catch (err) { 
      alert(err.response?.data?.message || "Error adding item"); 
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (eventId, itemId) => {
    try {
      await axios.delete(`${API_BASE}/${eventId}/items/${itemId}?userId=${currentUserId}`);
    } catch (err) { alert("Error"); }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>👋 Welcome, <strong>{user?.name || 'User'}</strong>!</p>
          </div>
          <div className="dashboard-button-group">
            <button onClick={() => navigate('/')} className="btn-home">🏠 Home</button>
            <button onClick={() => { logout(); navigate('/'); }} className="btn-logout">🚪 Logout</button>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-create-event">
          {showForm ? "✕ Close" : "+ Create Event"}
        </button>

        {showForm && <div className="event-form-container"><EventForm user={user} onEventCreated={() => { fetchEvents(); setShowForm(false); }} /></div>}

        <div className="events-grid">
          {events.map(e => {
            const isCreator = String(e.creator?._id || e.creator) === String(currentUserId);
            const isAttending = e.attendees?.some(a => String(a._id || a) === String(currentUserId));
            return (
              <div key={e._id} className="event-card" onClick={() => setExpandedEvent(e)}>
                {isCreator && <button className="event-card-delete-btn" onClick={(event) => handleDeleteEvent(event, e._id)}>✕</button>}
                <h3>{e.name}</h3>
                <p>📍 {e.location}</p>
                <div className="rsvp-group">
                  <button className={`btn-coming ${isAttending ? 'active' : 'inactive'}`} onClick={(event) => handleRSVP(event, e._id, 'coming')}>✓ Coming</button>
                  <button disabled={isCreator} className={`btn-not-coming ${!isAttending && !isCreator ? 'active' : 'inactive'}`} onClick={(event) => !isCreator && handleRSVP(event, e._id, 'not-coming')}>{isCreator ? "Organizer" : "✕ Not Coming"}</button>
                </div>
              </div>
            );
          })}
        </div>

        {deleteConfirmModal.show && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmModal({ show: false, eventId: null, eventName: '' })}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="delete-confirm-content">
                <div className="delete-confirm-icon">⚠️</div>
                <h2>Delete Event?</h2>
                <p>
                  Are you sure you want to delete <strong>"{deleteConfirmModal.eventName}"</strong>? This action cannot be undone.
                </p>
                <div className="delete-button-group">
                  <button 
                    onClick={() => setDeleteConfirmModal({ show: false, eventId: null, eventName: '' })}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteEvent}
                    className="btn-delete-confirm"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedEvent && (
          <div className="modal-overlay" onClick={() => setExpandedEvent(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{expandedEvent.name}</h2>
                <button onClick={() => setExpandedEvent(null)} className="modal-close-btn">←</button>
              </div>
              
              {/* INVITE SECTION (Organizer only) */}
              {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && (
                <div className="invite-section">
                  <p className="invite-title">Invite more friends:</p>
                  <div className="search-input-container">
                    <input 
                      type="text" 
                      placeholder="Search by name..." 
                      value={inviteSearchTerm} 
                      onChange={e => setInviteSearchTerm(e.target.value)}
                      className="invite-search-input"
                    />
                    {inviteSearchResults.length > 0 && !selectedInviteUser && (
                      <div className="search-results">
                        {inviteSearchResults.map(u => (
                          <div 
                            key={u._id} 
                            onClick={() => { 
                              setSelectedInviteUser(u);
                              setInviteSearchTerm(u.name);
                              setInviteSearchResults([]);
                            }}
                            className="search-result-item"
                          >
                            {u.name} ({u.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedInviteUser && (
                    <div className="selected-user">
                      <span>Selected: <strong>{selectedInviteUser.name}</strong></span>
                      <div className="selected-user-buttons">
                        <button 
                          onClick={() => { 
                            handleInvite({ preventDefault: () => {} }, expandedEvent._id);
                          }}
                          className="btn-invite"
                        >
                          ✓ Invite
                        </button>
                        <button 
                          onClick={() => { 
                            setSelectedInviteUser(null);
                            setInviteSearchTerm('');
                          }}
                          className="btn-invite-cancel"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 className="guests-coming-title">Who's Coming:</h4>
              <div className="guests-list">
                {expandedEvent.attendees?.map(a => (
                  <div key={a._id} className="guest-badge guest-coming">
                    {a.name}
                    {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && String(a._id) !== String(currentUserId) && (
                      <button 
                        onClick={() => handleRemoveAttendee(expandedEvent._id, a._id)}
                        className="guest-remove-btn"
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
                  <h4 className="guests-not-coming-title">Who's Not Coming:</h4>
                  <div className="guests-list">
                    {expandedEvent.invitedGuests
                      .filter(guest => !expandedEvent.attendees?.some(a => String(a._id) === String(guest._id || guest)))
                      .map(guest => (
                        <div key={guest._id || guest} className="guest-badge guest-not-coming">
                          {guest.name || 'Unknown User'}
                          {String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId) && (
                            <button 
                              onClick={() => handleRemoveAttendee(expandedEvent._id, guest._id || guest)}
                              className="guest-remove-btn"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
              
              <h4 className="items-title">Items:</h4>
              <div className="items-list">
                {expandedEvent.items.map(item => (
                  <div key={item._id} className="item">
                    <span>{item.name} ({item.addedByName})</span>
                    {(String(item.addedBy) === String(currentUserId) || String(expandedEvent.creator?._id || expandedEvent.creator) === String(currentUserId)) && (
                      <button onClick={() => handleDeleteItem(expandedEvent._id, item._id)} className="item-delete-btn">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => handleAddItem(e, expandedEvent._id)} className="add-item-form">
                <input 
                  placeholder="Add item..." 
                  value={newItemName} 
                  onChange={e => setNewItemName(e.target.value)} 
                  disabled={isAddingItem}
                  className="add-item-input"
                />
                <button type="submit" disabled={isAddingItem} className="btn-add-item">
                  {isAddingItem ? 'Adding...' : 'Add'}
                </button>
              </form>

              <button onClick={() => setExpandedEvent(null)} className="btn-back">← Back to Dashboard</button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="modal-overlay" onClick={() => setErrorMessage(null)}>
            <div className="error-modal-content" onClick={e => e.stopPropagation()}>
              <div className="error-icon">📦</div>
              <h2>Hold on!</h2>
              <p>
                {errorMessage}
              </p>
              <button 
                onClick={() => setErrorMessage(null)}
                className="btn-error-close"
              >
                Got it! 👍
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;