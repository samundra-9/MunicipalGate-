export async function fetchPublicResources() {
  const res = await fetch("http://localhost:5000/api/resources");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch resources");
  }

  return data;
};

export async function fetchSlots(resourceId) {
  const res = await fetch(
    `http://localhost:5000/api/resources/${resourceId}/slots`
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export async function createResource(token, payload) {
  const res = await fetch(
    "http://localhost:5000/api/resources",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
export async function submitResource(token, resourceId) {
  const res = await fetch(
    `http://localhost:5000/api/resources/${resourceId}/submit`,
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
export async function updateResource(token, resourceId, payload) {
  const res = await fetch(
    `http://localhost:5000/api/resources/${resourceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}


