import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import ResourceForm from "./ResourceForm";
const API_URL = "http://localhost:5001/api";
export default function EditResource() {
  const { id } = useParams();
  const { token } = useAuth();
  const [resource, setResource] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(list => {
        const found = list.find(r => r.id === Number(id));
        if (!found) throw new Error("Resource not found");
        setResource(found);
      })
      .catch(err => setError(err.message));
  }, [id, token]);

  if (error) return <p>{error}</p>;
  if (!resource) return <p>Loading…</p>;

  return <ResourceForm existing={resource} />;
}
