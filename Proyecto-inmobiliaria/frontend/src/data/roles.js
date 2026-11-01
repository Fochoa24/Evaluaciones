/**
 * Matrices de permisos por rol (rutas protegidas y menú). Copia de
 * backend/config/constantes.js (el backend vuelve a autorizar): cambiar ambos.
 * - ROLES_GESTION: CRUD de propiedades.
 * - ROLES_INTERNOS: usuarios (propietarios y clientes), publicar, evaluar.
 * - ROLES_CLIENTE: postula a arriendos.
 */
export const ROLES_GESTION = ['admin', 'ejecutivo', 'propietario'];
export const ROLES_INTERNOS = ['admin', 'ejecutivo'];
export const ROLES_CLIENTE = ['cliente'];
