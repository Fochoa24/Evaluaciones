import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PropiedadCard from '../components/PropiedadCard';
import { propiedades } from '../data/propiedades';

const servicios = [
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm2 0v10h12V9H9.8L8 7H6z"
                />
            </svg>
        ),
        titulo: 'Catálogo actualizado',
        texto: 'Filtra por comuna, precio, tipo y dormitorios hasta encontrar el inmueble ideal.'
    },
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2zm0 2v11.2l5-2.1 5 2.1V5H7zm2 3h6v2H9V8z"
                />
            </svg>
        ),
        titulo: 'Visitas coordinadas',
        texto: 'Elige fecha y hora en la ficha de la propiedad y te confirmamos el recorrido.'
    },
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5z"
                />
            </svg>
        ),
        titulo: 'Asesoría personalizada',
        texto: 'Ejecutivos inmobiliarios te orientan según tu presupuesto y estilo de vida.'
    },
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm0 2.2 6 2.2V11c0 3.9-2.5 7.3-6 8.7C8.5 18.3 6 14.9 6 11V6.4l6-2.2zM11 14h2v-3h3v-2h-3V6h-2v3H8v2h3v3z"
                />
            </svg>
        ),
        titulo: 'Proceso transparente',
        texto: 'Estado claro de cada solicitud y información verificada durante todo el proceso.'
    },
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M12 2 3 7v2h18V7l-9-5zm-7 9v8H4v2h16v-2h-1v-8h-2v8h-3v-8h-2v8H9v-8H7v8H5v-8H5z"
                />
            </svg>
        ),
        titulo: 'Propiedades verificadas',
        texto: 'Fichas con características reales: superficie, dormitorios, estado y precio.'
    },
    {
        icono: (
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm1.8-7.2-.9.9A2.5 2.5 0 0 0 13 12h-2v-.5a3.5 3.5 0 0 1 1-2.5l1.3-1.2a1.5 1.5 0 1 0-2.6-1.3H8.5A3.5 3.5 0 1 1 14.8 9.8z"
                />
            </svg>
        ),
        titulo: 'Atención rápida',
        texto: 'Resuelve dudas por correo o teléfono con soporte de nuestro equipo inmobiliario.'
    }
];

const pasos = [
    {
        numero: '01',
        titulo: 'Explora el catálogo',
        texto: 'Busca por comuna, precio, tipo de inmueble y cantidad de dormitorios.'
    },
    {
        numero: '02',
        titulo: 'Solicita una visita',
        texto: 'En la ficha elige fecha y hora; dejamos tus datos de contacto listos.'
    },
    {
        numero: '03',
        titulo: 'Coordinamos contigo',
        texto: 'Confirmamos el horario y un ejecutivo te acompaña en el recorrido.'
    }
];

const destacadas = propiedades
    .filter((item) => item.estado === 'Disponible')
    .slice(0, 3);

const metricas = [
    { valor: '120+', etiqueta: 'Propiedades gestionadas' },
    { valor: '15', etiqueta: 'Comunas en Santiago' },
    { valor: '98%', etiqueta: 'Clientes satisfechos' },
    { valor: '48h', etiqueta: 'Respuesta promedio' }
];

export default function Home() {
    return (
        <main>
            <Hero>
                <p className="etiqueta">Gestión inmobiliaria</p>
                <h1>
                    Encuentra el lugar ideal para{' '}
                    <span className="hero-resaltar">tu próxima etapa</span>.
                </h1>
                <p className="hero-bajada">
                    Explora propiedades disponibles y solicita una visita de forma rápida y sencilla.
                </p>
                <div className="hero-acciones">
                    <Link className="boton hero-cta" to="/propiedades">
                        Ver Propiedades
                    </Link>
                    <Link className="boton hero-cta-secundario" to="/registro">
                        Crear cuenta
                    </Link>
                </div>
            </Hero>

            <section className="seccion seccion-servicios">
                <header className="encabezado-seccion">
                    <p className="etiqueta">Nuestros servicios</p>
                    <h2>Todo lo que necesitas, en un solo lugar</h2>
                    <p className="bajada-seccion">
                        Diseñamos la experiencia completa: desde que encuentras una propiedad
                        hasta que coordinamos tu visita.
                    </p>
                </header>

                <div className="grilla-servicios">
                    {servicios.map((servicio, indice) => (
                        <article className="tarjeta-servicio" key={servicio.titulo}>
                            <span className="servicio-numero">{String(indice + 1).padStart(2, '0')}</span>
                            <span className="servicio-icono" aria-hidden="true">
                                {servicio.icono}
                            </span>
                            <h3>{servicio.titulo}</h3>
                            <p>{servicio.texto}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="seccion-banda-metricas">
                <div className="metricas">
                    {metricas.map((metrica) => (
                        <div className="metrica" key={metrica.etiqueta}>
                            <strong>{metrica.valor}</strong>
                            <span>{metrica.etiqueta}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="seccion">
                <header className="encabezado-seccion">
                    <p className="etiqueta">Destacadas</p>
                    <h2>Propiedades disponibles hoy</h2>
                    <p className="bajada-seccion">
                        Una selección del catálogo para que empieces a explorar sin filtros.
                    </p>
                </header>

                <div className="propiedades-grilla">
                    {destacadas.map((propiedad) => (
                        <PropiedadCard key={propiedad.id} propiedad={propiedad} />
                    ))}
                </div>

                <div className="centrar-accion">
                    <Link className="boton" to="/propiedades">
                        Ver catálogo completo
                    </Link>
                </div>
            </section>

            <section className="seccion seccion-como-funciona">
                <header className="encabezado-seccion">
                    <p className="etiqueta">Cómo funciona</p>
                    <h2>Tres pasos y listo</h2>
                </header>

                <div className="grilla-pasos">
                    {pasos.map((paso) => (
                        <article className="tarjeta-paso" key={paso.numero}>
                            <span className="paso-numero">{paso.numero}</span>
                            <h3>{paso.titulo}</h3>
                            <p>{paso.texto}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="seccion-cta-final">
                <div className="cta-final-tarjeta">
                    <div className="cta-final-texto">
                        <p className="etiqueta">Empieza hoy</p>
                        <h2>¿Listo para encontrar tu próximo hogar?</h2>
                        <p className="cta-final-bajada">
                            Crea tu cuenta, guarda favoritos del catálogo y solicita visitas en minutos.
                        </p>
                        <div className="cta-final-acciones">
                            <Link className="boton" to="/propiedades">
                                Explorar propiedades
                            </Link>
                            <Link className="boton boton-ghost" to="/registro">
                                Registrarme gratis
                            </Link>
                        </div>
                    </div>
                    <aside className="cta-final-aside" aria-label="Datos de la plataforma">
                        <div className="cta-final-dato">
                            <strong>120+</strong>
                            <span>Propiedades</span>
                        </div>
                        <div className="cta-final-dato">
                            <strong>48h</strong>
                            <span>Respuesta</span>
                        </div>
                        <div className="cta-final-dato">
                            <strong>15</strong>
                            <span>Comunas</span>
                        </div>
                    </aside>
                    <span className="cta-final-forma cta-final-forma-a" aria-hidden="true" />
                    <span className="cta-final-forma cta-final-forma-b" aria-hidden="true" />
                </div>
            </section>
        </main>
    );
}
