import { useCallback, useEffect, useState } from 'react';

const IMAGENES = [
    {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Casa moderna con fachada iluminada'
    },
    {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
        alt: 'Casa familiar con jardín y piscina'
    },
    {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Interior luminoso de vivienda'
    },
    {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
        alt: 'Residencia de arquitectura contemporánea'
    }
];

const INTERVALO_MS = 5500;

export default function Hero({ children }) {
    const [activa, setActiva] = useState(0);
    const [enPausa, setEnPausa] = useState(false);

    const irA = useCallback((indice) => {
        setActiva((indice + IMAGENES.length) % IMAGENES.length);
    }, []);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || enPausa) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setActiva((prev) => (prev + 1) % IMAGENES.length);
        }, INTERVALO_MS);

        return () => window.clearInterval(timer);
    }, [enPausa]);

    return (
        <section
            className="hero"
            aria-roledescription="carrusel"
            aria-label="Propiedades destacadas"
            onMouseEnter={() => setEnPausa(true)}
            onMouseLeave={() => setEnPausa(false)}
            onFocus={() => setEnPausa(true)}
            onBlur={() => setEnPausa(false)}
        >
            <div className="hero-fondo" aria-hidden="true">
                {IMAGENES.map((imagen, indice) => (
                    <div
                        key={imagen.url}
                        className={`hero-diapositiva${indice === activa ? ' activa' : ''}`}
                        style={{ backgroundImage: `url("${imagen.url}")` }}
                    />
                ))}
            </div>
            <div className="hero-velo" aria-hidden="true" />

            <button
                type="button"
                className="hero-flecha hero-flecha-izq"
                aria-label="Imagen anterior"
                onClick={() => irA(activa - 1)}
            >
                ‹
            </button>
            <button
                type="button"
                className="hero-flecha hero-flecha-der"
                aria-label="Imagen siguiente"
                onClick={() => irA(activa + 1)}
            >
                ›
            </button>

            <div className="hero-contenido">{children}</div>

            <div className="hero-indicadores" role="group" aria-label="Seleccionar imagen del carrusel">
                {IMAGENES.map((imagen, indice) => (
                    <button
                        key={imagen.url}
                        type="button"
                        aria-label={`Imagen ${indice + 1}: ${imagen.alt}`}
                        aria-current={indice === activa ? 'true' : undefined}
                        className={`hero-indicador${indice === activa ? ' activo' : ''}`}
                        onClick={() => irA(indice)}
                    />
                ))}
            </div>

            <p className="visually-hidden" aria-live="polite">
                {`Imagen ${activa + 1} de ${IMAGENES.length}: ${IMAGENES[activa].alt}`}
            </p>
        </section>
    );
}
