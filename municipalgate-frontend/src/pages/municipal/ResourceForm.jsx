import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { createResource } from "../../api/resources";

export default function ResourceForm() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    resourceType: "",
    bookingMode: "REQUEST",
    capacity: ""
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await createResource(token, {
        ...form,
        capacity: form.capacity
          ? Number(form.capacity)
          : null
      });

      setMessage("Resource created as DRAFT");
      setForm({
        title: "",
        description: "",
        category: "",
        resourceType: "",
        bookingMode: "REQUEST",
        capacity: ""
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h2>Create Resource</h2>

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
          value={form.capacity}
          onChange={handleChange}
        />

        <button>Create</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
