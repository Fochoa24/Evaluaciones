import { arriendosSemilla } from '../data/arriendos';
import { propiedades } from '../data/propiedades';
import { propietariosSemilla } from '../data/propietarios';
import { visitasSemilla } from '../data/visitas';
import { guardar, leer } from './storage';

/**
 * Versión del set de datos de demo. Si sube, se reemplaza la semilla
 * en localStorage (sin tocar la sesión del usuario).
 */
export const VERSION_DATOS = 2;

/**
 * Si la semilla local es anterior a VERSION_DATOS, la reemplaza.
 * Se ejecuta una vez al arrancar la app (main.jsx) para que los
 * contextos lean datos coherentes del primer render.
 */
export function prepararDatosDemo() {
    const version = leer('version_datos', 0);
    if (version >= VERSION_DATOS) {
        return;
    }

    guardar('propiedades', propiedades);
    guardar('propietarios', propietariosSemilla);
    guardar('visitas', visitasSemilla);
    guardar('arriendos', arriendosSemilla);
    guardar('version_datos', VERSION_DATOS);
}
