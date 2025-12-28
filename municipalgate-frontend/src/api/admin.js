export async function fetchPendingBookings(token) {
  const res = await fetch(
    "http://localhost:5000/api/admin/bookings/pending",
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
    `http://localhost:5000/api/bookings/${bookingId}/approve`,
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
    `http://localhost:5000/api/bookings/${bookingId}/reject`,
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
    "http://localhost:5000/api/admin/resources/pending",
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
    `http://localhost:5000/api/resources/${resourceId}/publish`,
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

