import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { submitResource } from "../../api/resources";

// const { Link } = require("react-router-dom");
const API_URL = "http://localhost:5001/api";
export default function MyResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/resources/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setResources(data);
      });
  }, [token]);

  async function handleSubmit(id) {
    await submitResource(token, id);
    setResources((r) =>
      r.map((x) => (x.id === id ? { ...x, status: "PENDING_APPROVAL" } : x))
    );
  }

  return (
    <div>
      <h2>My Resources</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {resources.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.status}</td>
              <td>
                {r.status === "DRAFT" && (
                  <div>
                    <button onClick={() => handleSubmit(r.id)}>
                      Submit for Approval
                    </button>
                    <Link to={`/municipal/resources/${r.id}/edit`}>Edit</Link>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
