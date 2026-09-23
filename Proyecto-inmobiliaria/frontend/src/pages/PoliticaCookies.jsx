import LayoutLegal from '../components/LayoutLegal';

const FECHA = '23 de septiembre de 2026';

export default function Cookies() {
    return (
        <LayoutLegal titulo="Política de cookies" fecha={FECHA}>
            <h2>1. Qué son las cookies</h2>
            <p>
                Las cookies son pequeños archivos que un sitio guarda en tu navegador para
                recordar información entre visitas (sesión, preferencias, etc.).
            </p>

            <h2>2. Qué usamos en este sitio</h2>
            <p>
                <strong>Cookies propias y esenciales:</strong> guardan tu decisión sobre este
                avance (aceptar o rechazar) para no mostrártelo en cada visita.
            </p>
            <ul>
                <li>
                    <code>gu_consentimiento</code> — valores <code>aceptado</code> o{' '}
                    <code>rechazado</code>. Vigencia: 180 días.
                </li>
            </ul>
            <p>
                <strong>No usamos cookies de terceros</strong> (no hay publicidad, redes sociales
                embebidas ni analítica de terceros por ahora).
            </p>

            <h2>3. Almacenamiento local (localStorage)</h2>
            <p>
                Para que la aplicación funcione (sesión, propiedades y visitas) usamos
                almacenamiento local con prefijo <code>gi_</code>:
            </p>
            <ul>
                <li><code>gi_sesion</code> — usuario con sesión iniciada</li>
                <li><code>gi_usuarios</code> — cuentas registradas en el navegador</li>
                <li><code>gi_propiedades</code> — catálogo de propiedades</li>
                <li><code>gi_visitas</code> — solicitudes de visita</li>
            </ul>
            <p>
                Esto <strong>no es una cookie</strong>, pero se guarda en tu equipo. Si rechazas
                las cookies, el avance no volverá a aparecer; el almacenamiento esencial de la app
                puede seguir activo para que navegues con normalidad.
            </p>

            <h2>4. Gestión del consentimiento</h2>
            <p>
                Al entrar por primera vez puedes <strong>aceptar</strong> o <strong>rechazar</strong>{' '}
                las cookies. Puedes cambiar de decisión cuando quieras desde el enlace
                “Configurar cookies” en el pie de página, o bien:
            </p>
            <ul>
                <li>
                    Borrar <code>gu_consentimiento</code> desde las herramientas de privacidad del
                    navegador
                </li>
                <li>
                    Eliminar datos del sitio para reiniciar también el localStorage
                </li>
            </ul>

            <h2>5. Cómo borrar cookies en tu navegador</h2>
            <p>
                La ruta varía según el navegador (Configuración → Privacidad → Cookies o datos de
                sitios). Si bloqueas todas las cookies, algunas funciones del sitio podrían no
                recordar tu preferencia de consentimiento.
            </p>

            <h2>6. Contacto</h2>
            <p>
                Si tienes dudas:{" "}
                <a href="mailto:contacto@gestionurbana.cl">contacto@gestionurbana.cl</a>
            </p>
        </LayoutLegal>
    );
}
