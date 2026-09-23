export const propiedades = [
    {
        id: 1,
        tipo: 'Departamento',
        titulo: 'Departamento Amueblado en Av. Italia',
        comuna: 'Providencia',
        ubicacion: 'Providencia, Santiago',
        precioMensual: 550000,
        dormitorios: 2,
        banos: 2,
        superficie: 65,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 2,
        tipo: 'Casa',
        titulo: 'Casa Familiar con Jardín y Piscina',
        comuna: 'Las Condes',
        ubicacion: 'Las Condes, Santiago',
        precioMensual: 1200000,
        dormitorios: 4,
        banos: 3,
        superficie: 180,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 3,
        tipo: 'Oficina',
        titulo: 'Oficina Comercial en Sector El Golf',
        comuna: 'Las Condes',
        ubicacion: 'Las Condes, Santiago',
        precioMensual: 480000,
        dormitorios: 2,
        banos: 1,
        superficie: 45,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 4,
        tipo: 'Local comercial',
        titulo: 'Local Comercial a Pie de Calle',
        comuna: 'Santiago Centro',
        ubicacion: 'Santiago Centro, Santiago',
        precioMensual: 850000,
        dormitorios: 0,
        banos: 2,
        superficie: 90,
        estado: 'Reservada',
        imagen: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 5,
        tipo: 'Departamento',
        titulo: 'Departamento con Vista al Cerro',
        comuna: 'Ñuñoa',
        ubicacion: 'Ñuñoa, Santiago',
        precioMensual: 620000,
        dormitorios: 3,
        banos: 2,
        superficie: 72,
        estado: 'Disponible',
        imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 6,
        tipo: 'Casa',
        titulo: 'Casa Moderna en Barrio Alto',
        comuna: 'Vitacura',
        ubicacion: 'Vitacura, Santiago',
        precioMensual: 1500000,
        dormitorios: 5,
        banos: 4,
        superficie: 220,
        estado: 'Publicada',
        imagen: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=600&q=80'
    }
];

export const IMAGEN_DEFECTO =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80';

export const TIPOS_PROPIEDAD = ['Departamento', 'Casa', 'Oficina', 'Local comercial'];

export const ESTADOS_PROPIEDAD = [
    'Disponible',
    'Publicada',
    'Reservada',
    'Arrendada',
    'En mantención',
    'Inactiva'
];

export const tipoMap = {
    departamento: 'Departamento',
    casa: 'Casa',
    oficina: 'Oficina',
    local: 'Local comercial'
};
