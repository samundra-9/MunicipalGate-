import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchAuditLogs } from "../../api/audit";

export default function ActivityLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuditLogs(token)
      .then(setLogs)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Activity Logs</h2>

      {logs.length === 0 && <p>No activity recorded.</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.actorEmail || log.actorId}</td>
              <td>{log.action}</td>
              <td>{log.entityType}</td>
              <td>{log.entityId}</td>
              <td>
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
