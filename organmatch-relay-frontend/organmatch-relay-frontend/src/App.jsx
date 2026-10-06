import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ThemeEffectsBridge } from './components/common/ThemeEffectsBridge';
import { ROLES, ROLE_DASHBOARD_PATH } from './utils/roleConfig';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import RegisterRoleSelect from './pages/auth/RegisterRoleSelect';
import RegisterForm from './pages/auth/RegisterForm';

import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import HospitalAdminDashboard from './pages/hospitalAdmin/HospitalAdminDashboard';
import DonorCoordinatorDashboard from './pages/donorCoordinator/DonorCoordinatorDashboard';
import AmbulanceDashboard from './pages/ambulance/AmbulanceDashboard';
import PoliceDashboard from './pages/police/PoliceDashboard';
import SystemAdminDashboard from './pages/systemAdmin/SystemAdminDashboard';

import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

function HomeOrRedirect() {
  const { currentUser, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROLE_DASHBOARD_PATH[currentUser.role]} replace />;
  return <Home />;
}

export default function App() {
  return (
    <>
      <ThemeEffectsBridge />
      <Routes>
        <Route path="/" element={<HomeOrRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterRoleSelect />} />
      <Route path="/register/:role" element={<RegisterForm />} />

      {/* Role-specific dashboards — each locked to exactly one role */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><DoctorDashboard /></ProtectedRoute>
      } />
      <Route path="/hospital-admin" element={
        <ProtectedRoute allowedRoles={[ROLES.HOSPITAL_ADMIN]}><HospitalAdminDashboard /></ProtectedRoute>
      } />
      <Route path="/donor-coordinator" element={
        <ProtectedRoute allowedRoles={[ROLES.DONOR_COORDINATOR]}><DonorCoordinatorDashboard /></ProtectedRoute>
      } />
      <Route path="/ambulance" element={
        <ProtectedRoute allowedRoles={[ROLES.AMBULANCE]}><AmbulanceDashboard /></ProtectedRoute>
      } />
      <Route path="/police" element={
        <ProtectedRoute allowedRoles={[ROLES.POLICE]}><PoliceDashboard /></ProtectedRoute>
      } />
      <Route path="/system-admin" element={
        <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}><SystemAdminDashboard /></ProtectedRoute>
      } />

      {/* Shared, accessible by any logged-in role — but always operates on the
          currently logged-in user's OWN data only (enforced in Profile.jsx) */}
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={Object.values(ROLES)}><Settings /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={Object.values(ROLES)}><Profile /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
