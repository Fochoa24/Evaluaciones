/**
 * Dueños de inmuebles. `usuarioId` enlaza al usuario de login
 * cuando el propietario tiene cuenta (rol propietario).
 */
export const propietariosSemilla = [
    {
        id: 1,
        nombre: 'María González Ríos',
        email: 'maria.gonzalez@duenos.cl',
        telefono: '+56 9 8765 4321',
        rut: '12.345.678-5',
        estado: 'Activo',
        usuarioId: 3
    },
    {
        id: 2,
        nombre: 'Roberto Fuentes Soto',
        email: 'roberto.fuentes@duenos.cl',
        telefono: '+56 9 7654 3210',
        rut: '9.876.543-2',
        estado: 'Activo',
        usuarioId: null
    },
    {
        id: 3,
        nombre: 'Inversiones Andes SpA',
        email: 'contacto@andesinv.cl',
        telefono: '+56 2 2345 6789',
        rut: '76.543.210-8',
        estado: 'Activo',
        usuarioId: null
    },
    {
        id: 4,
        nombre: 'Carmen López Vera',
        email: 'carmen.lopez@duenos.cl',
        telefono: '+56 9 5555 1111',
        rut: '15.678.901-3',
        estado: 'Activo',
        usuarioId: null
    },
    {
        id: 5,
        nombre: 'Grupo Patagonia Ltda.',
        email: 'administracion@patagonia.cl',
        telefono: '+56 2 2999 8888',
        rut: '77.111.222-9',
        estado: 'Inactivo',
        usuarioId: null
    }
];

/** Estados posibles de un propietario en el CRUD. */
export const ESTADOS_PROPIETARIO = ['Activo', 'Inactivo'];
