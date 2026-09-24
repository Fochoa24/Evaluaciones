import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Vuelve al inicio de la página al cambiar de ruta.
 * Sin esto, React Router conserva el scroll del botón/anterior
 * y la nueva vista arranca a media altura.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
}
