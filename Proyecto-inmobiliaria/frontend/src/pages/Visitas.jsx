import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvisoFicticio from '../components/AvisoFicticio';
import { useVisitas } from '../context/VisitasContext';
import { ESTADOS_VISITA, RESULTADOS_VISITA } from '../data/flujo';

const CLASES_BADGE = {
    Pendiente: 'reservada',
    Confirmada: 'disponible',
    Rechazada: 'vendida',
    Cancelada: 'vendida',
    Realizada: 'disponible'
};

export default function Visitas() {
    const { visitas, actualizar, actualizarEstado, eliminar, hayConflicto } = useVisitas();
    const [filtroEstado, setFiltroEstado] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicion, setFormEdicion] = useState({ fecha: '', hora: '', resultado: '' });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const visitasFiltradas = filtroEstado
        ? visitas.filter((item) => item.estado === filtroEstado)
        : visitas;

    const abrirEdicion = (visita) => {
        setEditandoId(visita.id);
        setFormEdicion({
            fecha: visita.fecha,
            hora: visita.hora,
            resultado: visita.resultado || ''
        });
        setMensaje({ texto: '', tipo: 'success' });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setMensaje({ texto: '', tipo: 'success' });
    };

    const guardarEdicion = (visita) => {
        const conflicto = hayConflicto({
            fecha: formEdicion.fecha,
            hora: formEdicion.hora,
            excluirId: visita.id
        });

        if (conflicto) {
            setMensaje({
                texto: `Horario en conflicto: ya hay una visita activa el ${formEdicion.fecha} a las ${formEdicion.hora}.`,
                tipo: 'error'
            });
            return;
        }

        actualizar(visita.id, {
            fecha: formEdicion.fecha,
            hora: formEdicion.hora,
            resultado: formEdicion.resultado
        });

        setEditandoId(null);
        setMensaje({ texto: 'Visita actualizada correctamente.', tipo: 'success' });
    };

    const confirmar = (visita) => {
        actualizarEstado(visita.id, 'Confirmada');
        setMensaje({ texto: `Visita de ${visita.nombre} confirmada.`, tipo: 'success' });
    };

    const rechazar = (visita) => {
        actualizarEstado(visita.id, 'Rechazada');
        setMensaje({ texto: `Visita de ${visita.nombre} rechazada.`, tipo: 'success' });
    };

    const cancelar = (visita) => {
        actualizarEstado(visita.id, 'Cancelada');
        setMensaje({ texto: `Visita de ${visita.nombre} cancelada.`, tipo: 'success' });
    };

    const marcarRealizada = (visita) => {
        const resultado = visita.resultado || 'Interesado en arrendar';
        actualizarEstado(visita.id, 'Realizada', { resultado });
        setMensaje({ texto: `Visita de ${visita.nombre} cerrada como realizada.`, tipo: 'success' });
    };

    const eliminarVisita = (visita) => {
        if (window.confirm(`¿Eliminar la solicitud de visita de ${visita.nombre}?`)) {
            eliminar(visita.id);
            setMensaje({ texto: 'Solicitud eliminada.', tipo: 'success' });
        }
    };

    const accionesPorEstado = (visita) => {
        const acciones = [];

        if (['Pendiente', 'Confirmada'].includes(visita.estado)) {
            acciones.push(
                <button
                    key="confirmar"
                    type="button"
                    className="boton boton-mini"
                    onClick={() => confirmar(visita)}
                    aria-label={`Confirmar visita de ${visita.nombre}`}
                    disabled={visita.estado === 'Confirmada'}
                >
                    Confirmar
                </button>,
                <button
                    key="rechazar"
                    type="button"
                    className="boton boton-mini boton-secundario"
                    onClick={() => rechazar(visita)}
                    aria-label={`Rechazar visita de ${visita.nombre}`}
                >
                    Rechazar
                </button>,
                <button
                    key="cancelar"
                    type="button"
                    className="boton boton-mini boton-secundario"
                    onClick={() => cancelar(visita)}
                    aria-label={`Cancelar visita de ${visita.nombre}`}
                >
                    Cancelar
                </button>,
                <button
                    key="realizada"
                    type="button"
                    className="boton boton-mini"
                    onClick={() => marcarRealizada(visita)}
                    aria-label={`Marcar visita de ${visita.nombre} como realizada`}
                >
                    Realizada
                </button>
            );
        }

        if (visita.estado === 'Realizada') {
            acciones.push(
                <button
                    key="resultado"
                    type="button"
                    className="boton boton-mini"
                    onClick={() => abrirEdicion(visita)}
                    aria-label={`Registrar resultado de visita de ${visita.nombre}`}
                >
                    Resultado
                </button>
            );
        }

        if (['Pendiente', 'Confirmada'].includes(visita.estado)) {
            acciones.push(
                <button
                    key="editar"
                    type="button"
                    className="boton boton-mini boton-secundario"
                    onClick={() => abrirEdicion(visita)}
                    aria-label={`Reprogramar visita de ${visita.nombre}`}
                >
                    Reprogramar
                </button>
            );
        }

        acciones.push(
            <button
                key="eliminar"
                type="button"
                className="boton boton-mini boton-peligro"
                onClick={() => eliminarVisita(visita)}
                aria-label={`Eliminar visita de ${visita.nombre}`}
            >
                Eliminar
            </button>
        );

        return acciones;
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">SOLICITUDES DE VISITA</p>
                <h1>Gestión de visitas y agenda</h1>
                <p className="subtitulo-login">
                    Confirma, rechaza, reprograma o cierra visitas. El sistema evita superposiciones
                    de horario en la agenda.
                </p>
                <AvisoFicticio texto="Las citas agendadas que ves son de demostración y no corresponden a visitas reales de la inmobiliaria." />
            </section>

            {mensaje.texto && (
                <p
                    className={`mensaje ${mensaje.tipo === 'error' ? 'error' : ''} visible`}
                    role={mensaje.tipo === 'error' ? 'alert' : 'status'}
                >
                    {mensaje.texto}
                </p>
            )}

            <section className="contenedor-filtros" aria-label="Filtrar visitas">
                <div className="bar-filtros">
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-estado-visita">Estado</label>
                        <select
                            id="filtro-estado-visita"
                            value={filtroEstado}
                            onChange={(event) => setFiltroEstado(event.target.value)}
                        >
                            <option value="">Todos</option>
                            {ESTADOS_VISITA.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Listado de solicitudes</h2>
                {visitasFiltradas.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Solicitudes de visita coordinadas">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    <th scope="col">Interesado</th>
                                    <th scope="col">Contacto</th>
                                    <th scope="col">Fecha y hora</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Resultado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitasFiltradas.map((visita) => (
                                    <tr key={visita.id}>
                                        <th scope="row">
                                            <Link
                                                to={`/propiedades/${visita.propiedadId}`}
                                                className="link-detalle"
                                            >
                                                {visita.propiedadTitulo}
                                            </Link>
                                        </th>
                                        <td>
                                            {visita.nombre}
                                            {visita.comentarios ? (
                                                <div className="subtexto-tabla">{visita.comentarios}</div>
                                            ) : null}
                                        </td>
                                        <td>
                                            {visita.email}
                                            <div className="subtexto-tabla">{visita.telefono}</div>
                                        </td>
                                        <td>
                                            {editandoId === visita.id ? (
                                                <div className="edicion-visita">
                                                    <label className="visually-hidden" htmlFor={`fecha-${visita.id}`}>
                                                        Nueva fecha
                                                    </label>
                                                    <input
                                                        type="date"
                                                        id={`fecha-${visita.id}`}
                                                        value={formEdicion.fecha}
                                                        onChange={(event) =>
                                                            setFormEdicion((prev) => ({
                                                                ...prev,
                                                                fecha: event.target.value
                                                            }))
                                                        }
                                                    />
                                                    <label className="visually-hidden" htmlFor={`hora-${visita.id}`}>
                                                        Nueva hora
                                                    </label>
                                                    <input
                                                        type="time"
                                                        id={`hora-${visita.id}`}
                                                        value={formEdicion.hora}
                                                        onChange={(event) =>
                                                            setFormEdicion((prev) => ({
                                                                ...prev,
                                                                hora: event.target.value
                                                            }))
                                                        }
                                                    />
                                                    <label
                                                        className="visually-hidden"
                                                        htmlFor={`resultado-${visita.id}`}
                                                    >
                                                        Resultado
                                                    </label>
                                                    <select
                                                        id={`resultado-${visita.id}`}
                                                        value={formEdicion.resultado}
                                                        onChange={(event) =>
                                                            setFormEdicion((prev) => ({
                                                                ...prev,
                                                                resultado: event.target.value
                                                            }))
                                                        }
                                                    >
                                                        {RESULTADOS_VISITA.map((resultado) => (
                                                            <option key={resultado} value={resultado}>
                                                                {resultado || 'Sin resultado'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="acciones-tabla">
                                                        <button
                                                            type="button"
                                                            className="boton boton-mini"
                                                            onClick={() => guardarEdicion(visita)}
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="boton boton-mini boton-secundario"
                                                            onClick={cancelarEdicion}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {visita.fecha} {visita.hora}
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${CLASES_BADGE[visita.estado] || 'disponible'}`}
                                            >
                                                {visita.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {visita.resultado || (
                                                <span className="subtexto-tabla">Sin resultado</span>
                                            )}
                                        </td>
                                        <td>
                                            {editandoId === visita.id ? null : (
                                                <div className="acciones-tabla">
                                                    {accionesPorEstado(visita)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay solicitudes con este filtro. Puedes pedirlas desde el detalle de cada
                        propiedad.
                    </p>
                )}
            </section>
        </main>
    );
}
