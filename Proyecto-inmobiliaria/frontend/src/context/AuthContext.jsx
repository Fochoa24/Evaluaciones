import { createContext, useContext, useState } from 'react';
import { eliminar, guardar, leer } from '../services/storage';

/**
 * Contexto de autenticación y usuarios demo.
 * Expone la sesión actual (`user`), el listado de usuarios y las
 * operaciones login / registrar / logout. La sesión se guarda en
 * localStorage (`gi_sesion`) sin el password.
 */
const AuthContext = createContext(null);

const usuariosSemilla = [
    {
        id: 1,
        usuario: 'admin',
        nombre: 'Administrador',
        email: 'admin@inmobiliaria.cl',
        password: 'admin123',
        telefono: '',
        rol: 'admin'
    },
    {
        id: 2,
        usuario: 'ejecutivo',
        nombre: 'Ejecutivo Inmobiliario',
        email: 'ejecutivo@inmobiliaria.cl',
        password: 'ejecutivo123',
        telefono: '',
        rol: 'ejecutivo'
    },
    {
        id: 3,
        usuario: 'propietario',
        nombre: 'Propietario Demo',
        email: 'propietario@inmobiliaria.cl',
        password: 'propietario123',
        telefono: '',
        rol: 'propietario'
    },
    {
        id: 4,
        usuario: 'cliente',
        nombre: 'Cliente Demo',
        email: 'cliente@inmobiliaria.cl',
        password: 'cliente123',
        telefono: '',
        rol: 'cliente'
    }
];

/**
 * Devuelve el usuario sin password para persistir la sesión.
 * @param {object|null} usuario - Usuario completo o null.
 * @returns {object|null} Copia sin `password`.
 */
function sinPassword(usuario) {
    if (!usuario) {
        return null;
    }
    const { password, ...resto } = usuario;
    return resto;
}

export function AuthProvider({ children }) {
    const [usuarios, setUsuarios] = useState(() => {
        const guardados = leer('usuarios', null);
        if (guardados) {
            return guardados;
        }
        guardar('usuarios', usuariosSemilla);
        return usuariosSemilla;
    });

    const [user, setUser] = useState(() => {
        const sesion = leer('sesion', null);
        if (!sesion) {
            return null;
        }
        const completo = usuarios.find((item) => item.id === sesion.id);
        return sinPassword(completo || sesion);
    });

    const iniciarSesion = (usuario) => {
        const sesion = sinPassword(usuario);
        guardar('sesion', sesion);
        setUser(sesion);
    };

    /**
     * Valida credenciales y perfil; inicia sesión si coinciden.
     * @param {{usuario: string, password: string, perfil: string}} credenciales
     * @returns {{ok: boolean, mensaje: string}}
     */
    const login = ({ usuario, password, perfil }) => {
        if (!usuario || !password || !perfil) {
            return { ok: false, mensaje: 'Completa todos los campos antes de ingresar.' };
        }

        const normalizado = usuario.trim().toLowerCase();
        const encontrado = usuarios.find((item) => {
            return (
                normalizado === item.usuario.toLowerCase() ||
                normalizado === item.email.toLowerCase()
            );
        });

        if (!encontrado) {
            return {
                ok: false,
                mensaje: 'Usuario no registrado. Prueba con admin, cliente, ejecutivo o propietario.'
            };
        }

        if (password.trim() !== encontrado.password) {
            return { ok: false, mensaje: 'La contraseña ingresada es incorrecta.' };
        }

        if (perfil !== encontrado.rol) {
            return {
                ok: false,
                mensaje: 'El perfil seleccionado no coincide con el usuario ingresado.'
            };
        }

        iniciarSesion(encontrado);
        return { ok: true, mensaje: `Bienvenido ${encontrado.usuario}. Redirigiendo al panel...` };
    };

    /**
     * Crea una cuenta, la guarda e inicia sesión automáticamente.
     * @param {{nombre: string, usuario: string, email: string, password: string, telefono?: string, rol?: string}} datos
     * @returns {{ok: boolean, mensaje: string}}
     */
    const registrar = ({ nombre, usuario, email, password, telefono, rol }) => {
        if (!nombre || !usuario || !email || !password) {
            return { ok: false, mensaje: 'Completa todos los campos obligatorios.' };
        }

        if (password.length < 6) {
            return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        const usuarioNormalizado = usuario.trim().toLowerCase();
        const emailNormalizado = email.trim().toLowerCase();

        const existe = usuarios.some((item) => {
            return (
                item.usuario.toLowerCase() === usuarioNormalizado ||
                item.email.toLowerCase() === emailNormalizado
            );
        });

        if (existe) {
            return { ok: false, mensaje: 'Ese usuario o correo ya está registrado.' };
        }

        const nuevo = {
            id: usuarios.reduce((max, item) => Math.max(max, item.id), 0) + 1,
            usuario: usuario.trim(),
            nombre: nombre.trim(),
            email: emailNormalizado,
            password,
            telefono: telefono?.trim() || '',
            rol: rol || 'cliente'
        };

        const lista = [...usuarios, nuevo];
        setUsuarios(lista);
        guardar('usuarios', lista);
        iniciarSesion(nuevo);

        return { ok: true, mensaje: `Cuenta creada. Bienvenido ${nuevo.usuario}.` };
    };

    const logout = () => {
        eliminar('sesion');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, usuarios, login, registrar, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
