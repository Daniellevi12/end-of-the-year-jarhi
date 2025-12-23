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

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <header style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        {!user && (
          <>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/register"><button>Register</button></Link>
          </>
        )}
        {user && (
          <>
            <Link to="/dashboard"><button>Dashboard</button></Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </header>

      <h1>Welcome to Your Event Manager</h1>
      <p>Manage events, guests, tasks, expenses, and items easily!</p>
    </div>
  );
}

export default Welcome;
