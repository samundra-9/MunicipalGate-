import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createBooking } from "../api/bookings";
import { fetchSlots } from "../api/resources";
import { requestSlot } from "../api/bookings";

export default function ResourceDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [slots, setSlots] = useState([]);

  const [resource, setResource] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`http://localhost:5000/api/resources`);
      const data = await res.json();
      const found = data.find((r) => r.id === Number(id));
      setResource(found);

      if (found?.bookingMode === "SLOT") {
        const slots = await fetchSlots(id);
        setSlots(slots);
      }
    }

    load();
  }, [id]);

  async function handleSlotBooking(slotId) {
    try {
      await requestSlot(token, slotId);
      setMessage("Slot booking request submitted");
    } catch (e) {
      setMessage(e.message);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();

    try {
      await createBooking(token, {
        resourceId: Number(id),
        startTime,
        endTime,
      });
      setMessage("Booking request submitted");
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!resource) return <p>Loading…</p>;

  return (
    <div>
      <h2>{resource.title}</h2>
      <p>{resource.description}</p>

      {user?.role === "USER" && resource.bookingMode === "REQUEST" && (
        <form onSubmit={handleBooking}>
          <h3>Request Booking</h3>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <button>Submit</button>
        </form>
      )}

      {user?.role === "USER" && resource.bookingMode === "SLOT" && (
        <div>
          <h3>Available Slots</h3>

          {slots.length === 0 && <p>No slots available.</p>}

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{new Date(slot.startTime).toLocaleString()}</td>
                  <td>{new Date(slot.endTime).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleSlotBooking(slot.id)}>
                      Request Slot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
