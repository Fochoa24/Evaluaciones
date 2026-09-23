export default function Badge({ estado }) {
    const clase = estado === 'Reservada' ? 'reservada' : 'disponible';

    return <span className={`badge ${clase}`}>{estado}</span>;
}
