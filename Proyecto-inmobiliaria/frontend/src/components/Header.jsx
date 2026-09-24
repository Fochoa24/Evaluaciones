import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES_ATENCION, ROLES_EVALUAN, ROLES_GESTION } from '../data/roles';

const ETIQUETAS_ROL = {
    admin: 'Administrador',
    ejecutivo: 'Ejecutivo',
    propietario: 'Propietario',
    cliente: 'Cliente'
};

function obtenerIniciales(user) {
    const fuente = user.nombre || user.usuario || user.email || 'U';
    return fuente
        .trim()
        .split(/\s+/)
        .map((parte) => parte[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [usuarioAbierto, setUsuarioAbierto] = useState(false);
    const [conSombra, setConSombra] = useState(false);
    const usuarioRef = useRef(null);

    useEffect(() => {
        setMenuAbierto(false);
        setUsuarioAbierto(false);
    }, [location.pathname]);

    useEffect(() => {
        const alHacerScroll = () => setConSombra(window.scrollY > 8);
        alHacerScroll();
        window.addEventListener('scroll', alHacerScroll, { passive: true });
        return () => window.removeEventListener('scroll', alHacerScroll);
    }, []);

    useEffect(() => {
        const alClickearFuera = (event) => {
            if (usuarioRef.current && !usuarioRef.current.contains(event.target)) {
                setUsuarioAbierto(false);
            }
        };
        document.addEventListener('mousedown', alClickearFuera);
        return () => document.removeEventListener('mousedown', alClickearFuera);
    }, []);

    useEffect(() => {
        const alPresionarEscape = (event) => {
            if (event.key !== 'Escape') return;
            if (usuarioAbierto || menuAbierto) {
                setUsuarioAbierto(false);
                setMenuAbierto(false);
            }
        };
        document.addEventListener('keydown', alPresionarEscape);
        return () => document.removeEventListener('keydown', alPresionarEscape);
    }, [usuarioAbierto, menuAbierto]);

    const cerrarMenus = () => {
        setMenuAbierto(false);
        setUsuarioAbierto(false);
    };

    const handleLogout = () => {
        cerrarMenus();
        logout();
        navigate('/');
    };

    return (
        <header className={`encabezado${conSombra ? ' con-sombra' : ''}`}>
            <div className="encabezado-interno">
                <Link className="logo" to="/" onClick={cerrarMenus}>
                    <img
                        className="logo-imagen"
                        src="/logo/horizontal-dark.svg"
                        alt="Gestión Urbana"
                        width="140"
                        height="46"
                    />
                </Link>

                <button
                    type="button"
                    className="menu-toggle"
                    aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuAbierto}
                    aria-controls="nav-principal"
                    onClick={() => setMenuAbierto((valor) => !valor)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    id="nav-principal"
                    className={`nav-envoltura${menuAbierto ? ' abierta' : ''}`}
                >
                    <nav className="nav-principal" aria-label="Navegación principal">
                        <NavLink end to="/" onClick={cerrarMenus}>
                            Inicio
                        </NavLink>
                        <NavLink to="/propiedades" onClick={cerrarMenus}>
                            Propiedades
                        </NavLink>

                        {user ? (
                            <div className="usuario-menu" ref={usuarioRef}>
                                <button
                                    type="button"
                                    className="usuario-trigger"
                                    aria-haspopup="menu"
                                    aria-expanded={usuarioAbierto}
                                    onClick={() => setUsuarioAbierto((valor) => !valor)}
                                >
                                    <span className="avatar-nav" aria-hidden="true">
                                        {obtenerIniciales(user)}
                                    </span>
                                    <span className="usuario-datos">
                                        <strong>{user.usuario}</strong>
                                        <small>{ETIQUETAS_ROL[user.rol] || user.rol}</small>
                                    </span>
                                    <span className={`flecha-menu${usuarioAbierto ? ' arriba' : ''}`} aria-hidden="true">
                                        ▾
                                    </span>
                                </button>

                                {usuarioAbierto && (
                                    <div className="usuario-dropdown" role="menu">
                                        <div className="dropdown-cabecera">
                                            <span className="avatar-nav avatar-grande" aria-hidden="true">
                                                {obtenerIniciales(user)}
                                            </span>
                                            <div>
                                                <strong>{user.nombre}</strong>
                                                <small>{user.email}</small>
                                            </div>
                                        </div>

                                        <Link to="/dashboard" role="menuitem" onClick={cerrarMenus}>
                                            <span aria-hidden="true">📊</span> Panel administrativo
                                        </Link>
                                        {ROLES_GESTION.includes(user.rol) && (
                                            <Link to="/propiedades/nueva" role="menuitem" onClick={cerrarMenus}>
                                                <span aria-hidden="true">🏠</span> Nueva propiedad
                                            </Link>
                                        )}
                                        {ROLES_ATENCION.includes(user.rol) && (
                                            <Link to="/visitas" role="menuitem" onClick={cerrarMenus}>
                                                <span aria-hidden="true">📅</span> Solicitudes de visita
                                            </Link>
                                        )}
                                        {ROLES_EVALUAN.includes(user.rol) && (
                                            <Link to="/arriendos" role="menuitem" onClick={cerrarMenus}>
                                                <span aria-hidden="true">📝</span> Solicitudes de arriendo
                                            </Link>
                                        )}
                                        {ROLES_GESTION.includes(user.rol) && (
                                            <Link to="/propietarios" role="menuitem" onClick={cerrarMenus}>
                                                <span aria-hidden="true">👤</span> Propietarios
                                            </Link>
                                        )}
                                        {ROLES_ATENCION.includes(user.rol) && (
                                            <Link to="/clientes" role="menuitem" onClick={cerrarMenus}>
                                                <span aria-hidden="true">👥</span> Clientes interesados
                                            </Link>
                                        )}

                                        <button type="button" role="menuitem" onClick={handleLogout}>
                                            <span aria-hidden="true">⎋</span> Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <NavLink className="boton-sesion" to="/login" onClick={cerrarMenus}>
                                    Iniciar Sesión
                                </NavLink>
                                <NavLink className="boton-registro" to="/registro" onClick={cerrarMenus}>
                                    Registrarse
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
