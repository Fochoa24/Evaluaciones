import { Link } from 'react-router-dom';

const enlacesNavegacion = [
    { texto: 'Inicio', ruta: '/' },
    { texto: 'Propiedades', ruta: '/propiedades' },
    { texto: 'Panel administrativo', ruta: '/dashboard' },
    { texto: 'Solicitudes de visita', ruta: '/visitas' },
    { texto: 'Iniciar sesión', ruta: '/login' },
    { texto: 'Crear cuenta', ruta: '/registro' }
];

const servicios = [
    'Catálogo de inmuebles',
    'Visitas coordinadas',
    'Asesoría personalizada',
    'Proceso transparente',
    'Propiedades verificadas',
    'Atención rápida'
];

const redes = [
    {
        nombre: 'Facebook',
        href: 'https://facebook.com',
        icono: (
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path
                    fill="currentColor"
                    d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
                />
            </svg>
        )
    },
    {
        nombre: 'Instagram',
        href: 'https://instagram.com',
        icono: (
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path
                    fill="currentColor"
                    d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5zM17 7.75a.75.75 0 1 1-.75.75.75.75 0 0 1 .75-.75z"
                />
            </svg>
        )
    },
    {
        nombre: 'LinkedIn',
        href: 'https://linkedin.com',
        icono: (
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path
                    fill="currentColor"
                    d="M6.5 9H3v12h3.5V9zM4.75 3A2 2 0 1 0 4.76 7a2 2 0 0 0-.01-4zM21 14.5c0-3-1.6-4.9-4.2-4.9a3.7 3.7 0 0 0-3.3 1.8V9.8H10v11.2h3.5v-5.6c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3v5.5H21v-6.5z"
                />
            </svg>
        )
    },
    {
        nombre: 'WhatsApp',
        href: 'https://wa.me/56912345678',
        icono: (
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path
                    fill="currentColor"
                    d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.8-1.2A9 9 0 1 0 12 3zm0 2a7 7 0 1 1-3.6 13l-.3-.2-2.6.7.7-2.5-.2-.3A7 7 0 0 1 12 5zm-2.4 3.2c-.2 0-.5.1-.7.4s-.9.9-.9 2.2.9 2.6 1 2.8c.1.2 1.8 2.9 4.5 3.9 2.2.8 2.6.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.3-.2-.6-.3l-2-.9c-.3-.1-.5-.1-.7.2l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.3-1.4a8.4 8.4 0 0 1-1.6-2c-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.4 0-.5l-.9-2c-.1-.3-.3-.3-.5-.3h-.4z"
                />
            </svg>
        )
    }
];

export default function Footer() {
    const anio = new Date().getFullYear();

    return (
        <footer className="pie-pagina">
            <div className="pie-contenido">
                <div className="pie-columna pie-marca">
                    <img
                        className="pie-logo"
                        src="/logo/horizontal-dark.svg"
                        alt="Gestión Urbana"
                        width="180"
                        height="60"
                    />
                    <p className="pie-descripcion">
                        Plataforma de gestión inmobiliaria para explorar propiedades,
                        coordinar visitas y administrar tu portafolio de forma simple y transparente.
                    </p>
                    <nav className="pie-redes" aria-label="Redes sociales">
                        {redes.map((red) => (
                            <a
                                key={red.nombre}
                                href={red.href}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={red.nombre}
                                className="pie-red"
                            >
                                {red.icono}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="pie-columna">
                    <h3 className="pie-titulo">Navegación</h3>
                    <ul className="pie-lista">
                        {enlacesNavegacion.map((enlace) => (
                            <li key={enlace.ruta}>
                                <Link to={enlace.ruta}>{enlace.texto}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pie-columna">
                    <h3 className="pie-titulo">Servicios</h3>
                    <ul className="pie-lista">
                        {servicios.map((servicio) => (
                            <li key={servicio}>
                                <Link to="/">{servicio}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pie-columna">
                    <h3 className="pie-titulo">Contacto</h3>
                    <ul className="pie-lista pie-contacto">
                        <li>
                            <span className="pie-etiqueta">Dirección</span>
                            <span>Av. Providencia 1234, Santiago, Chile</span>
                        </li>
                        <li>
                            <span className="pie-etiqueta">Teléfono</span>
                            <a href="tel:+56912345678">+56 9 1234 5678</a>
                        </li>
                        <li>
                            <span className="pie-etiqueta">Correo</span>
                            <a href="mailto:contacto@gestionurbana.cl">contacto@gestionurbana.cl</a>
                        </li>
                        <li>
                            <span className="pie-etiqueta">Horario</span>
                            <span>Lun a Vie · 09:00 – 18:00</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="pie-inferior">
                <p>© {anio} Gestión Urbana Propiedades. Todos los derechos reservados.</p>
                <div className="pie-legales">
                    <Link to="/privacidad">Privacidad</Link>
                    <Link to="/terminos">Términos de uso</Link>
                    <Link to="/cookies">Cookies</Link>
                    <button
                        type="button"
                        className="pie-config-cookies"
                        onClick={() => window.dispatchEvent(new CustomEvent('configurar-cookies'))}
                    >
                        Configurar cookies
                    </button>
                </div>
            </div>
        </footer>
    );
}
