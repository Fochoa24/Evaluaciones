export default function Mensaje({ texto, tipo = 'error' }) {
    if (!texto) {
        return null;
    }

    return (
        <div className={`mensaje ${tipo} visible`} role="alert" aria-live="polite">
            {texto}
        </div>
    );
}
