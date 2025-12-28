import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchPendingBookings,
  approveBooking,
  rejectBooking
} from "../../api/admin";

export default function PendingBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");



  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPendingBookings(token);
        setBookings(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  async function handleApprove(id) {
    await approveBooking(token, id);
    setBookings(b => b.filter(x => x.id !== id));
  }

  async function handleReject(id) {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;

    await rejectBooking(token, id, reason);
    setBookings(b => b.filter(x => x.id !== id));
  }

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Pending Booking Requests</h2>

      {bookings.length === 0 && <p>No pending bookings.</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Resource</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.user.email}</td>
              <td>{b.resource.title}</td>
              <td>
                {new Date(b.startTime).toLocaleString()} –{" "}
                {new Date(b.endTime).toLocaleString()}
              </td>
              <td>
                <button onClick={() => handleApprove(b.id)}>
                  Approve
                </button>
                <button onClick={() => handleReject(b.id)}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
