import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext); // <- MUST include logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to welcome
  };

  if (!user) return <p>You are not logged in.</p>;

  return (
    <div>
      <h2>Welcome, {user.name || "User"}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
