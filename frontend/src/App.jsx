import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Welcome from "./components/pages/Welcome";
import EventForm from "./components/EventForm";
import axios from "axios";

// --- DYNAMIC IP CONFIGURATION ---
// window.location.hostname automatically gets the IP in the browser address bar.
const currentHostname = window.location.hostname;
axios.defaults.baseURL = `http://${currentHostname}:5000`;
// --------------------------------

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const { user, isLoading } = useContext(AuthContext) || {};
  
  // While loading, show a loading screen
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#636e72' }}>
        Loading...
      </div>
    );
  }
  
  // If user is not logged in after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/create-event" element={<ProtectedRoute element={<EventForm />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;