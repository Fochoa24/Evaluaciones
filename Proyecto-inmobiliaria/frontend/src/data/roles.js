/**
 * Matrices de permisos por rol (rutas protegidas y menú).
 * - ROLES_GESTION: CRUD de propiedades y propietarios.
 * - ROLES_ATENCION: visitas y cartera de clientes.
 * - ROLES_EVALUAN: aprueban/rechazan solicitudes de arriendo.
 * - ROLES_CLIENTE: puede iniciar sesión como interesado.
 */
export const ROLES_GESTION = ['admin', 'ejecutivo', 'propietario'];
export const ROLES_ATENCION = ['admin', 'ejecutivo', 'propietario'];
export const ROLES_LOGIN = ['cliente', 'propietario', 'ejecutivo', 'admin'];
export const ROLES_EVALUAN = ['admin', 'ejecutivo'];
export const ROLES_CLIENTE = ['cliente'];
