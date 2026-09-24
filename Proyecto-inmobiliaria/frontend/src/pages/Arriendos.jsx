import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AvisoFicticio from '../components/AvisoFicticio';
import { useArriendos } from '../context/ArriendosContext';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { ESTADOS_ARRIENDO, MOTIVOS_ARRIENDO } from '../data/flujo';
import { ROLES_EVALUAN } from '../data/roles';

const CLASES_BADGE = {
    Pendiente: 'reservada',
    'En evaluación': 'reservada',
    Aprobada: 'disponible',
    Rechazada: 'vendida',
    Cancelada: 'vendida'
};

export default function Arriendos() {
    const { arriendos, actualizarEstado, eliminar } = useArriendos();
    const { obtener, actualizar } = usePropiedades();
    const { user } = useAuth();
    const [filtroEstado, setFiltroEstado] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [formEvaluacion, setFormEvaluacion] = useState({ observaciones: '', motivo: '' });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const puedeEvaluar = user && ROLES_EVALUAN.includes(user.rol);

    const solicitudes = useMemo(() => {
        return filtroEstado
            ? arriendos.filter((item) => item.estado === filtroEstado)
            : arriendos;
    }, [arriendos, filtroEstado]);

    const abrirEvaluacion = (solicitud) => {
        setEditandoId(solicitud.id);
        setFormEvaluacion({
            observaciones: solicitud.observacionesEjecutivo || '',
            motivo: solicitud.motivo || ''
        });
        setMensaje({ texto: '', tipo: 'success' });
    };

    const cancelarEvaluacion = () => {
        setEditandoId(null);
    };

    const pasarEnEvaluacion = (solicitud) => {
        actualizarEstado(solicitud.id, 'En evaluación', {
            observacionesEjecutivo: formEvaluacion.observaciones
        });
        setEditandoId(null);
        setMensaje({
            texto: `Solicitud de ${solicitud.clienteNombre} pasa a evaluación.`,
            tipo: 'success'
        });
    };

    const aprobar = (solicitud) => {
        const propiedad = obtener(solicitud.propiedadId);
        if (propiedad && propiedad.estado !== 'Arrendada') {
            actualizar(propiedad.id, { estado: 'Reservada' });
        }
        actualizarEstado(solicitud.id, 'Aprobada', {
            observacionesEjecutivo:
                formEvaluacion.observaciones || 'Aprobada. Propiedad reservada.',
            motivo: formEvaluacion.motivo
        });
        setEditandoId(null);
        setMensaje({
            texto: `Solicitud aprobada. La propiedad "${solicitud.propiedadTitulo}" queda Reservada.`,
            tipo: 'success'
        });
    };

    const rechazar = (solicitud) => {
        actualizarEstado(solicitud.id, 'Rechazada', {
            observacionesEjecutivo: formEvaluacion.observaciones,
            motivo: formEvaluacion.motivo || 'No cumple antecedentes'
        });
        setEditandoId(null);
        setMensaje({
            texto: `Solicitud de ${solicitud.clienteNombre} rechazada.`,
            tipo: 'success'
        });
    };

    const cancelarSolicitud = (solicitud) => {
        actualizarEstado(solicitud.id, 'Cancelada', {
            observacionesEjecutivo: formEvaluacion.observaciones
        });
        setEditandoId(null);
        setMensaje({
            texto: `Solicitud de ${solicitud.clienteNombre} cancelada.`,
            tipo: 'success'
        });
    };

    const liberarReserva = (solicitud) => {
        const propiedad = obtener(solicitud.propiedadId);
        if (propiedad && propiedad.estado === 'Reservada') {
            actualizar(propiedad.id, { estado: 'Disponible' });
        }
        actualizarEstado(solicitud.id, 'Cancelada', {
            observacionesEjecutivo: 'Reserva liberada. Propiedad disponible de nuevo.'
        });
        setEditandoId(null);
        setMensaje({
            texto: `Reserva liberada para "${solicitud.propiedadTitulo}".`,
            tipo: 'success'
        });
    };

    const eliminarSolicitud = (solicitud) => {
        if (window.confirm(`¿Eliminar la solicitud de ${solicitud.clienteNombre}?`)) {
            eliminar(solicitud.id);
            setMensaje({ texto: 'Solicitud eliminada.', tipo: 'success' });
        }
    };

    const acciones = (solicitud) => {
        const items = [];

        if (puedeEvaluar) {
            if (['Pendiente', 'En evaluación'].includes(solicitud.estado)) {
                items.push(
                    <button
                        key="evaluar"
                        type="button"
                        className="boton boton-mini"
                        onClick={() => abrirEvaluacion(solicitud)}
                        aria-label={`Evaluar solicitud de ${solicitud.clienteNombre}`}
                    >
                        Evaluar
                    </button>
                );
            }

            if (editandoId === solicitud.id) {
                if (solicitud.estado === 'Pendiente') {
                    items.push(
                        <button
                            key="en-eval"
                            type="button"
                            className="boton boton-mini boton-secundario"
                            onClick={() => pasarEnEvaluacion(solicitud)}
                        >
                            En evaluación
                        </button>
                    );
                }
                items.push(
                    <button
                        key="aprobar"
                        type="button"
                        className="boton boton-mini"
                        onClick={() => aprobar(solicitud)}
                        aria-label={`Aprobar y reservar por solicitud de ${solicitud.clienteNombre}`}
                    >
                        Aprobar
                    </button>,
                    <button
                        key="rechazar"
                        type="button"
                        className="boton boton-mini boton-secundario"
                        onClick={() => rechazar(solicitud)}
                        aria-label={`Rechazar solicitud de ${solicitud.clienteNombre}`}
                    >
                        Rechazar
                    </button>
                );
            }

            if (solicitud.estado === 'Aprobada') {
                items.push(
                    <button
                        key="liberar"
                        type="button"
                        className="boton boton-mini boton-secundario"
                        onClick={() => liberarReserva(solicitud)}
                        aria-label={`Liberar reserva de ${solicitud.propiedadTitulo}`}
                    >
                        Liberar reserva
                    </button>
                );
            }
        }

        if (['Pendiente', 'En evaluación'].includes(solicitud.estado)) {
            items.push(
                <button
                    key="cancelar"
                    type="button"
                    className="boton boton-mini boton-secundario"
                    onClick={() => cancelarSolicitud(solicitud)}
                    aria-label={`Cancelar solicitud de ${solicitud.clienteNombre}`}
                >
                    Cancelar
                </button>
            );
        }

        items.push(
            <button
                key="eliminar"
                type="button"
                className="boton boton-mini boton-peligro"
                onClick={() => eliminarSolicitud(solicitud)}
                aria-label={`Eliminar solicitud de ${solicitud.clienteNombre}`}
            >
                Eliminar
            </button>
        );

        return items;
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">ARRIENDOS</p>
                <h1>Solicitudes de arriendo</h1>
                <p className="subtitulo-login">
                    Evalúa antecedentes, aprueba (reserva la propiedad), rechaza o libera reservas.
                </p>
                <AvisoFicticio texto="Las reservas y solicitudes aprobadas son ficticias: existen solo para demostrar el flujo de evaluación del caso." />
            </section>

            {mensaje.texto && (
                <p
                    className={`mensaje ${mensaje.tipo === 'error' ? 'error' : ''} visible`}
                    role={mensaje.tipo === 'error' ? 'alert' : 'status'}
                >
                    {mensaje.texto}
                </p>
            )}

            <section className="contenedor-filtros" aria-label="Filtrar solicitudes de arriendo">
                <div className="bar-filtros">
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-estado-arriendo">Estado</label>
                        <select
                            id="filtro-estado-arriendo"
                            value={filtroEstado}
                            onChange={(event) => setFiltroEstado(event.target.value)}
                        >
                            <option value="">Todos</option>
                            {ESTADOS_ARRIENDO.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grupo-filtro">
                        <Link to="/arriendos/nueva" className="boton boton-filtrar">
                            Nueva solicitud
                        </Link>
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Listado de solicitudes</h2>
                {solicitudes.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Solicitudes de arriendo">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Ingreso mensual</th>
                                    <th scope="col">Garantía</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Observaciones</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id}>
                                        <th scope="row">
                                            <Link
                                                to={`/propiedades/${solicitud.propiedadId}`}
                                                className="link-detalle"
                                            >
                                                {solicitud.propiedadTitulo}
                                            </Link>
                                        </th>
                                        <td>
                                            {solicitud.clienteNombre}
                                            <div className="subtexto-tabla">
                                                {solicitud.clienteEmail}
                                            </div>
                                            <div className="subtexto-tabla">
                                                {solicitud.clienteTelefono}
                                            </div>
                                        </td>
                                        <td>
                                            ${Number(solicitud.ingresoMensual).toLocaleString('es-CL')}
                                            <div className="subtexto-tabla">
                                                {solicitud.antecedentes}
                                            </div>
                                        </td>
                                        <td>{solicitud.garantia}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    CLASES_BADGE[solicitud.estado] || 'disponible'
                                                }`}
                                            >
                                                {solicitud.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {editandoId === solicitud.id ? (
                                                <div className="edicion-visita">
                                                    <label
                                                        className="visually-hidden"
                                                        htmlFor={`obs-${solicitud.id}`}
                                                    >
                                                        Observaciones
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id={`obs-${solicitud.id}`}
                                                        placeholder="Observaciones del evaluador"
                                                        value={formEvaluacion.observaciones}
                                                        onChange={(event) =>
                                                            setFormEvaluacion((prev) => ({
                                                                ...prev,
                                                                observaciones: event.target.value
                                                            }))
                                                        }
                                                    />
                                                    <label
                                                        className="visually-hidden"
                                                        htmlFor={`motivo-${solicitud.id}`}
                                                    >
                                                        Motivo
                                                    </label>
                                                    <select
                                                        id={`motivo-${solicitud.id}`}
                                                        value={formEvaluacion.motivo}
                                                        onChange={(event) =>
                                                            setFormEvaluacion((prev) => ({
                                                                ...prev,
                                                                motivo: event.target.value
                                                            }))
                                                        }
                                                    >
                                                        {MOTIVOS_ARRIENDO.map((motivo) => (
                                                            <option key={motivo} value={motivo}>
                                                                {motivo || 'Sin motivo'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="acciones-tabla">
                                                        <button
                                                            type="button"
                                                            className="boton boton-mini boton-secundario"
                                                            onClick={cancelarEvaluacion}
                                                        >
                                                            Cerrar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {solicitud.observacionesEjecutivo || '—'}
                                                    {solicitud.motivo ? (
                                                        <div className="subtexto-tabla">
                                                            Motivo: {solicitud.motivo}
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            <div className="acciones-tabla">{acciones(solicitud)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay solicitudes de arriendo con este filtro.
                    </p>
                )}
            </section>
        </main>
    );
}
