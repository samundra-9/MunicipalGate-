
const API_URL = "http://localhost:5001/api";


export async function createBooking(token, payload) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Booking failed");
  }

  return data;
};
export async function fetchMyBookings(token) {
  const res = await fetch(
    `${API_URL}/bookings/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export async function requestSlot(token, slotId) {
  const res = await fetch(
    `${API_URL}/bookings/slot`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ slotId })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}


