import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createBooking } from "../api/bookings";
import { fetchSlots, fetchResourceById } from "../api/resources";
import { requestSlot } from "../api/bookings";

// Use environment variable with fallback
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      try {
        setLoading(true);
        setMessage({ type: "", text: "" });
        
        // Fetch specific resource by ID (not all resources)
        const found = await fetchResourceById(id);
        
        if (!mounted) return;
        
        // Handle 404 or unauthorized access
        if (!found) {
          setMessage({ type: "error", text: "Resource not found or not accessible" });
          setLoading(false);
          return;
        }
        
        setResource(found);

        // Fetch slots only for SLOT-based booking mode
        if (found?.bookingMode === "SLOT" && found?.status === "PUBLISHED") {
          const availableSlots = await fetchSlots(id);
          if (mounted) setSlots(availableSlots || []);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load resource:", err);
          setMessage({ 
            type: "error", 
            text: err.message || "Failed to load resource details" 
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  // Auto-clear success messages after 4 seconds
  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Validation: end time must be after start time
  function validateBookingTimes() {
    if (!startTime || !endTime) {
      return "Please select both start and end times";
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return "End time must be after start time";
    }
    return null;
  }

  async function handleSlotBooking(slotId) {
    if (!token) {
      setMessage({ type: "error", text: "Please log in to book this slot" });
      return;
    }
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      
      await requestSlot(token, slotId);
      setMessage({ 
        type: "success", 
        text: "✓ Slot booking request submitted! Check 'My Bookings' for status." 
      });
    } catch (e) {
      console.error("Slot booking failed:", e);
      setMessage({ 
        type: "error", 
        text: e.message || "Failed to submit slot request. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();
    
    if (!token) {
      setMessage({ type: "error", text: "Please log in to request a booking" });
      return;
    }
    
    const validationError = validateBookingTimes();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      
      await createBooking(token, {
        resourceId: Number(id),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      
      setMessage({ 
        type: "success", 
        text: "✓ Booking request submitted! Awaiting municipal admin approval." 
      });
      
      // Reset form on success
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error("Booking request failed:", err);
      setMessage({ 
        type: "error", 
        text: err.message || "Failed to submit booking request. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Helper: Format status with visual indicator
  function StatusBadge({ status }) {
    const styles = {
      PUBLISHED: "background:#22c55e;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600",
      PENDING_APPROVAL: "background:#f59e0b;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600",
      DRAFT: "background:#6b7280;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600",
      UNAVAILABLE: "background:#ef4444;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600",
      ARCHIVED: "background:#9ca3af;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600",
    };
    return (
      <span style={styles[status] || styles.DRAFT}>
        {status?.replace("_", " ")}
      </span>
    );
  }

  // Helper: Message alert component
  function MessageAlert({ message }) {
    if (!message?.text) return null;
    const styles = {
      success: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
      error: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
      info: { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
    };
    return (
      <div style={{
        ...styles[message.type],
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontSize: "14px"
      }}>
        {message.text}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
        <p>Loading resource details…</p>
      </div>
    );
  }

  // Error / Not found state
  if (!resource) {
    return (
      <div style={{ padding: "24px" }}>
        <MessageAlert message={{ type: "error", text: "Resource not found or not accessible" }} />
        <button onClick={() => navigate("/resources")} style={{ padding: "8px 16px" }}>
          ← Back to Resources
        </button>
      </div>
    );
  }

  // Resource not published - show read-only view
  const isPublished = resource.status === "PUBLISHED";
  const canBook = user?.role === "USER" && isPublished;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <MessageAlert message={message} />
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>{resource.title}</h1>
        <StatusBadge status={resource.status} />
      </div>
      
      {/* Media Gallery */}
      {resource.media?.length > 0 && (
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {resource.media.map((m) => (
            <img
              key={m.id}
              src={m.url}
              alt={m.caption || resource.title}
              style={{ 
                width: "120px", 
                height: "80px", 
                objectFit: "cover", 
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ))}
        </div>
      )}
      
      {/* Description */}
      <p style={{ color: "#374151", lineHeight: "1.6", marginBottom: "24px" }}>
        {resource.description}
      </p>
      
      {/* Meta Info */}
      <div style={{ 
        background: "#f9fafb", 
        padding: "16px", 
        borderRadius: "8px", 
        marginBottom: "24px",
        fontSize: "14px",
        color: "#4b5563"
      }}>
        <p><strong>Location:</strong> {resource.municipality?.name || "N/A"}</p>
        <p><strong>Capacity:</strong> {resource.capacity || "Not specified"}</p>
        <p><strong>Booking Mode:</strong> {resource.bookingMode === "SLOT" ? "Pre-defined Slots" : "Request-based"}</p>
        {resource.availability?.hours && (
          <p><strong>Available Hours:</strong> {resource.availability.hours}</p>
        )}
      </div>

      {/* Booking Section - Only for published resources */}
      {canBook && resource.bookingMode === "REQUEST" && (
        <div style={{ 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px", 
          padding: "20px",
          background: "#fff"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Request Booking</h3>
          <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={submitting}
                min={new Date().toISOString().slice(0, 16)}
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  borderRadius: "6px", 
                  border: "1px solid #d1d5db",
                  fontSize: "14px"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                End Time *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={submitting}
                min={startTime || new Date().toISOString().slice(0, 16)}
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  borderRadius: "6px", 
                  border: "1px solid #d1d5db",
                  fontSize: "14px"
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                background: submitting ? "#9ca3af" : "#3b82f6",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                marginTop: "8px"
              }}
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {canBook && resource.bookingMode === "SLOT" && (
        <div style={{ 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px", 
          padding: "20px",
          background: "#fff"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Available Time Slots</h3>
          
          {slots.length === 0 ? (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>No slots currently available.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                    <th style={{ padding: "12px 8px" }}>Start</th>
                    <th style={{ padding: "12px 8px" }}>End</th>
                    <th style={{ padding: "12px 8px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 8px" }}>
                        {new Date(slot.startTime).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        {new Date(slot.endTime).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button 
                          onClick={() => handleSlotBooking(slot.id)}
                          disabled={submitting}
                          style={{
                            background: submitting ? "#9ca3af" : "#10b981",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            fontWeight: "500",
                            cursor: submitting ? "not-allowed" : "pointer",
                            fontSize: "13px"
                          }}
                        >
                          {submitting ? "…" : "Book"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Non-USER or Unpublished resource messaging */}
      {!canBook && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #fcd34d", 
          borderRadius: "8px", 
          padding: "16px",
          fontSize: "14px",
          color: "#92400e"
        }}>
          {resource.status !== "PUBLISHED" 
            ? "This resource is not yet available for booking." 
            : user?.role !== "USER"
              ? `Log in as a USER to book this resource. (Current role: ${user?.role})`
              : "Please log in to book this resource."
          }
        </div>
      )}

      {/* Back button */}
      <div style={{ marginTop: "32px" }}>
        <button 
          onClick={() => navigate("/resources")}
          style={{ 
            background: "transparent",
            color: "#3b82f6",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          ← Back to all resources
        </button>
      </div>
    </div>
  );
}