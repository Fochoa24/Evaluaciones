import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
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
    const { crear } = useVisitas();

    const propiedad = obtener(id);
    const puedeGestionar = user && ROLES_GESTION.includes(user.rol);
    const hoy = new Date().toISOString().split('T')[0];

    const [solicitud, setSolicitud] = useState(() => ({
        ...solicitudInicial,
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || ''
    }));
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    if (!propiedad) {
        return (
            <main className="seccion detalle-main">
                <p className="mensaje error visible">No se encontró la propiedad solicitada.</p>
            </main>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSolicitud((prev) => ({ ...prev, [name]: value }));
    };

    const solicitarVisita = (event) => {
        event.preventDefault();

        if (!solicitud.nombre.trim() || !solicitud.email.trim() || !solicitud.fecha || !solicitud.hora) {
            setMensaje({
                texto: 'Completa nombre, correo, fecha y hora para solicitar la visita.',
                tipo: 'error'
            });
            return;
        }

        crear({
            propiedadId: propiedad.id,
            propiedadTitulo: propiedad.titulo,
            nombre: solicitud.nombre.trim(),
            email: solicitud.email.trim(),
            telefono: solicitud.telefono.trim(),
            fecha: solicitud.fecha,
            hora: solicitud.hora,
            comentarios: solicitud.comentarios.trim()
        });

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
                            <li>📍 Comuna: {propiedad.comuna}</li>
                            <li>🏠 Dirección: {propiedad.direccion || 'Sin dirección registrada'}</li>
                            <li>🛏️ Dormitorios: {propiedad.dormitorios}</li>
                            <li>🚿 Baños: {propiedad.banos}</li>
                            <li>📐 Superficie: {propiedad.superficie} m²</li>
                        </ul>

                        <div className="acciones-detalle">
                            <Link to="/propiedades" className="boton boton-ver">
                                Volver al catálogo
                            </Link>
                            {puedeGestionar && (
                                <>
                                    <Link to={`/propiedades/${propiedad.id}/editar`} className="boton boton-ver">
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
                    </div>
                </article>
            </section>

            <section className="tarjeta-form seccion-visita">
                <h2>Solicitar visita</h2>
                <p className="subtitulo-login">
                    Elige la fecha y hora que prefieras y coordinamos el recorrido.
                </p>

                <form onSubmit={solicitarVisita} className="formulario-propiedad">
                    <div className="campo">
                        <label htmlFor="nombre-visita">Nombre</label>
                        <input
                            type="text"
                            id="nombre-visita"
                            name="nombre"
                            value={solicitud.nombre}
                            onChange={handleChange}
                            required
                        />
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
                        />
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
                        />
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
                        />
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
