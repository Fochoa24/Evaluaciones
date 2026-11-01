import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVisitas } from '../context/VisitasContext';
import { ESTADOS_VISITA, HORAS_VISITA, RESULTADOS_VISITA } from '../data/flujo';
import { ROLES_INTERNOS } from '../data/roles';

const CLASES_BADGE = {
    Pendiente: 'reservada',
    Confirmada: 'disponible',
    Rechazada: 'vendida',
    Cancelada: 'vendida',
    Realizada: 'disponible'
};

/** Texto del botón para cada destino que entrega la API en `transiciones`. */
const ETIQUETAS = { Confirmada: 'Confirmar', Rechazada: 'Rechazar', Cancelada: 'Cancelar', Realizada: 'Realizada' };

/**
 * Visitas según el rol (§8): el ejecutivo ve su cartera y el admin todas;
 * el cliente, las suyas; el propietario, las de sus propiedades sin datos
 * de contacto. Los botones salen de `transiciones` y `puedeReprogramar`.
 */
export default function Visitas() {
    const { user } = useAuth();
    const { visitas, cargando, error, reprogramar, cambiarEstado, eliminar } = useVisitas();
    const [filtroEstado, setFiltroEstado] = useState('');
    // { id, modo: 'reprogramar' | 'realizar', fecha, hora, resultado }
    const [edicion, setEdicion] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const interno = ROLES_INTERNOS.includes(user.rol);
    const esCliente = user.rol === 'cliente';
    const visitasFiltradas = filtroEstado ? visitas.filter((item) => item.estado === filtroEstado) : visitas;

    const informar = (r, exito) =>
        setMensaje(r.ok ? { texto: exito, tipo: 'success' } : { texto: r.mensaje, tipo: 'error' });

    const abrir = (visita, modo) => {
        setEdicion({ id: visita.id, modo, fecha: visita.fecha, hora: visita.hora, resultado: '' });
        setMensaje({ texto: '', tipo: 'success' });
    };
    const cambiarCampo = (campo) => (event) => setEdicion((prev) => ({ ...prev, [campo]: event.target.value }));

    const aplicar = async (visita, destino) => {
        if (destino === 'Realizada') return abrir(visita, 'realizar');
        if (destino === 'Cancelada' && !window.confirm(`¿Cancelar la visita del ${visita.fecha} a las ${visita.hora}?`)) return;
        const r = await cambiarEstado(visita.id, destino);
        informar(r, `Visita ${destino.toLowerCase()}.`);
    };

    const guardarEdicion = async () => {
        const r = edicion.modo === 'reprogramar'
            ? await reprogramar(edicion.id, { fecha: edicion.fecha, hora: edicion.hora })
            : await cambiarEstado(edicion.id, 'Realizada', edicion.resultado);
        informar(r, edicion.modo === 'reprogramar' ? 'Visita reprogramada.' : 'Visita cerrada como realizada.');
        if (r.ok) setEdicion(null);
    };

    const eliminarVisita = async (visita) => {
        if (!window.confirm(`¿Eliminar definitivamente la visita de ${visita.nombre}?`)) return;
        informar(await eliminar(visita.id), 'Visita eliminada.');
    };

    const formularioEdicion = (visita) => (
        <div className="edicion-visita">
            {edicion.modo === 'reprogramar' ? (
                <>
                    <label className="visually-hidden" htmlFor={`fecha-${visita.id}`}>Nueva fecha</label>
                    <input type="date" id={`fecha-${visita.id}`} value={edicion.fecha} onChange={cambiarCampo('fecha')} />
                    <label className="visually-hidden" htmlFor={`hora-${visita.id}`}>Nueva hora</label>
                    <select id={`hora-${visita.id}`} value={edicion.hora} onChange={cambiarCampo('hora')}>
                        {HORAS_VISITA.map((hora) => (
                            <option key={hora} value={hora}>{hora}</option>
                        ))}
                    </select>
                </>
            ) : (
                <>
                    <label className="visually-hidden" htmlFor={`resultado-${visita.id}`}>Resultado</label>
                    <select id={`resultado-${visita.id}`} value={edicion.resultado} onChange={cambiarCampo('resultado')}>
                        {RESULTADOS_VISITA.map((resultado) => (
                            <option key={resultado} value={resultado}>{resultado || 'Elige el resultado'}</option>
                        ))}
                    </select>
                </>
            )}
            <div className="acciones-tabla">
                <button type="button" className="boton boton-mini" onClick={guardarEdicion}>Guardar</button>
                <button type="button" className="boton boton-mini boton-secundario" onClick={() => setEdicion(null)}>
                    Volver
                </button>
            </div>
        </div>
    );

    const acciones = (visita) => (
        <div className="acciones-tabla">
            {visita.transiciones.map((destino) => (
                <button
                    key={destino}
                    type="button"
                    className={`boton boton-mini${['Rechazada', 'Cancelada'].includes(destino) ? ' boton-secundario' : ''}`}
                    onClick={() => aplicar(visita, destino)}
                    aria-label={`${ETIQUETAS[destino]} visita del ${visita.fecha} a las ${visita.hora}`}
                >
                    {ETIQUETAS[destino]}
                </button>
            ))}
            {visita.puedeReprogramar && (
                <button type="button" className="boton boton-mini boton-secundario" onClick={() => abrir(visita, 'reprogramar')}>
                    Reprogramar
                </button>
            )}
            {user.rol === 'admin' && (
                <button type="button" className="boton boton-mini boton-peligro" onClick={() => eliminarVisita(visita)}>
                    Eliminar
                </button>
            )}
        </div>
    );

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">{esCliente ? 'MIS VISITAS' : 'SOLICITUDES DE VISITA'}</p>
                <h1>{esCliente ? 'Mis visitas agendadas' : 'Gestión de visitas y agenda'}</h1>
                <p className="subtitulo-login">
                    {interno
                        ? 'Confirma, rechaza, reprograma o cierra las visitas de tu cartera. El sistema evita choques de horario y respeta el tiempo de traslado.'
                        : esCliente
                            ? 'Cuando el ejecutivo confirme una visita, verás la dirección exacta en el detalle de la propiedad y te llegará por correo.'
                            : 'Visitas agendadas a tus propiedades. Los datos de contacto los gestiona tu ejecutivo.'}
                </p>
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
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Listado de visitas</h2>
                {cargando && !visitas.length ? (
                    <p role="status">Cargando visitas...</p>
                ) : error ? (
                    <p className="mensaje error visible" role="alert">{error}</p>
                ) : visitasFiltradas.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Visitas agendadas">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    {interno && <th scope="col">Interesado</th>}
                                    {interno && <th scope="col">Contacto</th>}
                                    <th scope="col">Fecha y hora</th>
                                    <th scope="col">Ejecutivo</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Resultado</th>
                                    {user.rol !== 'propietario' && <th scope="col">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {visitasFiltradas.map((visita) => (
                                    <tr key={visita.id}>
                                        <th scope="row">
                                            <Link to={`/propiedades/${visita.propiedadId}`} className="link-detalle">
                                                {visita.propiedadTitulo}
                                            </Link>
                                        </th>
                                        {interno && (
                                            <td>
                                                {visita.nombre}
                                                {visita.comentarios && <div className="subtexto-tabla">{visita.comentarios}</div>}
                                            </td>
                                        )}
                                        {interno && (
                                            <td>
                                                {visita.email}
                                                <div className="subtexto-tabla">{visita.telefono}</div>
                                            </td>
                                        )}
                                        <td>
                                            {visita.fecha} {visita.hora}
                                        </td>
                                        <td>{visita.ejecutivoNombre}</td>
                                        <td>
                                            <span className={`badge ${CLASES_BADGE[visita.estado] || 'disponible'}`}>
                                                {visita.estado}
                                            </span>
                                            {visita.reasignada && (
                                                <div className="subtexto-tabla">Reasignada: revisar horario</div>
                                            )}
                                        </td>
                                        <td>
                                            {visita.resultado || <span className="subtexto-tabla">Sin resultado</span>}
                                        </td>
                                        {user.rol !== 'propietario' && (
                                            <td>{edicion?.id === visita.id ? formularioEdicion(visita) : acciones(visita)}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay visitas con este filtro.
                        {!interno && ' Puedes agendar una desde el detalle de cada propiedad publicada.'}
                    </p>
                )}
            </section>
        </main>
    );
}
