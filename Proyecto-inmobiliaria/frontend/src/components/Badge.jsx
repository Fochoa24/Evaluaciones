const CLASES = {
    Disponible: 'disponible',
    Publicada: 'disponible',
    Reservada: 'reservada',
    'En mantención': 'reservada',
    Arrendada: 'vendida',
    Vendida: 'vendida',
    Inactiva: 'vendida',
    // Estados de cuenta
    Activo: 'disponible',
    Pendiente: 'reservada',
    Inactivo: 'vendida'
};

export default function Badge({ estado }) {
    const clase = CLASES[estado] || 'disponible';

    return <span className={`badge ${clase}`}>{estado}</span>;
}
