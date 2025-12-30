import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  createResource,
  updateResource,
  addResourceMedia,
  deleteResourceMedia
} from "../../api/resources";

export default function ResourceForm({ existing }) {
  const { token } = useAuth();

  const [form, setForm] = useState(
    existing || {
      title: "",
      description: "",
      category: "",
      resourceType: "",
      bookingMode: "REQUEST",
      capacity: ""
    }
  );

  const [message, setMessage] = useState("");

  // media state (only for edit / draft)
  const [mediaType, setMediaType] = useState("IMAGE");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaList, setMediaList] = useState(existing?.media || []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (existing) {
        await updateResource(token, existing.id, form);
        setMessage("Draft updated");
      } else {
        await createResource(token, form);
        setMessage("Resource created as DRAFT");
      }
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleAddMedia() {
    if (!mediaUrl) return;

    try {
      const media = await addResourceMedia(token, existing.id, {
        type: mediaType,
        url: mediaUrl
      });

      setMediaList([...mediaList, media]);
      setMediaUrl("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteMedia(mediaId) {
    try {
      await deleteResourceMedia(token, mediaId);
      setMediaList(mediaList.filter(m => m.id !== mediaId));
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h2>{existing ? "Edit Resource (Draft)" : "Create Resource"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          name="resourceType"
          placeholder="Resource Type"
          value={form.resourceType}
          onChange={handleChange}
          required
        />

        <select
          name="bookingMode"
          value={form.bookingMode}
          onChange={handleChange}
        >
          <option value="REQUEST">Request Based</option>
          <option value="SLOT">Slot Based</option>
        </select>

        <input
          name="capacity"
          type="number"
          placeholder="Capacity (optional)"
          value={form.capacity || ""}
          onChange={handleChange}
        />

        <button type="submit">
          {existing ? "Update Draft" : "Create"}
        </button>
      </form>

      {/* MEDIA SECTION — ONLY FOR DRAFT EDIT */}
      {existing && (
        <div style={{ marginTop: "20px" }}>
          <h3>Media (Draft only)</h3>

          <select
            value={mediaType}
            onChange={e => setMediaType(e.target.value)}
          >
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>

          <input
            placeholder="Media URL"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
          />

          <button type="button" onClick={handleAddMedia}>
            Add Media
          </button>

          {mediaList.length > 0 && (
            <ul>
              {mediaList.map(m => (
                <li key={m.id}>
                  {m.type} —{" "}
                  <a href={m.url} target="_blank" rel="noreferrer">
                    {m.url}
                  </a>{" "}
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(m.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
