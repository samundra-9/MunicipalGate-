import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchPendingResources,
  publishResource
} from "../../api/admin";

export default function PendingResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingResources(token)
      .then(setResources)
      .catch(err => setError(err.message));
  }, [token]);

  async function handlePublish(id) {
    await publishResource(token, id);
    setResources(r => r.filter(x => x.id !== id));
  }

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Pending Resource Approvals</h2>

      {resources.length === 0 && (
        <p>No pending resources.</p>
      )}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.category}</td>
              <td>
                {r.municipality.name},{" "}
                {r.municipality.district.name},{" "}
                {r.municipality.district.province.name}
              </td>
              <td>{r.createdBy.email}</td>
              <td>
                <button onClick={() => handlePublish(r.id)}>
                  Publish
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
