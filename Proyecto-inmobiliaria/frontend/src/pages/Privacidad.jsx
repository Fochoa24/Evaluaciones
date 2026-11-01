import LayoutLegal from '../components/LayoutLegal';

const FECHA = '1 de noviembre de 2026';

export default function Privacidad() {
    return (
        <LayoutLegal titulo="Política de privacidad" fecha={FECHA}>
            <h2>1. Responsable del tratamiento</h2>
            <p>
                <strong>Gestión Urbana Propiedades</strong> es responsable del tratamiento de los
                datos personales que se recaben a través de esta plataforma web, conforme a la Ley
                N.º 19.628 sobre protección de la vida privada.
            </p>

            <h2>2. Datos que recopilamos</h2>
            <p>Según el formulario o la función que utilices, podemos solicitar:</p>
            <ul>
                <li>Nombre completo, usuario y correo electrónico</li>
                <li>
                    <strong>RUT</strong>, obligatorio para toda cuenta. Es un dato privado: solo lo
                    ven tú y el equipo de la inmobiliaria, y nunca se publica ni se muestra a otros
                    usuarios
                </li>
                <li>Teléfono de contacto (opcional)</li>
                <li>Contraseña, guardada cifrada (no podemos leerla)</li>
                <li>Datos de las propiedades que registres como propietario</li>
                <li>Solicitudes de visita: nombre, correo, teléfono, fecha, hora y comentarios</li>
                <li>
                    Solicitudes de arriendo: ingreso mensual, garantía y antecedentes. Solo los ve
                    el ejecutivo a cargo; el propietario recibe su recomendación, sin tus datos de
                    contacto ni financieros
                </li>
            </ul>
            <p>
                Los datos se guardan en nuestros servidores (base de datos en la nube). En tu
                navegador solo queda la credencial de la sesión iniciada (ver la política de cookies).
            </p>
            <p>
                Los registros precargados (propiedades, visitas, solicitudes y cuentas de ejemplo)
                son <strong>datos ficticios</strong> de demostración académica: no corresponden a
                personas ni operaciones reales.
            </p>

            <h2>3. Finalidad</h2>
            <ul>
                <li>Gestionar cuentas y sesiones de usuario, y verificar la identidad de propietarios</li>
                <li>Publicar, editar y consultar propiedades</li>
                <li>Coordinar visitas: la dirección exacta se comparte solo al confirmarse la visita</li>
                <li>Evaluar solicitudes de arriendo con el ejecutivo y el propietario</li>
            </ul>

            <h2>4. Correos que enviamos</h2>
            <p>
                Solo correos necesarios para el servicio: activación de la cuenta, contraseña
                temporal de las cuentas creadas por la inmobiliaria, confirmación o cambios de
                visitas y avances de las solicitudes de arriendo. No enviamos publicidad.
            </p>

            <h2>5. Base legal</h2>
            <p>
                El tratamiento se basa en tu consentimiento al crear una cuenta o enviar un
                formulario, y en la ejecución del servicio que solicitas.
            </p>

            <h2>6. Conservación</h2>
            <ul>
                <li>
                    Las cuentas que no confirman su correo en <strong>14 días</strong> se eliminan
                    automáticamente.
                </li>
                <li>
                    Las cuentas dadas de baja se desactivan y conservan su historial (visitas y
                    solicitudes) mientras sea necesario para el servicio o la ley.
                </li>
            </ul>

            <h2>7. Tus derechos</h2>
            <p>
                Puedes ver y corregir tu nombre, teléfono y contraseña en <strong>Mi cuenta</strong>.
                Para ejercer los derechos de acceso, rectificación, cancelación y oposición (ARCO),
                corregir tu RUT o revocar tu consentimiento, escríbenos a:
            </p>
            <p>
                <a href="mailto:contacto@gestionurbana.cl">contacto@gestionurbana.cl</a>
            </p>

            <h2>8. Seguridad</h2>
            <p>
                Las contraseñas se guardan cifradas y cada acción se autoriza en el servidor según
                tu rol. Ningún sistema es 100% seguro; te recomendamos no compartir tus
                credenciales con terceros.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
                Podemos actualizar esta política. La fecha de la última actualización aparece al
                inicio de esta página.
            </p>
        </LayoutLegal>
    );
}
