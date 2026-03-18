import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Home</Link>

      {!user && (
        <>
          {" | "}
          <Link to="/login">Login</Link>
        </>
      )}

      {user?.role === "USER" && (
        <>
          {" | "}
          <Link to="/bookings">My Bookings</Link>
        </>
      )}

      {user?.role === "MUNICIPAL_ADMIN" && (
        <>
          {" | "}
          <Link to="/municipal/bookings">Pending Bookings</Link>
          {" | "}
          <Link to="/municipal/resources/new">Create Resource</Link>
          {" | "}
          <Link to="/municipal/resources">My Resources</Link>
        </>
      )}

      {user?.role === "CENTRAL_ADMIN" && (
        <>
          {" | "}
          <Link to="/central/resources">Pending Resources</Link>
        </>
      )}

      {(user?.role === "CENTRAL_ADMIN" || user?.role === "MUNICIPAL_ADMIN") && (
        <>
          {" | "}
          <Link to="/admin/activity">Activity Logs</Link>
        </>
      )}

      {user && (
        <>
          {" | "}
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
}
