/**
 * Datos ficticios de demostración (§9.3 de docs/modelo-logico.md).
 * RUT, nombres, correos y teléfonos son inventados. Las contraseñas
 * van en texto plano aquí y seed.js las hashea antes de insertar.
 *
 * Ejecutivos y carteras (propiedades no Inactiva):
 *   2 → 1, 4, 7 · 5 → 2, 5, 8, 11 · 6 → 3, 6, 12
 * Propietarios (antes fichas 1–5): 3, 7, 8, 9, 10 (10 dado de baja).
 */

const { ahoraChile, sumarDiasHabiles } = require('../utils/agenda');

const DIA = 86400000;

const usuarios = [
    // Internos
    { id: 1, usuario: 'admin', nombre: 'Administrador', email: 'admin@inmobiliaria.cl', rut: '11.111.111-1', password: 'admin123', rol: 'admin' },
    { id: 2, usuario: 'ejecutivo', nombre: 'Ejecutivo Inmobiliario', email: 'ejecutivo@inmobiliaria.cl', rut: '10.222.333-0', password: 'ejecutivo123', rol: 'ejecutivo' },
    { id: 5, usuario: 'ejecutivo2', nombre: 'Javiera Morales', email: 'jmorales@inmobiliaria.cl', rut: '14.666.777-5', password: 'ejecutivo123', rol: 'ejecutivo' },
    { id: 6, usuario: 'ejecutivo3', nombre: 'Tomás Reyes', email: 'treyes@inmobiliaria.cl', rut: '16.888.999-2', password: 'ejecutivo123', rol: 'ejecutivo' },
    // Propietarios
    { id: 3, usuario: 'propietario', nombre: 'María González Ríos', email: 'propietario@inmobiliaria.cl', rut: '12.345.678-5', telefono: '+56 9 8765 4321', password: 'propietario123', rol: 'propietario', verificadoPor: 2 },
    { id: 7, usuario: 'rfuentes', nombre: 'Roberto Fuentes Soto', email: 'roberto.fuentes@duenos.cl', rut: '9.876.543-3', telefono: '+56 9 7654 3210', password: 'demo1234', rol: 'propietario', verificadoPor: 2 },
    { id: 8, usuario: 'andesinv', nombre: 'Inversiones Andes SpA', email: 'contacto@andesinv.cl', rut: '76.543.210-3', telefono: '+56 2 2345 6789', password: 'demo1234', rol: 'propietario', verificadoPor: 2 },
    { id: 9, usuario: 'clopez', nombre: 'Carmen López Vera', email: 'carmen.lopez@duenos.cl', rut: '15.678.901-1', telefono: '+56 9 5555 1111', password: 'demo1234', rol: 'propietario', verificadoPor: 2 },
    { id: 10, usuario: 'patagonia', nombre: 'Grupo Patagonia Ltda.', email: 'administracion@patagonia.cl', rut: '77.111.222-6', telefono: '+56 2 2999 8888', password: 'demo1234', rol: 'propietario', verificadoPor: 2, estado: 'Inactivo' },
    // Clientes
    { id: 4, usuario: 'cliente', nombre: 'Cliente Demo', email: 'cliente@inmobiliaria.cl', rut: '13.444.555-6', telefono: '+56 9 1111 2222', password: 'cliente123', rol: 'cliente' },
    { id: 11, usuario: 'apizarro', nombre: 'Andrés Pizarro', email: 'andres.pizarro@email.com', rut: '17.123.456-5', telefono: '+56 9 3333 4444', password: 'demo1234', rol: 'cliente' },
    { id: 12, usuario: 'comercialandes', nombre: 'Comercial Andes Ltda.', email: 'gerencia@comercialandes.cl', rut: '76.800.900-7', telefono: '+56 2 2555 6666', password: 'demo1234', rol: 'cliente' },
    { id: 13, usuario: 'dmunoz', nombre: 'Diego Muñoz', email: 'diego.munoz@email.com', rut: '18.234.567-9', telefono: '+56 9 8888 9999', password: 'demo1234', rol: 'cliente' },
    { id: 14, usuario: 'fcastillo', nombre: 'Fernanda Castillo', email: 'fernanda.castillo@email.com', rut: '19.345.678-2', telefono: '+56 9 1212 3434', password: 'demo1234', rol: 'cliente' },
    // Pendientes: verificación del ejecutivo (correo ya confirmado) y activación por correo (TTL a los 14 días)
    { id: 15, usuario: 'lherrera', nombre: 'Luis Herrera Paz', email: 'luis.herrera@duenos.cl', rut: '20.456.789-1', telefono: '+56 9 4545 6767', password: 'demo1234', rol: 'propietario', estado: 'Pendiente' },
    { id: 16, usuario: 'vrojas', nombre: 'Valentina Rojas', email: 'valentina.rojas@email.com', rut: '21.567.890-3', password: 'demo1234', rol: 'cliente', estado: 'Pendiente', emailVerificado: false }
].map((u) => ({ estado: 'Activo', emailVerificado: true, ...u }));

const unsplash = (foto) => `https://images.unsplash.com/${foto}?auto=format&fit=crop&w=600&q=80`;

const propiedades = [
    { id: 1, tipo: 'Departamento', titulo: 'Departamento Amueblado en Av. Italia', comuna: 'Providencia', direccion: 'Av. Italia 1234', ubicacion: 'Providencia, Santiago', precioMensual: 550000, gastosComunes: 80000, dormitorios: 2, banos: 2, estacionamientos: 1, superficie: 65, caracteristicas: ['Amueblado', 'Balcón', 'Calefacción'], propietarioId: 3, ejecutivoId: 2, estado: 'Publicada', imagen: unsplash('photo-1560448204-e02f11c3d0e2') },
    { id: 2, tipo: 'Casa', titulo: 'Casa Familiar con Jardín y Piscina', comuna: 'Las Condes', direccion: 'Los Leones 456', ubicacion: 'Las Condes, Santiago', precioMensual: 1200000, gastosComunes: 120000, dormitorios: 4, banos: 3, estacionamientos: 2, superficie: 180, caracteristicas: ['Jardín', 'Piscina', 'Quincho'], propietarioId: 7, ejecutivoId: 5, estado: 'Publicada', imagen: unsplash('photo-1600596542815-ffad4c1539a9') },
    // Creada por su dueño, a la espera de que el ejecutivo la publique (D9).
    { id: 3, tipo: 'Oficina', titulo: 'Oficina Comercial en Sector El Golf', comuna: 'Las Condes', direccion: 'Apoquindo 789', ubicacion: 'Las Condes, Santiago', precioMensual: 480000, gastosComunes: 60000, dormitorios: 1, banos: 1, estacionamientos: 1, superficie: 45, caracteristicas: ['Sala de reuniones', 'Vigilancia'], propietarioId: 8, ejecutivoId: 6, estado: 'Disponible', imagen: unsplash('photo-1497366216548-37526070297c') },
    { id: 4, tipo: 'Local comercial', titulo: 'Local Comercial a Pie de Calle', comuna: 'Santiago Centro', direccion: 'Ahumada 100', ubicacion: 'Santiago Centro, Santiago', precioMensual: 850000, gastosComunes: 100000, dormitorios: 0, banos: 2, estacionamientos: 0, superficie: 90, caracteristicas: ['Vitrina', 'Bodega'], propietarioId: 3, ejecutivoId: 2, estado: 'Reservada', imagen: unsplash('photo-1555396273-367ea4eb4db5') },
    { id: 5, tipo: 'Departamento', titulo: 'Departamento con Vista al Cerro', comuna: 'Ñuñoa', direccion: 'Manquehue Sur 321', ubicacion: 'Ñuñoa, Santiago', precioMensual: 620000, gastosComunes: 75000, dormitorios: 3, banos: 2, estacionamientos: 1, superficie: 72, caracteristicas: ['Vista panorámica', 'Estacionamiento techado'], propietarioId: 7, ejecutivoId: 5, estado: 'Publicada', imagen: unsplash('photo-1502672260266-1c1ef2d93688') },
    { id: 6, tipo: 'Casa', titulo: 'Casa Moderna en Barrio Alto', comuna: 'Vitacura', direccion: 'San Sebastián 555', ubicacion: 'Vitacura, Santiago', precioMensual: 1500000, gastosComunes: 150000, dormitorios: 5, banos: 4, estacionamientos: 3, superficie: 220, caracteristicas: ['Terraza', 'Domótica', 'Gimnasio'], propietarioId: 8, ejecutivoId: 6, estado: 'Publicada', imagen: unsplash('photo-1576941089067-2de3c901e126') },
    { id: 7, tipo: 'Departamento', titulo: 'Studio Céntrico Cerro Santa Lucía', comuna: 'Santiago Centro', direccion: 'Santa Lucía 450', ubicacion: 'Santiago Centro, Santiago', precioMensual: 390000, gastosComunes: 55000, dormitorios: 1, banos: 1, estacionamientos: 0, superficie: 38, caracteristicas: ['Estudio', 'Cerca del metro'], propietarioId: 9, ejecutivoId: 2, estado: 'Publicada', imagen: unsplash('photo-1522708323590-d24dbb6b0267') },
    { id: 8, tipo: 'Casa', titulo: 'Casa Patio en La Reina', comuna: 'La Reina', direccion: 'Av. Príncipe de Gales 900', ubicacion: 'La Reina, Santiago', precioMensual: 980000, gastosComunes: 90000, dormitorios: 3, banos: 2, estacionamientos: 2, superficie: 140, caracteristicas: ['Patio', 'Quincho', 'Bodega'], propietarioId: 9, ejecutivoId: 5, estado: 'Arrendada', imagen: unsplash('photo-1564013799919-ab600027ffc6') },
    // 9 y 10: dueño dado de baja (D10).
    { id: 9, tipo: 'Departamento', titulo: 'Departamento Familiar en Maipú', comuna: 'Maipú', direccion: 'Av. 5 de Abril 2100', ubicacion: 'Maipú, Santiago', precioMensual: 450000, gastosComunes: 65000, dormitorios: 2, banos: 1, estacionamientos: 1, superficie: 58, caracteristicas: ['Cerca del metro', 'Ascensor'], propietarioId: 10, ejecutivoId: 6, estado: 'Inactiva', imagen: unsplash('photo-1493809842364-78817add7ffb') },
    { id: 10, tipo: 'Oficina', titulo: 'Coworking Amplio en Ñuñoa', comuna: 'Ñuñoa', direccion: 'Av. Irarrázaval 3300', ubicacion: 'Ñuñoa, Santiago', precioMensual: 720000, gastosComunes: 110000, dormitorios: 0, banos: 2, estacionamientos: 2, superficie: 110, caracteristicas: ['Open space', 'Sala juntas', 'Fibra óptica'], propietarioId: 10, ejecutivoId: 2, estado: 'Inactiva', imagen: unsplash('photo-1497366754035-f200968a6e72') },
    { id: 11, tipo: 'Local comercial', titulo: 'Oficina Vitrina en Providencia', comuna: 'Providencia', direccion: 'Manuel Montt 800', ubicacion: 'Providencia, Santiago', precioMensual: 1100000, gastosComunes: 140000, dormitorios: 0, banos: 2, estacionamientos: 1, superficie: 95, caracteristicas: ['Vitrina', 'Auditorio', 'Bodega subterránea'], propietarioId: 8, ejecutivoId: 5, estado: 'Publicada', imagen: unsplash('photo-1441986300917-64674bd600d8') },
    { id: 12, tipo: 'Departamento', titulo: 'Departamento Playa en Viña (sucursal)', comuna: 'Viña del Mar', direccion: 'Av. Argentina 1500', ubicacion: 'Viña del Mar, Valparaíso', precioMensual: 780000, gastosComunes: 95000, dormitorios: 2, banos: 2, estacionamientos: 1, superficie: 70, caracteristicas: ['Vista mar', 'Piscina edificio', 'Amueblado'], propietarioId: 7, ejecutivoId: 6, estado: 'Publicada', imagen: unsplash('photo-1512917774080-9991f1c4c750') }
];

/** Copia título y ejecutivo de la propiedad, como hará la ruta al crear. */
function deLaPropiedad(propiedadId) {
    const { titulo, ejecutivoId } = propiedades.find((p) => p.id === propiedadId);
    return { propiedadId, propiedadTitulo: titulo, ejecutivoId };
}

/** Las visitas activas caen en días hábiles siguientes a la carga del seed. */
const enDiasHabiles = (n) => sumarDiasHabiles(ahoraChile().fecha, n);

const visitas = [
    { id: 1, ...deLaPropiedad(1), clienteId: 4, nombre: 'Cliente Demo', email: 'cliente@inmobiliaria.cl', telefono: '+56 9 1111 2222', fecha: enDiasHabiles(2), hora: '11:00', comentarios: 'Prefiere visita en la mañana.', estado: 'Confirmada' },
    { id: 2, ...deLaPropiedad(7), clienteId: 11, nombre: 'Andrés Pizarro', email: 'andres.pizarro@email.com', telefono: '+56 9 3333 4444', fecha: enDiasHabiles(3), hora: '16:30', estado: 'Pendiente' },
    { id: 3, ...deLaPropiedad(5), nombre: 'Lucía Herrera', email: 'lucia.herrera@email.com', telefono: '+56 9 2222 3333', fecha: '2026-10-19', hora: '10:00', comentarios: 'Lleva a su pareja a ver el departamento.', estado: 'Realizada', resultado: 'Interesado en arrendar' },
    { id: 4, ...deLaPropiedad(2), nombre: 'Pedro Salas', email: 'pedro.salas@email.com', telefono: '+56 9 4444 5555', fecha: '2026-10-14', hora: '15:00', estado: 'Rechazada' },
    { id: 5, ...deLaPropiedad(11), nombre: 'Empresa Nova SpA', email: 'rrhh@empresanova.cl', telefono: '+56 2 2111 4444', fecha: enDiasHabiles(4), hora: '09:30', comentarios: 'Requiere visita técnica del espacio.', estado: 'Pendiente' },
    // Cancelada por la baja de la propiedad 9 (D11).
    { id: 6, ...deLaPropiedad(9), nombre: 'Camila Rojas', email: 'camila.rojas@email.com', telefono: '+56 9 6666 7777', fecha: enDiasHabiles(1), hora: '17:00', comentarios: 'Pide confirmar si hay gastos comunes incluidos.', estado: 'Cancelada' }
];

/** Contacto de la solicitud = datos de la cuenta del cliente (F27). */
function delCliente(clienteId) {
    const { nombre, email, telefono = '' } = usuarios.find((u) => u.id === clienteId);
    return { clienteId, clienteNombre: nombre, clienteEmail: email, clienteTelefono: telefono };
}

/** Solicitud con datos de propiedad y cliente; `ejecutivoId` no es campo de Arriendo. */
function solicitud(propiedadId, clienteId, datos) {
    const { ejecutivoId, ...propiedad } = deLaPropiedad(propiedadId);
    return { ...propiedad, ...delCliente(clienteId), ...datos };
}

const arriendos = [
    { id: 1, ...solicitud(1, 4, { ingresoMensual: 1800000, garantia: 'Depósito 1 mes', antecedentes: 'Contrato indefinido, sin deudas vigentes.', estado: 'Pendiente' }) },
    { id: 2, ...solicitud(2, 11, { ingresoMensual: 2500000, garantia: 'Carta de aval', antecedentes: 'Arrendatario anterior sin incidencias.', estado: 'En evaluación', observacionesEjecutivo: 'Validando referencias laborales.' }) },
    { id: 3, ...solicitud(4, 12, { ingresoMensual: 4000000, garantia: 'Fianza bancaria', antecedentes: 'Empresa con 8 años de operación.', estado: 'Aprobada', observacionesEjecutivo: 'Aprobada. Propiedad reservada.', motivo: 'Estabilidad laboral comprobada', evaluadaPor: 2, evaluadaEn: new Date('2026-09-07T09:00:00Z'), respuestaPropietarioEn: new Date('2026-09-08T15:00:00Z') }) },
    { id: 4, ...solicitud(7, 13, { ingresoMensual: 900000, garantia: 'Depósito 1 mes', antecedentes: 'Ingresos eventuales, sin contrato fijo.', estado: 'Rechazada', observacionesEjecutivo: 'Ingreso insuficiente para el arriendo solicitado.', motivo: 'Ingreso insuficiente', evaluadaPor: 2, evaluadaEn: new Date('2026-09-03T10:00:00Z') }) },
    // Doble aprobación: espera a la propietaria demo (usuario 3).
    { id: 5, ...solicitud(1, 14, { ingresoMensual: 2200000, garantia: 'Aval con contrato indefinido', antecedentes: 'Busca arriendo por 24 meses.', estado: 'Esperando propietario', observacionesEjecutivo: 'Antecedentes en regla.', motivo: 'Sin antecedentes de deuda', evaluadaPor: 2, evaluadaEn: new Date(), venceEn: new Date(Date.now() + 7 * DIA) }) },
    // Plazo ya cumplido: el proceso de vencimiento (fase 6) la pasará a Vencida.
    { id: 6, ...solicitud(6, 4, { ingresoMensual: 3500000, garantia: 'Depósito 2 meses', antecedentes: 'Contrato indefinido.', estado: 'Esperando propietario', motivo: 'Estabilidad laboral comprobada', evaluadaPor: 6, evaluadaEn: new Date(Date.now() - 8 * DIA), venceEn: new Date(Date.now() - DIA) }) }
];

module.exports = { usuarios, propiedades, visitas, arriendos };
