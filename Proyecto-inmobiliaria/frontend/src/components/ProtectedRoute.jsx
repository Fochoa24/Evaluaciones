import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard de rutas: redirige a /login si no hay sesión, muestra aviso
 * si la cuenta no está Activo y aviso de permisos si el rol no está
 * en la lista `roles`. Solo oculta: el backend vuelve a autorizar.
 * @param {{roles?: string[], cualquierEstado?: boolean, children: React.ReactNode}} props
 *   cualquierEstado: deja pasar cuentas en verificación (p. ej. Mi cuenta).
 */
export default function ProtectedRoute({ roles, cualquierEstado = false, children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Alta interna con contraseña temporal: primero debe cambiarla (§11).
    if (user.debeCambiarPassword && location.pathname !== '/cuenta') {
        return <Navigate to="/cuenta" replace />;
    }

    // Propietario con correo confirmado que aún no verifica un ejecutivo (D2).
    if (user.estado !== 'Activo' && !cualquierEstado) {
        return (
            <main className="seccion">
                <p className="mensaje sin-resultados visible" role="status">
                    Tu cuenta está en verificación. Un ejecutivo revisará tus datos y podrás
                    gestionar tus propiedades en cuanto la apruebe.
                </p>
            </main>
        );
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
