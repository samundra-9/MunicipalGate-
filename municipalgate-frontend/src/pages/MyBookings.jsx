import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchMyBookings } from "../api/bookings";

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyBookings(token)
      .then(setBookings)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.length === 0 && (
        <p>You have no bookings.</p>
      )}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.resource.title}</td>
              <td>
                {new Date(b.startTime).toLocaleString()} –{" "}
                {new Date(b.endTime).toLocaleString()}
              </td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
