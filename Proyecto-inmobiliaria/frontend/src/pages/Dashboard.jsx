import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { useVisitas } from '../context/VisitasContext';
import { ROLES_GESTION } from '../data/roles';

export default function Dashboard() {
    const { user } = useAuth();
    const { propiedades, eliminar } = usePropiedades();
    const { visitas } = useVisitas();

    const puedeGestionar = user && ROLES_GESTION.includes(user.rol);

    const total = propiedades.length;
    const disponibles = propiedades.filter((item) => item.estado === 'Disponible').length;
    const reservadas = propiedades.filter((item) => item.estado === 'Reservada').length;
    const ingreso = propiedades.reduce((acc, item) => acc + item.precioMensual, 0);
    const pendientes = visitas.filter((item) => item.estado === 'Pendiente').length;

    const stats = [
        { label: 'Total propiedades', value: total },
        { label: 'Disponibles', value: disponibles },
        { label: 'Reservadas', value: reservadas },
        { label: 'Ingreso estimado', value: `$${Math.round(ingreso / 1000)}k` },
        { label: 'Visitas pendientes', value: pendientes }
    ];

    const handleEliminar = (propiedad) => {
        if (window.confirm(`¿Eliminar la propiedad "${propiedad.titulo}"?`)) {
            eliminar(propiedad.id);
        }
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">PANEL ADMINISTRATIVO</p>
                <h1>Resumen del portafolio inmobiliario</h1>
                {puedeGestionar && (
                    <div className="acciones-detalle">
                        <Link to="/propiedades/nueva" className="boton boton-ver">
                            Nueva propiedad
                        </Link>
                        <Link to="/visitas" className="boton boton-ver">
                            Ver visitas
                        </Link>
                    </div>
                )}
            </section>

            <section className="dashboard-stats">
                {stats.map((stat) => (
                    <article className="stat-card" key={stat.label}>
                        <span className="stat-label">{stat.label}</span>
                        <strong className="stat-value">{stat.value}</strong>
                    </article>
                ))}
            </section>

            <section className="table-panel">
                <h2>Listado de propiedades</h2>
                <div className="tabla-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Propiedad</th>
                                <th>Tipo</th>
                                <th>Comuna</th>
                                <th>Estado</th>
                                <th>Precio</th>
                                <th>Detalle</th>
                                {puedeGestionar && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {propiedades.map((propiedad) => (
                                <tr key={propiedad.id}>
                                    <td>{propiedad.titulo}</td>
                                    <td>{propiedad.tipo}</td>
                                    <td>{propiedad.comuna}</td>
                                    <td>
                                        <Badge estado={propiedad.estado} />
                                    </td>
                                    <td>${propiedad.precioMensual.toLocaleString('es-CL')}</td>
                                    <td>
                                        <Link to={`/propiedades/${propiedad.id}`} className="link-detalle">
                                            Ver
                                        </Link>
                                    </td>
                                    {puedeGestionar && (
                                        <td>
                                            <div className="acciones-tabla">
                                                <Link
                                                    to={`/propiedades/${propiedad.id}/editar`}
                                                    className="boton boton-mini"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="boton boton-mini boton-peligro"
                                                    onClick={() => handleEliminar(propiedad)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
