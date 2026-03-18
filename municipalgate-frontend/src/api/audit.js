
const API_URL = "http://localhost:5001/api";


export async function fetchAuditLogs(token) {
  const res = await fetch(
    `${API_URL}/audit/logs`,
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
