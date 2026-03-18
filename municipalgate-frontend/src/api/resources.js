const API_URL  = import.meta.env?.VITE_API_URL || "http://localhost:5001/api";
export async function fetchPublicResources() {
  const res = await fetch(`${API_URL}/resources`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch resources");
  }

  return data;
};


export async function createResource(token, payload) {
  const res = await fetch(
    `${API_URL}/resources`,
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
    `${API_URL}/resources/${resourceId}/submit`,
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
    `${API_URL}/resources/${resourceId}`,
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
export async function addResourceMedia(token, resourceId, payload) {
  const res = await fetch(
    `${API_URL}/resources/${resourceId}/media`,
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
}

export async function deleteResourceMedia(token, mediaId) {
  await fetch(
    `${API_URL}/resources/media/${mediaId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}

export async function fetchResourceById(id) {
  const res = await fetch(`${API_URL}/resources/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch resource");
  }
  return res.json();
}

export async function fetchSlots(resourceId) {
  const res = await fetch(`${API_URL}/resources/${resourceId}/slots`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch slots");
  }
  return res.json();
}

