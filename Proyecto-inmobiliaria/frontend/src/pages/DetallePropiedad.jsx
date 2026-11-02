import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { useVisitas } from '../context/VisitasContext';
import { CONFIRMAR_TRANSICION, IMAGEN_DEFECTO, etiquetaTransicion } from '../data/propiedades';

/** Texto de los efectos que devuelve POST /api/propiedades/:id/estado. */
function describirResumen(resumen = {}) {
    const partes = [];
    if (resumen.visitasCanceladas) partes.push(`${resumen.visitasCanceladas} visita(s) cancelada(s)`);
    if (resumen.arriendosCancelados) partes.push(`${resumen.arriendosCancelados} solicitud(es) cancelada(s)`);
    if (resumen.arriendosFinalizados) partes.push(`${resumen.arriendosFinalizados} contrato(s) finalizado(s)`);
    return partes.length ? ` ${partes.join('; ')}.` : '';
}

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
    const location = useLocation();
    const { user } = useAuth();
    const { obtener, cargando, cambiarEstado, eliminar } = usePropiedades();
    const { crear, horarios } = useVisitas();
    const formRef = useRef(null);

    const propiedad = obtener(id);
    // Solo una propiedad Publicada recibe visitas y solicitudes (D9, RN-02, RN-06).
    const publicada = propiedad?.estado === 'Publicada';
    // RN-01 y plazos: rango de fechas y bloques libres del día, desde la API.
    const [agenda, setAgenda] = useState({ desde: '', hasta: '', bloques: [], cargando: false });
    // Última fecha pedida: descarta respuestas atrasadas de fechas anteriores.
    const fechaPedida = useRef('');
    // Aviso que deja PropiedadEditar al volver (p. ej. "vuelve a revisión").
    const [aviso, setAviso] = useState(() => location.state?.aviso || { texto: '', tipo: 'success' });

    const [solicitud, setSolicitud] = useState(() => ({
        ...solicitudInicial,
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || ''
    }));
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const [erroresCampo, setErroresCampo] = useState({});

    useEffect(() => {
        if (!publicada) return;
        horarios(id).then((r) => r.ok && setAgenda((prev) => ({ ...prev, desde: r.datos.desde, hasta: r.datos.hasta })));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar de propiedad o de estado
    }, [id, publicada]);

    /** Al elegir fecha, pide los bloques libres de ese día. */
    const cargarBloques = async (fecha) => {
        fechaPedida.current = fecha;
        // Al escribir la fecha a mano cada dígito da una fecha distinta (0002-…, 0020-…):
        // solo se consultan las que están dentro del rango agendable.
        const enRango = fecha && (!agenda.desde || fecha >= agenda.desde) && (!agenda.hasta || fecha <= agenda.hasta);
        setAgenda((prev) => ({ ...prev, bloques: [], cargando: Boolean(enRango) }));
        if (!enRango) return;
        const r = await horarios(id, fecha);
        // Una respuesta atrasada cambiaría las opciones con el select abierto y lo cerraría.
        if (fechaPedida.current !== fecha) return;
        setAgenda((prev) => ({ ...prev, bloques: r.ok ? r.datos.bloques : [], cargando: false }));
    };

    if (!propiedad) {
        return (
            <main className="seccion detalle-main">
                {cargando ? (
                    <p role="status">Cargando propiedad...</p>
                ) : (
                    <p className="mensaje error visible" role="alert">
                        No se encontró la propiedad solicitada.
                    </p>
                )}
            </main>
        );
    }

    // §8: el propietario no agenda; el cliente agenda con los datos de su cuenta.
    const puedeAgendar = publicada && user?.rol !== 'propietario';
    const esCliente = user?.rol === 'cliente';
    const puedeArrendar = publicada && (!user || user.rol === 'cliente');

    /** Lleva la propiedad a `destino`, confirmando si tiene efectos (§7). */
    const aplicarTransicion = async (destino) => {
        const advertencia =
            CONFIRMAR_TRANSICION[destino] || CONFIRMAR_TRANSICION[`${propiedad.estado}→${destino}`];
        const accion = etiquetaTransicion(propiedad.estado, destino);
        if (advertencia && !window.confirm(`¿${accion}? ${advertencia}`)) return;

        const r = await cambiarEstado(propiedad.id, destino);
        setAviso(
            r.ok
                ? { texto: `Propiedad ahora ${destino}.${describirResumen(r.datos.resumen)}`, tipo: 'success' }
                : { texto: r.mensaje, tipo: 'error' }
        );
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSolicitud((prev) => ({ ...prev, [name]: value, ...(name === 'fecha' && { hora: '' }) }));
        if (name === 'fecha') cargarBloques(value);
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
        let campo = formRef.current.elements.namedItem(primero);
        // Los horarios son radios: namedItem devuelve la lista; se enfoca el primero.
        if (campo instanceof RadioNodeList) campo = campo[0];
        if (campo && typeof campo.focus === 'function') {
            campo.focus();
        }
    };

    const solicitarVisita = async (event) => {
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
        const resultado = await crear({
            propiedadId: propiedad.id,
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

        setMensaje({ texto: resultado.mensaje, tipo: 'success' });
        setSolicitud((prev) => ({ ...prev, fecha: '', hora: '', comentarios: '' }));
        setAgenda((prev) => ({ ...prev, bloques: [] }));
    };

    /** Borrado físico: solo admin y solo sin historial (el backend lo valida). */
    const handleEliminar = async () => {
        if (!window.confirm(`¿Eliminar definitivamente "${propiedad.titulo}"? No se puede deshacer.`)) return;
        const r = await eliminar(propiedad.id);
        if (r.ok) navigate('/propiedades');
        else setAviso({ texto: r.mensaje, tipo: 'error' });
    };

    const totalAPagar = propiedad.precioMensual + (propiedad.gastosComunes || 0);

    return (
        <main className="seccion detalle-main">
            <section className="detalle-card">
                <article className="detalle-contenedor">
                    <div className="detalle-imagen">
                        <img src={propiedad.imagen || IMAGEN_DEFECTO} alt={propiedad.titulo} />
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
                            {/* La API solo envía la dirección a internos y al dueño (D5). */}
                            {'direccion' in propiedad && (
                                <li>
                                    <span aria-hidden="true">🏠</span> Dirección:{' '}
                                    {propiedad.direccion || 'Sin dirección registrada'}
                                </li>
                            )}
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
                            <li>
                                <span aria-hidden="true">🤝</span> Ejecutivo a cargo:{' '}
                                {propiedad.ejecutivoNombre || 'Gestión Urbana'}
                            </li>
                            {propiedad.propietarioNombre && (
                                <li>
                                    <span aria-hidden="true">👤</span> Propietario:{' '}
                                    {propiedad.propietarioNombre}
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
                            {propiedad.puedeEditar && (
                                <Link
                                    to={`/propiedades/${propiedad.id}/editar`}
                                    className="boton boton-ver"
                                >
                                    Editar
                                </Link>
                            )}
                            {(propiedad.transiciones || []).map((destino) => (
                                <button
                                    key={destino}
                                    type="button"
                                    className={`boton boton-ver${destino === 'Inactiva' ? ' boton-peligro' : ''}`}
                                    onClick={() => aplicarTransicion(destino)}
                                >
                                    {etiquetaTransicion(propiedad.estado, destino)}
                                </button>
                            ))}
                            {user?.rol === 'admin' && (
                                <button
                                    type="button"
                                    className="boton boton-ver boton-peligro"
                                    onClick={handleEliminar}
                                >
                                    Eliminar definitivamente
                                </button>
                            )}
                        </div>

                        <Mensaje texto={aviso.texto} tipo={aviso.tipo} />

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

            {!publicada ? (
                <p className="mensaje sin-resultados visible" role="status">
                    Esta propiedad está {propiedad.estado}: no recibe visitas ni solicitudes por ahora.
                </p>
            ) : !puedeAgendar ? null : (
            <section className="tarjeta-form seccion-visita">
                <h2>Solicitar visita</h2>
                <p className="subtitulo-login">
                    Visitas de 30 minutos, de lunes a viernes (excepto feriados) entre 09:00 y 18:00. El
                    ejecutivo confirma la visita y te envía la dirección exacta por correo.
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
                            readOnly={esCliente}
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
                            readOnly={esCliente}
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
                            min={agenda.desde}
                            max={agenda.hasta}
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

                    {/* Botones y no <select>: en Firefox sobre Wayland el desplegable nativo
                        se cerraba solo o se cortaba sin scroll antes del último bloque. */}
                    <fieldset
                        className="campo campo-completo campo-horas"
                        aria-invalid={erroresCampo.hora ? 'true' : undefined}
                        aria-describedby={erroresCampo.hora ? 'hora-visita-error' : 'hora-visita-ayuda'}
                    >
                        <legend>Hora</legend>
                        {agenda.bloques.length > 0 && (
                            <div className="horas-visita">
                                {agenda.bloques.map((hora) => (
                                    <label key={hora} className="hora-opcion">
                                        <input
                                            type="radio"
                                            name="hora"
                                            value={hora}
                                            checked={solicitud.hora === hora}
                                            onChange={handleChange}
                                        />
                                        <span>{hora}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {erroresCampo.hora ? (
                            <span id="hora-visita-error" className="error-campo">
                                {erroresCampo.hora}
                            </span>
                        ) : (
                            <small id="hora-visita-ayuda" aria-live="polite">
                                {!solicitud.fecha
                                    ? 'Primero elige una fecha.'
                                    : agenda.cargando
                                        ? 'Buscando horarios...'
                                        : !agenda.bloques.length
                                            ? 'No hay horarios libres ese día (fin de semana, feriado o agenda completa).'
                                            : ''}
                            </small>
                        )}
                    </fieldset>

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
            )}
        </main>
    );
}
