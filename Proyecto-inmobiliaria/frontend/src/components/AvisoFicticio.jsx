/**
 * Aviso visible de que los registros de la sección son de
 * demostración (datos ficticios), como pide la evaluación.
 * No interfiere con el flujo: solo agrega contexto al usuario.
 */
export default function AvisoFicticio({ texto }) {
    return (
        <p className="aviso-ficticio" role="note">
            <strong>Datos ficticios.</strong>{' '}
            {texto ||
                'Reservas, visitas y solicitudes de esta demostración son de ejemplo y no representan operaciones reales.'}
        </p>
    );
}
