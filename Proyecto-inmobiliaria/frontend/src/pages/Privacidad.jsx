import LayoutLegal from '../components/LayoutLegal';

const FECHA = '23 de septiembre de 2026';

export default function Privacidad() {
    return (
        <LayoutLegal titulo="Política de privacidad" fecha={FECHA}>
            <h2>1. Responsable del tratamiento</h2>
            <p>
                <strong>Gestión Urbana Propiedades</strong> es responsable del tratamiento de los
                datos personales que se recaben a través de esta plataforma web.
            </p>

            <h2>2. Datos que recopilamos</h2>
            <p>Según el formulario o la función que utilices, podemos solicitar:</p>
            <ul>
                <li>Nombre completo, usuario y correo electrónico</li>
                <li>Teléfono de contacto (opcional)</li>
                <li>Contraseña (almacenada solo para el acceso a la cuenta)</li>
                <li>Datos de propiedades que registres como propietario o ejecutivo</li>
                <li>Solicitudes de visita (fecha, hora, comentarios)</li>
            </ul>
            <p>
                Actualmente estos datos se guardan en el <code>localStorage</code> del navegador
                (modo local, sin backend). Cuando se conecte la API, se migrarán al servidor.
            </p>

            <h2>3. Finalidad</h2>
            <ul>
                <li>Gestionar cuentas y sesiones de usuario</li>
                <li>Publicar, editar y consultar propiedades</li>
                <li>Coordinar y administrar solicitudes de visita</li>
                <li>Mejorar la experiencia de uso de la plataforma</li>
            </ul>

            <h2>4. Base legal</h2>
            <p>
                El tratamiento se basa en tu consentimiento al crear una cuenta o enviar un
                formulario, y en la ejecución del contrato cuando utilizas las funciones del sitio.
            </p>

            <h2>5. Conservación</h2>
            <p>
                Los datos se conservan mientras la cuenta esté activa o sea necesario para prestar
                el servicio. Puedes eliminarlos limpiando los datos del sitio en tu navegador
                (o eliminando tu cuenta cuando esté disponible el backend).
            </p>

            <h2>6. Tus derechos</h2>
            <p>Puedes ejercer los derechos de acceso, rectificación, cancelación y oposición (ARCO), así como revocar tu consentimiento, escribiéndonos a:</p>
            <p>
                <a href="mailto:contacto@gestionurbana.cl">contacto@gestionurbana.cl</a>
            </p>

            <h2>7. Seguridad</h2>
            <p>
                Implementamos medidas razonables para proteger la información. Ningún sistema es
                100% seguro; te recomendamos no compartir tus credenciales con terceros.
            </p>

            <h2>8. Cambios en esta política</h2>
            <p>
                Podemos actualizar esta política. La fecha de la última actualización aparece al
                inicio de esta página.
            </p>
        </LayoutLegal>
    );
}
