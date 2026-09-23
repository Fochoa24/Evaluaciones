import { Link } from 'react-router-dom';
import { useVisitas } from '../context/VisitasContext';

export default function Visitas() {
    const { visitas, actualizarEstado, eliminar } = useVisitas();

    const alternarEstado = (visita) => {
        actualizarEstado(visita.id, visita.estado === 'Pendiente' ? 'Atendida' : 'Pendiente');
    };

    const eliminarVisita = (visita) => {
        if (window.confirm(`¿Eliminar la solicitud de visita de ${visita.nombre}?`)) {
            eliminar(visita.id);
        }
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">SOLICITUDES DE VISITA</p>
                <h1>Visitas coordinadas</h1>
            </section>

            <section className="table-panel">
                <h2>Listado de solicitudes</h2>
                {visitas.length ? (
                    <div className="tabla-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Propiedad</th>
                                    <th>Interesado</th>
                                    <th>Contacto</th>
                                    <th>Fecha y hora</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitas.map((visita) => (
                                    <tr key={visita.id}>
                                        <td>
                                            <Link to={`/propiedades/${visita.propiedadId}`} className="link-detalle">
                                                {visita.propiedadTitulo}
                                            </Link>
                                        </td>
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
                                            {visita.fecha} {visita.hora}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    visita.estado === 'Pendiente' ? 'reservada' : 'disponible'
                                                }`}
                                            >
                                                {visita.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones-tabla">
                                                <button
                                                    type="button"
                                                    className="boton boton-mini"
                                                    onClick={() => alternarEstado(visita)}
                                                >
                                                    {visita.estado === 'Pendiente' ? 'Atender' : 'Reabrir'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="boton boton-mini boton-peligro"
                                                    onClick={() => eliminarVisita(visita)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible">
                        Aún no hay solicitudes de visita. Puedes pedirla desde el detalle de cada propiedad.
                    </p>
                )}
            </section>
        </main>
    );
}
