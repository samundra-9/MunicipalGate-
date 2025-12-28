import { useEffect, useState } from "react";
import { fetchPublicResources } from "../api/resources";

export default function PublicResources() {
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPublicResources();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Loading resources…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (resources.length === 0) {
    return <p>No public resources available.</p>;
  }

  return (
    <div>
      <h2>Public Resources</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th>Municipality</th>
            <th>District</th>
            <th>Province</th>
            <th>Book</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.category}</td>
              <td>{r.resourceType}</td>
              <td>{r.municipality.name}</td>
              <td>{r.municipality.district.name}</td>
              <td>{r.municipality.district.province.name}</td>
              <td>
                <a href={`/resources/${r.id}`}>{r.title}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
