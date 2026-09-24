import { tipoMap } from '../data/propiedades';

/**
 * Aplica los filtros del catálogo (tipo, comuna, rango de precio,
 * dormitorios y baños). Valores vacíos o en 0 se ignoran.
 * @param {object[]} propiedades - Lista completa o filtrada por dueño.
 * @param {{tipo?: string, comuna?: string, precioMin?: string|number, precioMax?: string|number, dormitorios?: string|number, banos?: string|number}} filtros
 * @returns {object[]} Propiedades que cumplen todos los criterios.
 */
export function filtrarPropiedades(propiedades, filtros) {
    const tipo = (filtros.tipo || '').trim().toLowerCase();
    const comuna = (filtros.comuna || '').trim().toLowerCase();
    const precioMin = Number(filtros.precioMin);
    const precioMax = Number(filtros.precioMax);
    const dormitorios = Number(filtros.dormitorios);
    const banos = Number(filtros.banos);

    return propiedades.filter((propiedad) => {
        const coincideTipo = !tipo || propiedad.tipo.toLowerCase() === tipoMap[tipo]?.toLowerCase();
        const coincideComuna = !comuna || propiedad.comuna.toLowerCase().includes(comuna);
        const coincidePrecioMin = !precioMin || propiedad.precioMensual >= precioMin;
        const coincidePrecioMax = !precioMax || propiedad.precioMensual <= precioMax;
        const coincideDormitorios = !dormitorios || propiedad.dormitorios >= dormitorios;
        const coincideBanos = !banos || propiedad.banos >= banos;

        return (
            coincideTipo &&
            coincideComuna &&
            coincidePrecioMin &&
            coincidePrecioMax &&
            coincideDormitorios &&
            coincideBanos
        );
    });
}
