import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { definirCookie, obtenerCookie } from '../services/preferencias';

export default function ConsentBanner() {
    const [visible, setVisible] = useState(false);
    const bannerRef = useRef(null);
    const rechazarRef = useRef(null);

    useEffect(() => {
        try {
            if (!obtenerCookie('consentimiento')) {
                setVisible(true);
            }
        } catch {
            setVisible(true);
        }

        const abrir = () => setVisible(true);
        window.addEventListener('configurar-cookies', abrir);
        return () => window.removeEventListener('configurar-cookies', abrir);
    }, []);

    useEffect(() => {
        if (!visible) return undefined;

        rechazarRef.current?.focus();

        const alPresionarEscape = (event) => {
            if (event.key === 'Escape') {
                setVisible(false);
            }
        };

        const alPresionarTab = (event) => {
            if (event.key !== 'Tab' || !bannerRef.current) return;
            const foco = bannerRef.current.querySelectorAll(
                'button, a[href], [tabindex]:not([tabindex="-1"])'
            );
            if (foco.length === 0) return;
            const primero = foco[0];
            const ultimo = foco[foco.length - 1];
            if (event.shiftKey && document.activeElement === primero) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primero.focus();
            }
        };

        document.addEventListener('keydown', alPresionarEscape);
        document.addEventListener('keydown', alPresionarTab);
        return () => {
            document.removeEventListener('keydown', alPresionarEscape);
            document.removeEventListener('keydown', alPresionarTab);
        };
    }, [visible]);

    const responder = (valor) => {
        try {
            definirCookie('consentimiento', valor);
        } catch {
            // preferencia no persistida
        }
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <aside
            ref={bannerRef}
            className="cookie-banner"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            aria-label="Aviso de cookies"
        >
            <div className="cookie-texto">
                <strong>Valoramos tu privacidad</strong>
                <p>
                    Usamos cookies propias para recordar tu preferencia y mejorar la experiencia.
                    Puedes aceptarlas o rechazarlas. Más información en nuestra{' '}
                    <Link to="/cookies">política de cookies</Link>.
                </p>
            </div>
            <div className="cookie-acciones">
                <button
                    ref={rechazarRef}
                    type="button"
                    className="boton cookie-rechazar"
                    onClick={() => responder('rechazado')}
                >
                    Rechazar
                </button>
                <button type="button" className="boton cookie-aceptar" onClick={() => responder('aceptado')}>
                    Aceptar
                </button>
            </div>
        </aside>
    );
}
