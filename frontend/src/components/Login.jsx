import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const backToWelcome = () => navigate("/");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      padding: "50px 40px",
      width: "100%",
      maxWidth: "400px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "30px",
      color: "#333",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#555",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    inputFocus: {
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
    submitBtn: {
      width: "100%",
      padding: "12px",
      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
    },
    error: {
      color: "#f44336",
      fontSize: "14px",
      marginTop: "15px",
      textAlign: "center",
      padding: "10px",
      backgroundColor: "#ffebee",
      borderRadius: "6px",
      border: "1px solid #f44336",
    },
    link: {
      textAlign: "center",
      marginTop: "20px",
      color: "#666",
      fontSize: "14px",
    },
    linkText: {
      color: "#667eea",
      textDecoration: "none",
      fontWeight: "600",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={backToWelcome}
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
        ← Back
      </button>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
              style={styles.input}
              required
              placeholder="Enter your email"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
              style={styles.input}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button
            type="submit"
            style={styles.submitBtn}
            onMouseEnter={(e) => {
              e.target.style.background = "#667eea";
              e.target.style.opacity = "0.85";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              e.target.style.opacity = "1";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Login
          </button>
        </form>
        <div style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.linkText}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
