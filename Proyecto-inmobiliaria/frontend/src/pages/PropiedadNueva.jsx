import { useNavigate } from 'react-router-dom';
import PropiedadForm from '../components/PropiedadForm';
import { usePropiedades } from '../context/PropiedadesContext';

export default function PropiedadNueva() {
    const navigate = useNavigate();
    const { crear } = usePropiedades();

    const handleSubmit = async (valores) => {
        const resultado = await crear(valores);
        if (resultado.ok) {
            navigate(`/propiedades/${resultado.datos.id}`, {
                state: {
                    aviso: {
                        texto: 'Propiedad creada como Disponible: el ejecutivo responsable la revisará y publicará.',
                        tipo: 'success'
                    }
                }
            });
        }
        return resultado;
    };

    return (
        <main className="seccion">
            <section className="encabezado-catalogo">
                <p className="etiqueta">GESTIÓN DE INMUEBLES</p>
                <h1>Nueva propiedad</h1>
            </section>

            <section className="tarjeta-form">
                <PropiedadForm onSubmit={handleSubmit} textoBoton="Crear propiedad" />
            </section>
        </main>
    );
}
