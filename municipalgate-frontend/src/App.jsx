import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import PublicResources from "./pages/PublicResources";
import MyBookings from "./pages/MyBookings";
import PendingBookings from "./pages/municipal/PendingBookings";
import PendingResources from "./pages/central/PendingResources";
import ProtectedRoute from "./auth/ProtectedRoute";
import ResourceDetail from "./pages/ResourceDetail";
import ResourceForm from "./pages/municipal/ResourceForm";
import MyResources from "./pages/municipal/MyResources";
import EditResourceWrapper from "./pages/municipal/EditResource";
import ActivityLogs from "./pages/admin/ActivityLogs";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicResources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/resources/:id" element={<ResourceDetail />} />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute role="USER">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/municipal/resources/new"
            element={
              <ProtectedRoute role="MUNICIPAL_ADMIN">
                <ResourceForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/municipal/bookings"
            element={
              <ProtectedRoute role="MUNICIPAL_ADMIN">
                <PendingBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/municipal/resources"
            element={
              <ProtectedRoute role="MUNICIPAL_ADMIN">
                <MyResources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/central/resources"
            element={
              <ProtectedRoute role="CENTRAL_ADMIN">
                <PendingResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/municipal/resources/:id/edit"
            element={
              <ProtectedRoute role="MUNICIPAL_ADMIN">
                <EditResourceWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
