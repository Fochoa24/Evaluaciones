import { Link } from 'react-router-dom';

export default function PropiedadCard({ propiedad }) {
    const estadoClase = propiedad.estado === 'Reservada' ? 'reservada' : 'disponible';
    const dormitoriosTexto = propiedad.dormitorios > 0 ? `${propiedad.dormitorios} Dorm.` : 'Planta libre';

    return (
        <article className="tarjeta-propiedad">
            <div className="imagen-contenedor">
                <img src={propiedad.imagen} alt={propiedad.titulo} />
                <span className={`insignia-estado ${estadoClase}`}>{propiedad.estado}</span>
            </div>
            <div className="info-propiedad">
                <span className="tipo-propiedad">{propiedad.tipo}</span>
                <h3>{propiedad.titulo}</h3>
                <p className="ubicacion">{propiedad.ubicacion}</p>

                <div className="detalles-tecnicos">
                    <span>🛏️ {dormitoriosTexto}</span>
                    <span>🚿 {propiedad.banos} Baños</span>
                    <span>📐 {propiedad.superficie} m²</span>
                </div>

                <div className="precio-accion">
                    <p className="precio">${propiedad.precioMensual.toLocaleString('es-CL')} / mes</p>
                    <Link to={`/propiedades/${propiedad.id}`} className="boton boton-ver">
                        Ver Detalle
                    </Link>
                </div>
            </div>
        </article>
    );
}
