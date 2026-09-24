import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AvisoFicticio from '../components/AvisoFicticio';
import Mensaje from '../components/Mensaje';
import PropiedadCard from '../components/PropiedadCard';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';
import { usePropietarios } from '../context/PropietariosContext';
import { filtrarPropiedades } from '../services/filtros';
import { ROLES_GESTION } from '../data/roles';

const filtrosIniciales = {
    tipo: '',
    comuna: '',
    precioMin: '',
    precioMax: '',
    dormitorios: '',
    banos: ''
};

export default function Propiedades() {
    const { user } = useAuth();
    const { propiedades } = usePropiedades();
    const { propietarios } = usePropietarios();
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciales);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });

    const propietarioLogueado = useMemo(() => {
        if (!user) return null;
        return propietarios.find((item) => item.usuarioId === user.id) || null;
    }, [propietarios, user]);

    const basePropiedades = useMemo(() => {
        if (user?.rol === 'propietario' && propietarioLogueado) {
            return propiedades.filter((item) => item.propietarioId === propietarioLogueado.id);
        }
        return propiedades;
    }, [propiedades, propietarioLogueado, user]);

    const resultados = useMemo(
        () => filtrarPropiedades(basePropiedades, filtrosAplicados),
        [basePropiedades, filtrosAplicados]
    );

    const puedeGestionar = user && ROLES_GESTION.includes(user.rol);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = (event) => {
        event.preventDefault();
        setFiltrosAplicados({ ...filtros });

        const lista = filtrarPropiedades(basePropiedades, filtros);

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

    const limpiarFiltros = () => {
        setFiltros(filtrosIniciales);
        setFiltrosAplicados(filtrosIniciales);
        setMensaje({ texto: '', tipo: 'success' });
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

            <AvisoFicticio texto="El inventario, precios y estados del catálogo son datos ficticios de demostración académica." />

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
                        <label htmlFor="filtro-precio-min">Precio mínimo ($)</label>
                        <input
                            type="number"
                            id="filtro-precio-min"
                            name="precioMin"
                            min="0"
                            placeholder="Ej: 300000"
                            value={filtros.precioMin}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grupo-filtro">
                        <label htmlFor="filtro-precio-max">Precio máximo ($)</label>
                        <input
                            type="number"
                            id="filtro-precio-max"
                            name="precioMax"
                            min="0"
                            placeholder="Ej: 800000"
                            value={filtros.precioMax}
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
                            <option value="4">4+</option>
                        </select>
                    </div>

                    <div className="grupo-filtro">
                        <label htmlFor="filtro-banos">Baños</label>
                        <select
                            id="filtro-banos"
                            name="banos"
                            value={filtros.banos}
                            onChange={handleChange}
                        >
                            <option value="">Cualquiera</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>

                    <div className="grupo-filtro acciones-filtros">
                        <button type="submit" className="boton boton-filtrar">
                            Buscar
                        </button>
                        <button
                            type="button"
                            className="boton boton-filtrar boton-secundario"
                            onClick={limpiarFiltros}
                        >
                            Limpiar
                        </button>
                    </div>
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
