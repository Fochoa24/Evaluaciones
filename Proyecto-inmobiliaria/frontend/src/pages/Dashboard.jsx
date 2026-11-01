import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import { useArriendos } from '../context/ArriendosContext';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { useVisitas } from '../context/VisitasContext';
import { ROLES_INTERNOS } from '../data/roles';

const pesos = (n) => `$${Math.round(n).toLocaleString('es-CL')}`;
const contar = (lista, ...estados) => lista.filter((item) => estados.includes(item.estado)).length;
const sumarPrecios = (lista, ...estados) =>
    lista.filter((p) => estados.includes(p.estado)).reduce((acc, p) => acc + (p.precioMensual || 0), 0);

/** Panel según el rol (F16): el cliente ve lo suyo; los demás, el portafolio a su cargo. */
export default function Dashboard() {
    const { user } = useAuth();
    return user.rol === 'cliente' ? <PanelCliente /> : <PanelGestion />;
}

function Tarjetas({ stats, etiqueta }) {
    return (
        <section className="dashboard-stats" aria-label={etiqueta}>
            {stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                    <span className="stat-label">{stat.label}</span>
                    <strong className="stat-value">{stat.value}</strong>
                </article>
            ))}
        </section>
    );
}

/** "Mi panel" del cliente (F17): próximas visitas y solicitudes que piden algo de él. */
function PanelCliente() {
    const { user } = useAuth();
    const { visitas } = useVisitas();
    const { arriendos } = useArriendos();

    const proximas = visitas
        .filter((v) => ['Pendiente', 'Confirmada'].includes(v.estado))
        .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
    const porReactivar = arriendos.filter((a) => a.estado === 'Vencida');

    const stats = [
        { label: 'Visitas próximas', value: proximas.length },
        { label: 'Solicitudes en curso', value: contar(arriendos, 'Pendiente', 'En evaluación', 'Esperando propietario') },
        { label: 'Por reactivar', value: porReactivar.length },
        { label: 'Aprobadas', value: contar(arriendos, 'Aprobada') }
    ];

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">MI PANEL</p>
                <h1>Hola, {user.nombre}</h1>
                <div className="acciones-detalle">
                    <Link to="/propiedades" className="boton boton-ver">Buscar propiedades</Link>
                    <Link to="/visitas" className="boton boton-ver">Mis visitas</Link>
                    <Link to="/arriendos" className="boton boton-ver">Mis solicitudes</Link>
                    <Link to="/cuenta" className="boton boton-ver">Mi cuenta</Link>
                </div>
            </section>

            <Tarjetas stats={stats} etiqueta="Resumen de mi actividad" />

            {porReactivar.length > 0 && (
                <p className="mensaje error visible" role="status">
                    {porReactivar.length === 1 ? 'Una solicitud venció' : `${porReactivar.length} solicitudes vencieron`} porque
                    el propietario no respondió a tiempo. <Link to="/arriendos">Reactívala en Mis solicitudes</Link>.
                </p>
            )}

            <section className="table-panel">
                <h2>Próximas visitas</h2>
                {proximas.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Mis próximas visitas">
                            <thead>
                                <tr>
                                    <th scope="col">Propiedad</th>
                                    <th scope="col">Fecha y hora</th>
                                    <th scope="col">Ejecutivo</th>
                                    <th scope="col">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proximas.map((v) => (
                                    <tr key={v.id}>
                                        <th scope="row">
                                            <Link to={`/propiedades/${v.propiedadId}`} className="link-detalle">{v.propiedadTitulo}</Link>
                                        </th>
                                        <td>{v.fecha} {v.hora}</td>
                                        <td>{v.ejecutivoNombre}</td>
                                        <td>
                                            {v.estado}
                                            {v.estado === 'Confirmada' && (
                                                <div className="subtexto-tabla">La dirección está en el detalle de la propiedad</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No tienes visitas agendadas. Agenda una desde el detalle de una propiedad publicada.
                    </p>
                )}
            </section>
        </main>
    );
}

/** Panel de admin (todo), ejecutivo (su cartera) y propietario (lo suyo). */
function PanelGestion() {
    const { user } = useAuth();
    const { propiedades } = usePropiedades();
    const { visitas } = useVisitas();
    const { arriendos } = useArriendos();

    const interno = ROLES_INTERNOS.includes(user.rol);
    // Visitas y solicitudes ya llegan filtradas por la API; las propiedades no (el catálogo es más amplio).
    const alcance = {
        admin: () => propiedades,
        ejecutivo: () => propiedades.filter((p) => p.ejecutivoId === user.id),
        propietario: () => propiedades.filter((p) => p.propietarioId === user.id)
    }[user.rol]();
    const titulo = { admin: 'Resumen del portafolio', ejecutivo: 'Tu cartera', propietario: 'Tus propiedades' }[user.rol];

    const stats = [
        { label: 'Propiedades', value: contar(alcance, 'Disponible', 'Publicada', 'Reservada', 'Arrendada', 'En mantención') },
        { label: 'Por publicar', value: contar(alcance, 'Disponible') },
        { label: 'Publicadas', value: contar(alcance, 'Publicada') },
        { label: 'Reservadas', value: contar(alcance, 'Reservada') },
        { label: 'Arrendadas', value: contar(alcance, 'Arrendada') },
        // Vigente: lo que se cobra hoy. Potencial: lo que entraría si se arriendan las ofrecidas.
        { label: 'Arriendo vigente / mes', value: pesos(sumarPrecios(alcance, 'Arrendada')) },
        { label: 'Arriendo potencial / mes', value: pesos(sumarPrecios(alcance, 'Publicada', 'Reservada')) },
        { label: 'Visitas pendientes', value: contar(visitas, 'Pendiente') },
        { label: 'Visitas confirmadas', value: contar(visitas, 'Confirmada') },
        interno
            ? { label: 'Solicitudes por evaluar', value: contar(arriendos, 'Pendiente', 'En evaluación') }
            : { label: 'Solicitudes por responder', value: contar(arriendos, 'Esperando propietario') },
        interno && { label: 'Esperando al dueño', value: contar(arriendos, 'Esperando propietario') },
        interno && { label: 'Vencidas', value: contar(arriendos, 'Vencida') }
    ].filter(Boolean);

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">{interno ? 'PANEL ADMINISTRATIVO' : 'MI PANEL'}</p>
                <h1>{titulo}</h1>
                <div className="acciones-detalle">
                    <Link to="/propiedades/nueva" className="boton boton-ver">Nueva propiedad</Link>
                    <Link to="/visitas" className="boton boton-ver">Ver visitas</Link>
                    <Link to="/arriendos" className="boton boton-ver">Ver arriendos</Link>
                    {interno && (
                        <>
                            <Link to="/usuarios" className="boton boton-ver">Usuarios</Link>
                            <Link to="/clientes" className="boton boton-ver">Clientes</Link>
                        </>
                    )}
                </div>
            </section>

            <Tarjetas stats={stats} etiqueta="Métricas del negocio" />

            <section className="table-panel">
                <h2>{titulo}</h2>
                <div className="tabla-wrap">
                    <table aria-label={titulo}>
                        <thead>
                            <tr>
                                <th scope="col">Propiedad</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Comuna</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Gastos</th>
                                {user.rol === 'admin' && <th scope="col">Ejecutivo</th>}
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alcance.map((propiedad) => (
                                <tr key={propiedad.id}>
                                    <th scope="row">{propiedad.titulo}</th>
                                    <td>{propiedad.tipo}</td>
                                    <td>{propiedad.comuna}</td>
                                    <td><Badge estado={propiedad.estado} /></td>
                                    <td>{pesos(propiedad.precioMensual)}</td>
                                    <td>{pesos(propiedad.gastosComunes || 0)}</td>
                                    {user.rol === 'admin' && <td>{propiedad.ejecutivoNombre}</td>}
                                    <td>
                                        {/* Cambios de estado y bajas: desde el detalle (§5.1). */}
                                        <div className="acciones-tabla">
                                            <Link
                                                to={`/propiedades/${propiedad.id}`}
                                                className="boton boton-mini boton-secundario"
                                                aria-label={`Ver detalle de ${propiedad.titulo}`}
                                            >
                                                Ver
                                            </Link>
                                            {propiedad.puedeEditar && (
                                                <Link
                                                    to={`/propiedades/${propiedad.id}/editar`}
                                                    className="boton boton-mini"
                                                    aria-label={`Editar ${propiedad.titulo}`}
                                                >
                                                    Editar
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
