import { Link, useNavigate, useParams } from 'react-router-dom';
import PropiedadForm from '../components/PropiedadForm';
import { usePropiedades } from '../context/PropiedadesContext';

export default function PropiedadEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { obtener, actualizar } = usePropiedades();
    const propiedad = obtener(id);

    if (!propiedad) {
        return (
            <main className="seccion">
                <p className="mensaje error visible" role="alert">
                    No se encontró la propiedad solicitada.
                </p>
                <Link to="/propiedades" className="boton boton-ver">
                    Volver al catálogo
                </Link>
            </main>
        );
    }

    const handleSubmit = (valores) => {
        actualizar(propiedad.id, valores);
        navigate(`/propiedades/${propiedad.id}`);
    };

    return (
        <main className="seccion">
            <section className="encabezado-catalogo">
                <p className="etiqueta">GESTIÓN DE INMUEBLES</p>
                <h1>Editar propiedad</h1>
            </section>

            <section className="tarjeta-form">
                <PropiedadForm
                    valoresIniciales={propiedad}
                    onSubmit={handleSubmit}
                    textoBoton="Guardar cambios"
                />
            </section>
        </main>
    );
}
