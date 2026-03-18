export async function fetchAuditLogs(token) {
  const res = await fetch(
    "http://localhost:5000/api/audit/logs",
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
