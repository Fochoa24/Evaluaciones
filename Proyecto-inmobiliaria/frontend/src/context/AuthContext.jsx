import { createContext, useContext, useEffect, useState } from 'react';
import { api, resultado } from '../services/api';
import { eliminar, guardar, leer } from '../services/storage';

/**
 * Sesión contra la API (/api/auth). Guarda el JWT en `gi_token` y una copia
 * del usuario en `gi_sesion` para no parpadear al recargar; al montar se
 * refresca con /api/auth/yo, que refleja bajas o cambios de estado.
 */
const AuthContext = createContext(null);

// Restos de la versión local (antes de la API): cuentas con contraseña en texto
// plano y copias de datos de negocio. Hoy solo se guarda la sesión.
['usuarios', 'propiedades', 'propietarios', 'visitas', 'arriendos', 'version_datos'].forEach((clave) =>
    eliminar(clave)
);

function borrarSesion() {
    eliminar('token');
    eliminar('sesion');
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => (leer('token') ? leer('sesion', null) : null));

    /** Relee el usuario desde /api/auth/yo (al montar y tras editar el perfil). */
    const refrescarSesion = () =>
        api('/api/auth/yo')
            .then((datos) => {
                guardar('sesion', datos);
                setUser(datos);
            })
            .catch((error) => {
                // Sin conexión se conserva la sesión; token vencido o cuenta bloqueada la cierran.
                if (error.status === 401 || error.status === 403) {
                    borrarSesion();
                    setUser(null);
                }
            });

    useEffect(() => {
        if (leer('token')) {
            refrescarSesion();
        } else {
            eliminar('sesion');
        }
    }, []);

    /**
     * @param {{usuario: string, password: string, perfil: string}} credenciales
     * @returns {Promise<{ok: boolean, mensaje: string, codigo?: string}>}
     */
    const login = async (credenciales) => {
        const r = await resultado(api('/api/auth/login', { method: 'POST', body: credenciales }));
        if (!r.ok) {
            return r;
        }
        const { token, user: usuario } = r.datos;
        guardar('token', token);
        guardar('sesion', usuario);
        setUser(usuario);
        const siguiente =
            usuario.estado === 'Activo' ? 'Redirigiendo al panel...' : 'Tu cuenta aún está en verificación.';
        return { ok: true, mensaje: `Bienvenido ${usuario.usuario}. ${siguiente}` };
    };

    /**
     * Crea la cuenta en estado Pendiente; no inicia sesión (falta activar el correo).
     * @param {{nombre: string, usuario: string, email: string, rut: string, password: string, telefono?: string, rol?: string}} datos
     */
    const registrar = ({ nombre, usuario, email, rut, password, telefono, rol }) =>
        resultado(
            api('/api/auth/registro', {
                method: 'POST',
                body: { nombre, usuario, email, rut, password, telefono, rol }
            })
        );

    /** @param {string} token - Token del enlace de activación. */
    const verificarCorreo = (token) =>
        resultado(api('/api/auth/verificar', { method: 'POST', body: { token } }));

    /** @param {string} usuario - Usuario o correo de la cuenta pendiente. */
    const reenviarActivacion = (usuario) =>
        resultado(api('/api/auth/reenviar-verificacion', { method: 'POST', body: { usuario } }));

    const logout = () => {
        borrarSesion();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, login, registrar, verificarCorreo, reenviarActivacion, refrescarSesion, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
