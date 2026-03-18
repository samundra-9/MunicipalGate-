const API_URL = "http://localhost:5001/api";
export async function fetchPendingBookings(token) {
  const res = await fetch(
    `${API_URL}/admin/bookings/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function approveBooking(token, bookingId) {
  const res = await fetch(
    `${API_URL}/bookings/${bookingId}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function rejectBooking(token, bookingId, reason) {
  const res = await fetch(
    `${API_URL}/bookings/${bookingId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export async function fetchPendingResources(token) {
  const res = await fetch(
    `${API_URL}/admin/resources/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function publishResource(token, resourceId) {
  const res = await fetch(
    `${API_URL}/resources/${resourceId}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

