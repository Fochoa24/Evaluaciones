import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard de rutas: redirige a /login si no hay sesión y muestra
 * aviso de permisos si el rol no está en la lista `roles`.
 * @param {{roles?: string[], children: React.ReactNode}} props
 */
export default function ProtectedRoute({ roles, children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (roles && !roles.includes(user.rol)) {
        return (
            <main className="seccion">
                <p className="mensaje error visible" role="alert">
                    No tienes permisos para acceder a esta sección.
                </p>
            </main>
        );
    }

    return children;
}
