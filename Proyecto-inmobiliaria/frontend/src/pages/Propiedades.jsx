import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Mensaje from '../components/Mensaje';
import PropiedadCard from '../components/PropiedadCard';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { tipoMap } from '../data/propiedades';
import { ROLES_GESTION } from '../data/roles';

const filtrosIniciales = {
    tipo: '',
    comuna: '',
    precio: '',
    dormitorios: ''
};

function filtrarPropiedades(propiedades, filtros) {
    const tipo = filtros.tipo.trim().toLowerCase();
    const comuna = filtros.comuna.trim().toLowerCase();
    const precio = Number(filtros.precio);
    const dormitorios = Number(filtros.dormitorios);

    return propiedades.filter((propiedad) => {
        const coincideTipo = !tipo || propiedad.tipo.toLowerCase() === tipoMap[tipo]?.toLowerCase();
        const coincideComuna = !comuna || propiedad.comuna.toLowerCase().includes(comuna);
        const coincidePrecio = !precio || propiedad.precioMensual <= precio;
        const coincideDormitorios = !dormitorios || propiedad.dormitorios >= dormitorios;

        return coincideTipo && coincideComuna && coincidePrecio && coincideDormitorios;
    });
}

export default function Propiedades() {
    const { user } = useAuth();
    const { propiedades } = usePropiedades();
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const resultados = useMemo(
        () => filtrarPropiedades(propiedades, filtrosAplicados),
        [propiedades, filtrosAplicados]
    );

    const puedeGestionar = user && ROLES_GESTION.includes(user.rol);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = (event) => {
        event.preventDefault();
        setFiltrosAplicados({ ...filtros });

        const lista = filtrarPropiedades(propiedades, filtros);

        if (lista.length) {
            setMensaje({
                texto: `Mostrando ${lista.length} propiedad(es) disponible(s).`,
                tipo: 'success'
            });
        } else {
            setMensaje({
                texto: 'No encontramos propiedades con esos criterios.',
                tipo: 'error'
            });
        }
    };

    return (
        <main className="seccion">
            <section className="encabezado-catalogo encabezado-con-accion">
                <div>
                    <p className="etiqueta">CATÁLOGO DE INMUEBLES</p>
                    <h1>Explora nuestras propiedades disponibles</h1>
                </div>
                {puedeGestionar && (
                    <Link to="/propiedades/nueva" className="boton">
                        Nueva propiedad
                    </Link>
                )}
            </section>

            <section className="contenedor-filtros" aria-label="Filtros de búsqueda">
                <form onSubmit={aplicarFiltros} className="bar-filtros" role="search">
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-tipo">Tipo</label>
                        <select
                            id="filtro-tipo"
                            name="tipo"
                            value={filtros.tipo}
                            onChange={handleChange}
                        >
                            <option value="">Todos</option>
                            <option value="departamento">Departamento</option>
                            <option value="casa">Casa</option>
                            <option value="oficina">Oficina</option>
                            <option value="local">Local Comercial</option>
                        </select>
                    </div>

                    <div className="grupo-filtro">
                        <label htmlFor="filtro-comuna">Comuna</label>
                        <input
                            type="text"
                            id="filtro-comuna"
                            name="comuna"
                            placeholder="Ej: Providencia"
                            value={filtros.comuna}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grupo-filtro">
                        <label htmlFor="filtro-precio">Precio Máximo ($)</label>
                        <input
                            type="number"
                            id="filtro-precio"
                            name="precio"
                            placeholder="Ej: 600000"
                            value={filtros.precio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grupo-filtro">
                        <label htmlFor="filtro-dormitorios">Dormitorios</label>
                        <select
                            id="filtro-dormitorios"
                            name="dormitorios"
                            value={filtros.dormitorios}
                            onChange={handleChange}
                        >
                            <option value="">Cualquiera</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>

                    <button type="submit" className="boton boton-filtrar">
                        Buscar
                    </button>
                </form>
                <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
            </section>

            <section className="propiedades-grilla" aria-live="polite" aria-label="Resultados de propiedades">
                {resultados.length ? (
                    resultados.map((propiedad) => (
                        <PropiedadCard key={propiedad.id} propiedad={propiedad} />
                    ))
                ) : (
                    <div className="mensaje sin-resultados visible" role="status">
                        No se encontraron propiedades con esos filtros.
                    </div>
                )}
            </section>
        </main>
    );
}
