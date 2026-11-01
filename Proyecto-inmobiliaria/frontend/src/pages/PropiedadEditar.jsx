import { Link, useNavigate, useParams } from 'react-router-dom';
import PropiedadForm from '../components/PropiedadForm';
import { usePropiedades } from '../context/PropiedadesContext';

export default function PropiedadEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { obtener, actualizar, cargando } = usePropiedades();
    const propiedad = obtener(id);

    if (!propiedad?.puedeEditar) {
        return (
            <main className="seccion">
                {cargando ? (
                    <p role="status">Cargando propiedad...</p>
                ) : (
                    <p className="mensaje error visible" role="alert">
                        {propiedad
                            ? `No puedes editar esta propiedad (${propiedad.estado}).`
                            : 'No se encontró la propiedad solicitada.'}
                    </p>
                )}
                <Link to="/propiedades" className="boton boton-ver">
                    Volver al catálogo
                </Link>
            </main>
        );
    }

    const handleSubmit = async (valores) => {
        const resultado = await actualizar(propiedad.id, valores);
        if (resultado.ok) {
            const aviso = resultado.datos.volvioARevision
                ? 'Cambios guardados. La propiedad vuelve a revisión (Disponible) hasta que el ejecutivo la publique de nuevo.'
                : 'Cambios guardados.';
            navigate(`/propiedades/${propiedad.id}`, { state: { aviso: { texto: aviso, tipo: 'success' } } });
        }
        return resultado;
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
