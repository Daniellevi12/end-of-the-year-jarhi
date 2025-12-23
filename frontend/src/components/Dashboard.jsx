import React, { useState, useEffect, useContext } from 'react';
import EventForm from './EventForm'; // Import the form
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '30px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      maxWidth: '1200px',
      margin: '0 auto 40px',
      color: 'white',
    },
    title: {
      fontSize: '36px',
      fontWeight: '700',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    userName: {
      fontSize: '18px',
      fontWeight: '600',
    },
    logoutBtn: {
      padding: '10px 20px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    section: {
      marginBottom: '40px',
    },
    sectionTitle: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '20px',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    formCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      marginBottom: '20px',
    },
    toggleBtn: {
      padding: '10px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'all 0.3s ease',
    },
    eventGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
    },
    eventCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease',
      borderLeft: '5px solid #667eea',
    },
    eventCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
    },
    eventTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#333',
      marginBottom: '10px',
    },
    eventInfo: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.6',
      marginBottom: '8px',
    },
    eventLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '12px',
      display: 'inline-block',
    },
    emptyState: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '50px 30px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '15px',
    },
    emptyStateText: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 15px",
          backgroundColor: "white",
          color: "#667eea",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          zIndex: "100",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "none";
          e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
        }}
      >
        ← Home
      </button>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <div style={styles.userInfo}>
          {user && <span style={styles.userName}>👋 Welcome, {user.name}!</span>}
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'none';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>✨ Create a New Event</h2>
          <div style={styles.formCard}>
            {!showForm ? (
              <button
                style={styles.toggleBtn}
                onClick={() => setShowForm(true)}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = 'none';
                }}
              >
                + Add New Event
              </button>
            ) : (
              <>
                <button
                  style={styles.toggleBtn}
                  onClick={() => setShowForm(false)}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'none';
                  }}
                >
                  ✕ Close
                </button>
                <EventForm onEventCreated={() => {
                  fetchEvents();
                  setShowForm(false);
                }} />
              </>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🎉 Your Events</h2>
          {events.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📭</div>
              <p style={styles.emptyStateText}>No events yet. Create your first event to get started!</p>
              <button
                style={styles.toggleBtn}
                onClick={() => setShowForm(true)}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'none';
                }}
              >
                Create Event
              </button>
            </div>
          ) : (
            <div style={styles.eventGrid}>
              {events.map(event => (
                <div
                  key={event._id}
                  style={styles.eventCard}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.eventCardHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                >
                  <h3 style={styles.eventTitle}>🎊 {event.name}</h3>
                  <p style={styles.eventInfo}>
                    📅 <strong>{new Date(event.date).toLocaleDateString()}</strong>
                  </p>
                  <p style={styles.eventInfo}>
                    📍 {event.location}
                  </p>
                  {event.description && (
                    <p style={styles.eventInfo}>
                      📝 {event.description.substring(0, 60)}...
                    </p>
                  )}
                  <a style={styles.eventLink}>View Details →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;