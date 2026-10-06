import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_PATH } from '../../utils/roleConfig';

// Wraps a role-specific dashboard route. If the person isn't logged in,
// send them to /login. If they ARE logged in but under a different role,
// redirect to THEIR OWN dashboard rather than showing an error — this is
// what physically prevents a Patient from ever reaching e.g. /system-admin.
export function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const ownPath = ROLE_DASHBOARD_PATH[currentUser.role] || '/login';
    return <Navigate to={ownPath} replace />;
  }

  return children;
}
