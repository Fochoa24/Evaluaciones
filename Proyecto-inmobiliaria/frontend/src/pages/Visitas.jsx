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
                        <table aria-label="Solicitudes de visita coordinadas">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    <th scope="col">Interesado</th>
                                    <th scope="col">Contacto</th>
                                    <th scope="col">Fecha y hora</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitas.map((visita) => (
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
                                                    aria-label={
                                                        visita.estado === 'Pendiente'
                                                            ? `Atender visita de ${visita.nombre}`
                                                            : `Reabrir visita de ${visita.nombre}`
                                                    }
                                                >
                                                    {visita.estado === 'Pendiente' ? 'Atender' : 'Reabrir'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="boton boton-mini boton-peligro"
                                                    onClick={() => eliminarVisita(visita)}
                                                    aria-label={`Eliminar visita de ${visita.nombre}`}
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
                    <p className="mensaje sin-resultados visible" role="status">
                        Aún no hay solicitudes de visita. Puedes pedirla desde el detalle de cada propiedad.
                    </p>
                )}
            </section>
        </main>
    );
}
