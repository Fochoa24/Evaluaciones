import { useNavigate } from 'react-router-dom';
import PropiedadForm from '../components/PropiedadForm';
import { usePropiedades } from '../context/PropiedadesContext';

export default function PropiedadNueva() {
    const navigate = useNavigate();
    const { crear } = usePropiedades();

    const handleSubmit = (valores) => {
        const nueva = crear(valores);
        navigate(`/propiedades/${nueva.id}`);
    };

    return (
        <main className="seccion">
            <section className="encabezado-catalogo">
                <p className="etiqueta">GESTIÓN DE INMUEBLES</p>
                <h1>Nueva propiedad</h1>
            </section>

            <section className="tarjeta-form">
                <PropiedadForm onSubmit={handleSubmit} textoBoton="Publicar propiedad" />
            </section>
        </main>
    );
}
