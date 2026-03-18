import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await registerUser(form);
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      
      <input 
        type="text" 
        placeholder="Full name"
        value={form.name}
        onChange={e => setForm({...form, name: e.target.value})}
        required
      />
      <input 
        type="email" 
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({...form, email: e.target.value})}
        required
      />
      <input 
        type="password" 
        placeholder="Password (min 8 chars)"
        value={form.password}
        onChange={e => setForm({...form, password: e.target.value})}
        minLength={8}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}