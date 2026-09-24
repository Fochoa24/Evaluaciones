import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { usePropietarios } from '../context/PropietariosContext';
import { useVisitas } from '../context/VisitasContext';
import { ROLES_GESTION } from '../data/roles';

const solicitudInicial = {
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    comentarios: ''
};

export default function DetallePropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { obtener, eliminar } = usePropiedades();
    const { propietarios } = usePropietarios();
    const { crear } = useVisitas();
    const formRef = useRef(null);

    const propiedad = obtener(id);
    const dueno = propiedad
        ? propietarios.find((item) => item.id === propiedad.propietarioId)
        : null;
    const puedeGestionar = user && ROLES_GESTION.includes(user.rol);
    const hoy = new Date().toISOString().split('T')[0];

    const [solicitud, setSolicitud] = useState(() => ({
        ...solicitudInicial,
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || ''
    }));
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const [erroresCampo, setErroresCampo] = useState({});

    if (!propiedad) {
        return (
            <main className="seccion detalle-main">
                <p className="mensaje error visible" role="alert">
                    No se encontró la propiedad solicitada.
                </p>
            </main>
        );
    }

    const puedeArrendar =
        propiedad.estado === 'Disponible' || propiedad.estado === 'Publicada';

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSolicitud((prev) => ({ ...prev, [name]: value }));
        setErroresCampo((prev) => {
            if (!prev[name]) return prev;
            const siguiente = { ...prev };
            delete siguiente[name];
            return siguiente;
        });
    };

    const focoPrimerError = (errores) => {
        const primero = Object.keys(errores)[0];
        if (!primero || !formRef.current) return;
        const campo = formRef.current.elements.namedItem(primero);
        if (campo && typeof campo.focus === 'function') {
            campo.focus();
        }
    };

    const solicitarVisita = (event) => {
        event.preventDefault();

        const errores = {};
        if (!solicitud.nombre.trim()) errores.nombre = 'Ingresa tu nombre.';
        if (!solicitud.email.trim()) errores.email = 'Ingresa tu correo.';
        if (!solicitud.fecha) errores.fecha = 'Elige una fecha.';
        if (!solicitud.hora) errores.hora = 'Elige una hora.';

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje({
                texto: 'Completa nombre, correo, fecha y hora para solicitar la visita.',
                tipo: 'error'
            });
            focoPrimerError(errores);
            return;
        }

        setErroresCampo({});
        const resultado = crear({
            propiedadId: propiedad.id,
            propiedadTitulo: propiedad.titulo,
            nombre: solicitud.nombre.trim(),
            email: solicitud.email.trim(),
            telefono: solicitud.telefono.trim(),
            fecha: solicitud.fecha,
            hora: solicitud.hora,
            comentarios: solicitud.comentarios.trim()
        });

        if (!resultado.ok) {
            setMensaje({ texto: resultado.mensaje, tipo: 'error' });
            return;
        }

        setMensaje({
            texto: 'Solicitud de visita registrada. Te contactaremos para confirmar.',
            tipo: 'success'
        });
        setSolicitud((prev) => ({ ...prev, fecha: '', hora: '', comentarios: '' }));
    };

    const handleEliminar = () => {
        if (window.confirm(`¿Eliminar la propiedad "${propiedad.titulo}"?`)) {
            eliminar(propiedad.id);
            navigate('/propiedades');
        }
    };

    const totalAPagar = propiedad.precioMensual + (propiedad.gastosComunes || 0);

    return (
        <main className="seccion detalle-main">
            <section className="detalle-card">
                <article className="detalle-contenedor">
                    <div className="detalle-imagen">
                        <img src={propiedad.imagen} alt={propiedad.titulo} />
                    </div>
                    <div className="detalle-info">
                        <span className="tipo-propiedad">{propiedad.tipo}</span>
                        <h1>{propiedad.titulo}</h1>
                        <p className="ubicacion">{propiedad.ubicacion}</p>

                        <div className="detalle-precio">
                            <strong>${propiedad.precioMensual.toLocaleString('es-CL')}</strong>
                            <Badge estado={propiedad.estado} />
                        </div>

                        <ul className="detalle-lista">
                            <li>
                                <span aria-hidden="true">📍</span> Comuna: {propiedad.comuna}
                            </li>
                            <li>
                                <span aria-hidden="true">🏠</span> Dirección:{' '}
                                {propiedad.direccion || 'Sin dirección registrada'}
                            </li>
                            <li>
                                <span aria-hidden="true">🛏️</span> Dormitorios:{' '}
                                {propiedad.dormitorios}
                            </li>
                            <li>
                                <span aria-hidden="true">🚿</span> Baños: {propiedad.banos}
                            </li>
                            <li>
                                <span aria-hidden="true">🅿️</span> Estacionamientos:{' '}
                                {propiedad.estacionamientos ?? 0}
                            </li>
                            <li>
                                <span aria-hidden="true">📐</span> Superficie:{' '}
                                {propiedad.superficie} m²
                            </li>
                            <li>
                                <span aria-hidden="true">🧾</span> Gastos comunes:${' '}
                                {(propiedad.gastosComunes || 0).toLocaleString('es-CL')}
                            </li>
                            <li>
                                <span aria-hidden="true">💰</span> Total mensual estimado:${' '}
                                {totalAPagar.toLocaleString('es-CL')}
                            </li>
                            {dueno && (
                                <li>
                                    <span aria-hidden="true">👤</span> Propietario: {dueno.nombre}
                                </li>
                            )}
                        </ul>

                        {propiedad.caracteristicas?.length ? (
                            <div className="caracteristicas-propiedad">
                                <h2>Características</h2>
                                <ul>
                                    {propiedad.caracteristicas.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        <div className="acciones-detalle">
                            <Link to="/propiedades" className="boton boton-ver">
                                Volver al catálogo
                            </Link>
                            {puedeGestionar && (
                                <>
                                    <Link
                                        to={`/propiedades/${propiedad.id}/editar`}
                                        className="boton boton-ver"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        className="boton boton-ver boton-peligro"
                                        onClick={handleEliminar}
                                    >
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>

                        {puedeArrendar && (
                            <div className="acciones-detalle">
                                <Link to={`/arriendos/nueva/${propiedad.id}`} className="boton">
                                    Solicitar arriendo
                                </Link>
                            </div>
                        )}
                    </div>
                </article>
            </section>

            <section className="tarjeta-form seccion-visita">
                <h2>Solicitar visita</h2>
                <p className="subtitulo-login">
                    Elige la fecha y hora que prefieras y coordinamos el recorrido.
                </p>

                <form
                    ref={formRef}
                    onSubmit={solicitarVisita}
                    className="formulario-propiedad"
                    noValidate
                    aria-label="Formulario de solicitud de visita"
                >
                    <div className="campo">
                        <label htmlFor="nombre-visita">Nombre</label>
                        <input
                            type="text"
                            id="nombre-visita"
                            name="nombre"
                            value={solicitud.nombre}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            aria-invalid={erroresCampo.nombre ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.nombre ? 'nombre-visita-error' : undefined
                            }
                        />
                        {erroresCampo.nombre && (
                            <span id="nombre-visita-error" className="error-campo">
                                {erroresCampo.nombre}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="email-visita">Correo</label>
                        <input
                            type="email"
                            id="email-visita"
                            name="email"
                            value={solicitud.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            aria-invalid={erroresCampo.email ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.email ? 'email-visita-error' : undefined
                            }
                        />
                        {erroresCampo.email && (
                            <span id="email-visita-error" className="error-campo">
                                {erroresCampo.email}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="telefono-visita">Teléfono</label>
                        <input
                            type="tel"
                            id="telefono-visita"
                            name="telefono"
                            placeholder="Ej: +56 9 1234 5678"
                            value={solicitud.telefono}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="fecha-visita">Fecha</label>
                        <input
                            type="date"
                            id="fecha-visita"
                            name="fecha"
                            min={hoy}
                            value={solicitud.fecha}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.fecha ? 'true' : undefined}
                            aria-describedby={erroresCampo.fecha ? 'fecha-visita-error' : undefined}
                        />
                        {erroresCampo.fecha && (
                            <span id="fecha-visita-error" className="error-campo">
                                {erroresCampo.fecha}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="hora-visita">Hora</label>
                        <input
                            type="time"
                            id="hora-visita"
                            name="hora"
                            value={solicitud.hora}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.hora ? 'true' : undefined}
                            aria-describedby={erroresCampo.hora ? 'hora-visita-error' : undefined}
                        />
                        {erroresCampo.hora && (
                            <span id="hora-visita-error" className="error-campo">
                                {erroresCampo.hora}
                            </span>
                        )}
                    </div>

                    <div className="campo campo-completo">
                        <label htmlFor="comentarios-visita">Comentarios (opcional)</label>
                        <textarea
                            id="comentarios-visita"
                            name="comentarios"
                            className="campo-textarea"
                            placeholder="Indica dudas o preferencias de horario"
                            value={solicitud.comentarios}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="campo-completo">
                        <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
                    </div>

                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton">
                            Enviar solicitud
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
