import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArriendos } from '../context/ArriendosContext';
import { useAuth } from '../context/AuthContext';
import { ESTADOS_ARRIENDO, MOTIVOS_ARRIENDO } from '../data/flujo';
import { ROLES_INTERNOS } from '../data/roles';

const CLASES_BADGE = {
    Pendiente: 'reservada',
    'En evaluación': 'reservada',
    'Esperando propietario': 'reservada',
    Aprobada: 'disponible',
    Finalizada: 'disponible',
    Rechazada: 'vendida',
    Vencida: 'vendida',
    Cancelada: 'vendida'
};

/** Texto del botón para cada destino de `transiciones`. */
function etiqueta(solicitud, destino) {
    if (destino === 'Cancelada') return solicitud.estado === 'Aprobada' ? 'Liberar reserva' : 'Cancelar';
    return {
        Pendiente: 'Reactivar',
        'En evaluación': 'Tomar en evaluación',
        'Esperando propietario': 'Aprobar',
        Aprobada: 'Aceptar',
        Rechazada: 'Rechazar'
    }[destino];
}

const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-CL', { dateStyle: 'medium' }) : '');
const pesos = (n) => `$${Number(n || 0).toLocaleString('es-CL')}`;

/**
 * Solicitudes de arriendo según el rol (§8): el ejecutivo evalúa las de su
 * cartera (primera aprobación, con motivo); el propietario acepta o rechaza
 * las que esperan su respuesta, sin ver contacto ni datos financieros; el
 * cliente sigue las suyas ("Mis solicitudes"), las cancela o reactiva.
 */
export default function Arriendos() {
    const { user } = useAuth();
    const { arriendos, cargando, error, cambiarEstado, eliminar } = useArriendos();
    const [filtroEstado, setFiltroEstado] = useState('');
    // Evaluación del ejecutivo: { id, motivo, observaciones }
    const [evaluando, setEvaluando] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const interno = ROLES_INTERNOS.includes(user.rol);
    const esCliente = user.rol === 'cliente';
    const esPropietario = user.rol === 'propietario';
    const solicitudes = filtroEstado ? arriendos.filter((item) => item.estado === filtroEstado) : arriendos;

    const informar = (r, exito) =>
        setMensaje(r.ok ? { texto: exito, tipo: 'success' } : { texto: r.mensaje, tipo: 'error' });

    const aplicar = async (solicitud, destino, extras = {}) => {
        // El ejecutivo aprueba o rechaza con motivo: abre el formulario de evaluación.
        if (interno && ['Esperando propietario', 'Rechazada'].includes(destino) && !extras.motivo) {
            setEvaluando({ id: solicitud.id, motivo: solicitud.motivo || '', observaciones: solicitud.observacionesEjecutivo || '' });
            return;
        }
        if (esPropietario && destino === 'Rechazada') {
            const motivoPropietario = window.prompt('Motivo del rechazo (opcional):', '');
            if (motivoPropietario === null) return;
            extras = { motivoPropietario };
        } else if (['Cancelada', 'Aprobada'].includes(destino)) {
            const efecto = destino === 'Aprobada'
                ? ' La propiedad quedará reservada y las demás solicitudes se rechazarán.'
                : solicitud.estado === 'Aprobada' ? ' La propiedad vuelve al catálogo.' : '';
            if (!window.confirm(`¿${etiqueta(solicitud, destino)} la solicitud de ${solicitud.clienteNombre}?${efecto}`)) return;
        }
        const r = await cambiarEstado(solicitud.id, destino, extras);
        const extra = r.datos?.rechazadas ? ` ${r.datos.rechazadas} solicitud(es) más quedaron rechazadas.` : '';
        informar(r, `Solicitud ${destino === 'Esperando propietario' ? 'enviada al propietario' : `ahora ${destino}`}.${extra}`);
        if (r.ok) setEvaluando(null);
    };

    const enviarEvaluacion = (solicitud, destino) => {
        if (!evaluando.motivo) {
            setMensaje({ texto: 'Elige el motivo de la evaluación.', tipo: 'error' });
            return;
        }
        aplicar(solicitud, destino, { motivo: evaluando.motivo, observaciones: evaluando.observaciones });
    };

    const eliminarSolicitud = async (solicitud) => {
        if (!window.confirm(`¿Eliminar definitivamente la solicitud de ${solicitud.clienteNombre}?`)) return;
        informar(await eliminar(solicitud.id), 'Solicitud eliminada.');
    };

    const formularioEvaluacion = (solicitud) => (
        <div className="edicion-visita">
            <label className="visually-hidden" htmlFor={`motivo-${solicitud.id}`}>Motivo</label>
            <select
                id={`motivo-${solicitud.id}`}
                value={evaluando.motivo}
                onChange={(e) => setEvaluando((prev) => ({ ...prev, motivo: e.target.value }))}
            >
                {MOTIVOS_ARRIENDO.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo || 'Elige el motivo'}</option>
                ))}
            </select>
            <label className="visually-hidden" htmlFor={`obs-${solicitud.id}`}>Observaciones internas</label>
            <input
                type="text"
                id={`obs-${solicitud.id}`}
                placeholder="Observaciones internas (el dueño no las ve)"
                value={evaluando.observaciones}
                onChange={(e) => setEvaluando((prev) => ({ ...prev, observaciones: e.target.value }))}
            />
            <div className="acciones-tabla">
                {solicitud.transiciones.includes('Esperando propietario') && (
                    <button type="button" className="boton boton-mini" onClick={() => enviarEvaluacion(solicitud, 'Esperando propietario')}>
                        Aprobar y enviar al dueño
                    </button>
                )}
                <button type="button" className="boton boton-mini boton-secundario" onClick={() => enviarEvaluacion(solicitud, 'Rechazada')}>
                    Rechazar
                </button>
                <button type="button" className="boton boton-mini boton-secundario" onClick={() => setEvaluando(null)}>
                    Volver
                </button>
            </div>
        </div>
    );

    const acciones = (solicitud) => (
        <div className="acciones-tabla">
            {solicitud.transiciones.map((destino) => (
                <button
                    key={destino}
                    type="button"
                    className={`boton boton-mini${['Cancelada', 'Rechazada'].includes(destino) ? ' boton-secundario' : ''}`}
                    onClick={() => aplicar(solicitud, destino)}
                    aria-label={`${etiqueta(solicitud, destino)}: solicitud de ${solicitud.clienteNombre} por ${solicitud.propiedadTitulo}`}
                >
                    {etiqueta(solicitud, destino)}
                </button>
            ))}
            {user.rol === 'admin' && (
                <button type="button" className="boton boton-mini boton-peligro" onClick={() => eliminarSolicitud(solicitud)}>
                    Eliminar
                </button>
            )}
        </div>
    );

    /** Estado, con el plazo del dueño cuando corresponde. */
    const estado = (solicitud) => (
        <>
            <span className={`badge ${CLASES_BADGE[solicitud.estado] || 'disponible'}`}>{solicitud.estado}</span>
            {solicitud.estado === 'Esperando propietario' && solicitud.venceEn && (
                <div className="subtexto-tabla">Respuesta del dueño antes del {fecha(solicitud.venceEn)}</div>
            )}
            {solicitud.estado === 'Vencida' && esCliente && (
                <div className="subtexto-tabla">El dueño no respondió a tiempo: puedes reactivarla.</div>
            )}
        </>
    );

    /** Recomendación del ejecutivo, respuesta del dueño y notas internas. */
    const motivos = (solicitud) => (
        <>
            {solicitud.motivo || '—'}
            {solicitud.motivoPropietario && <div className="subtexto-tabla">Dueño: {solicitud.motivoPropietario}</div>}
            {interno && solicitud.observacionesEjecutivo && (
                <div className="subtexto-tabla">Notas: {solicitud.observacionesEjecutivo}</div>
            )}
        </>
    );

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">{esCliente ? 'MIS SOLICITUDES' : 'ARRIENDOS'}</p>
                <h1>{esCliente ? 'Mis solicitudes de arriendo' : 'Solicitudes de arriendo'}</h1>
                <p className="subtitulo-login">
                    {interno
                        ? 'Evalúa los antecedentes de tu cartera: al aprobar, la solicitud pasa al propietario, que tiene 5 días hábiles para responder.'
                        : esPropietario
                            ? 'Solicitudes que el ejecutivo ya aprobó para tus propiedades. Al aceptar una, la propiedad queda reservada.'
                            : 'Sigue el estado de tus postulaciones. Primero las evalúa el ejecutivo y después el propietario.'}
                </p>
                {esCliente && (
                    <div className="acciones-detalle">
                        <Link to="/propiedades" className="boton boton-ver">Buscar propiedades</Link>
                    </div>
                )}
            </section>

            {mensaje.texto && (
                <p className={`mensaje ${mensaje.tipo === 'error' ? 'error' : ''} visible`} role={mensaje.tipo === 'error' ? 'alert' : 'status'}>
                    {mensaje.texto}
                </p>
            )}

            <section className="contenedor-filtros" aria-label="Filtrar solicitudes de arriendo">
                <div className="bar-filtros">
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-estado-arriendo">Estado</label>
                        <select id="filtro-estado-arriendo" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Todos</option>
                            {ESTADOS_ARRIENDO.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Listado de solicitudes</h2>
                {cargando && !arriendos.length ? (
                    <p role="status">Cargando solicitudes...</p>
                ) : error ? (
                    <p className="mensaje error visible" role="alert">{error}</p>
                ) : solicitudes.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Solicitudes de arriendo">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    {!esCliente && <th scope="col">Postulante</th>}
                                    {!esPropietario && <th scope="col">Antecedentes</th>}
                                    <th scope="col">Enviada</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Motivo</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id}>
                                        <th scope="row">
                                            <Link to={`/propiedades/${solicitud.propiedadId}`} className="link-detalle">
                                                {solicitud.propiedadTitulo}
                                            </Link>
                                        </th>
                                        {!esCliente && (
                                            <td>
                                                {solicitud.clienteNombre}
                                                {interno && (
                                                    <>
                                                        <div className="subtexto-tabla">{solicitud.clienteEmail}</div>
                                                        <div className="subtexto-tabla">{solicitud.clienteTelefono}</div>
                                                    </>
                                                )}
                                            </td>
                                        )}
                                        {!esPropietario && (
                                            <td>
                                                {pesos(solicitud.ingresoMensual)} / mes
                                                <div className="subtexto-tabla">Garantía: {solicitud.garantia || 'Sin indicar'}</div>
                                                {solicitud.antecedentes && <div className="subtexto-tabla">{solicitud.antecedentes}</div>}
                                            </td>
                                        )}
                                        <td>{fecha(solicitud.createdAt)}</td>
                                        <td>{estado(solicitud)}</td>
                                        <td>{motivos(solicitud)}</td>
                                        <td>{evaluando?.id === solicitud.id ? formularioEvaluacion(solicitud) : acciones(solicitud)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay solicitudes con este filtro.
                        {esCliente && ' Puedes postular desde el detalle de una propiedad publicada.'}
                    </p>
                )}
            </section>
        </main>
    );
}
