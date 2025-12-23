import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // <- use relative path

function Welcome() {
  const { user, logout } = useContext(AuthContext) || {}; // <- include logout
  

  const handleLogout = () => {
    logout();
    // optionally redirect after logout
    window.location.href = "/"; // simple reload to reset state
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      position: "absolute",
      top: "20px",
      right: "30px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    loginRegisterBtn: {
      backgroundColor: "white",
      color: "#667eea",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
    dashboardBtn: {
      backgroundColor: "#4CAF50",
      color: "white",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
    logoutBtn: {
      backgroundColor: "#f44336",
      color: "white",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
    },
    content: {
      textAlign: "center",
      color: "white",
      maxWidth: "600px",
    },
    title: {
      fontSize: "56px",
      fontWeight: "700",
      marginBottom: "20px",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
    },
    subtitle: {
      fontSize: "24px",
      marginBottom: "40px",
      opacity: 0.95,
      lineHeight: "1.6",
    },
    features: {
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      marginTop: "50px",
      flexWrap: "wrap",
    },
    featureBox: {
      background: "rgba(255, 255, 255, 0.1)",
      padding: "20px 30px",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      minWidth: "150px",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        {!user && (
          <>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button
                style={{ ...styles.button, ...styles.loginRegisterBtn }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#667eea";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#667eea";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                Login
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                style={{ ...styles.button, ...styles.loginRegisterBtn }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#667eea";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#667eea";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                Register
              </button>
            </Link>
          </>
        )}
        {user && (
          <>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <button
                style={{ ...styles.button, ...styles.dashboardBtn }}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, { transform: "none" })}
              >
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{ ...styles.button, ...styles.logoutBtn }}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { transform: "none" })}
            >
              Logout
            </button>
          </>
        )}
      </header>

      <div style={styles.content}>
        <h1 style={styles.title}>📅 Event Manager</h1>
        {user && <h2 style={{ ...styles.subtitle, fontSize: "20px", marginBottom: "30px", fontWeight: "600" }}>Welcome back, <span style={{ color: "#FFD700" }}>{user.name}</span>! 👋</h2>}
        <p style={styles.subtitle}>
          Manage events, guests, tasks, expenses, and items easily in one place!
        </p>

        <div style={styles.features}>
          <div style={styles.featureBox}>
            <div style={styles.featureTitle}>🎉 Events</div>
            <p>Create & manage events</p>
          </div>
          <div style={styles.featureBox}>
            <div style={styles.featureTitle}>👥 Guests</div>
            <p>Track attendees</p>
          </div>
          <div style={styles.featureBox}>
            <div style={styles.featureTitle}>✅ Tasks</div>
            <p>Organize tasks</p>
          </div>
          <div style={styles.featureBox}>
            <div style={styles.featureTitle}>💰 Expenses</div>
            <p>Budget tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
