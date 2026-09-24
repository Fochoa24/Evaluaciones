import LayoutLegal from '../components/LayoutLegal';

const FECHA = '23 de septiembre de 2026';

export default function Terminos() {
    return (
        <LayoutLegal titulo="Términos de uso" fecha={FECHA}>
            <h2>1. Aceptación</h2>
            <p>
                Al acceder y usar esta plataforma aceptas estos términos. Si no estás de acuerdo,
                no debes utilizar el sitio.
            </p>

            <h2>2. Descripción del servicio</h2>
            <p>
                Gestión Urbana es una plataforma de gestión inmobiliaria que permite explorar
                propiedades, solicitar visitas y, según tu rol, administrar el portafolio.
            </p>

            <h2>3. Cuentas de usuario</h2>
            <ul>
                <li>Debes proporcionar información verdadera al registrarte</li>
                <li>Eres responsable de mantener tu contraseña confidencial</li>
                <li>Las actividades realizadas con tu cuenta son de tu responsabilidad</li>
                <li>Los roles (cliente, propietario, ejecutivo, admin) definen los permisos</li>
            </ul>
            <p>
                Las cuentas de demostración son solo para pruebas y pueden modificarse o eliminarse.
            </p>
            <p>
                Las propiedades, visitas agendadas, reservas y solicitudes de arriendo incluidas en
                la plataforma son <strong>datos ficticios</strong> para fines educativos y no generan
                obligaciones contractuales reales.
            </p>

            <h2>4. Uso permitido</h2>
            <p>Te comprometes a:</p>
            <ul>
                <li>No usar la plataforma con fines ilícitos</li>
                <li>No intentar acceder a datos de otros usuarios</li>
                <li>No interferir con el funcionamiento del sitio</li>
                <li>No publicar contenido falso, ofensivo o engañoso</li>
            </ul>

            <h2>5. Propiedades y solicitudes de visita</h2>
            <ul>
                <li>
                    La información de propiedades publicadas debe ser veraz en la medida de lo
                    posible
                </li>
                <li>
                    Una solicitud de visita no constituye una reserva ni un contrato de arriendo;
                    la visita queda sujeta a confirmación
                </li>
                <li>
                    Los precios y estados pueden cambiar sin previo aviso
                </li>
            </ul>

            <h2>6. Propiedad intelectual</h2>
            <p>
                El diseño, marca, textos y código del sitio pertenecen a Gestión Urbana Propiedades
                o a sus licenciantes. No se permite su reproducción sin autorización.
            </p>

            <h2>7. Limitación de responsabilidad</h2>
            <p>
                El servicio se presta “tal cual”. En la máxima medida permitida por la ley, no
                somos responsables por daños indirectos, lucro cesante o fallas derivadas de
                interrupciones, errores o del uso indebido de la plataforma.
            </p>

            <h2>8. Modificaciones</h2>
            <p>
                Podemos actualizar estos términos en cualquier momento. El uso continuo tras un
                cambio implica su aceptación.
            </p>

            <h2>9. Contacto</h2>
            <p>
                Para dudas sobre estos términos:{" "}
                <a href="mailto:contacto@gestionurbana.cl">contacto@gestionurbana.cl</a>
            </p>
        </LayoutLegal>
    );
}
