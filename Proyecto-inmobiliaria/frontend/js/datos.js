/**
 * Fuente de datos de ejemplo para Entrega 1.
 * Propiedades, usuarios de prueba, visitas y sesión en el navegador.
 */
const CLAVE_SESION = "gestionUrbanaSesion";
const CLAVE_REGISTROS = "gestionUrbanaRegistros";
const CLAVE_VISITAS = "gestionUrbanaVisitas";

const NOMBRES_PERFIL = {
    cliente: "Cliente / Arrendatario",
    propietario: "Propietario",
    ejecutivo: "Ejecutivo Inmobiliario",
    admin: "Administrador"
};

const DATOS = {
    propiedades: [
        {
            id: "1",
            tipo: "Departamento",
            titulo: "Departamento Amueblado en Av. Italia",
            comuna: "Providencia",
            ciudad: "Santiago",
            direccion: "Av. Italia 1240",
            precio: 550000,
            gastosComunes: 85000,
            dormitorios: 2,
            banos: 2,
            estacionamientos: 1,
            superficie: 65,
            estado: "Disponible",
            propietarioId: "u-propietario",
            imagen: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            descripcion: "Departamento luminoso y amoblado, cercano a metro y comercio. Ideal para quienes buscan conectividad y un espacio listo para habitar.",
            caracteristicas: ["Amoblado", "Bodega", "Logia", "Cerca de metro"]
        },
        {
            id: "2",
            tipo: "Casa",
            titulo: "Casa Familiar con Jardín y Piscina",
            comuna: "Las Condes",
            ciudad: "Santiago",
            direccion: "Camino El Alba 3210",
            precio: 1200000,
            gastosComunes: 0,
            dormitorios: 4,
            banos: 3,
            estacionamientos: 2,
            superficie: 180,
            estado: "Disponible",
            propietarioId: "u-propietario",
            imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            descripcion: "Casa amplia con jardín, quincho y piscina. Entorno residencial y tranquilidad para una familia que busca más espacio.",
            caracteristicas: ["Jardín", "Piscina", "Quincho", "Patio"]
        },
        {
            id: "3",
            tipo: "Oficina",
            titulo: "Oficina Comercial en Sector El Golf",
            comuna: "Las Condes",
            ciudad: "Santiago",
            direccion: "Av. Apoquindo 3000",
            precio: 480000,
            gastosComunes: 120000,
            dormitorios: 0,
            banos: 1,
            estacionamientos: 1,
            superficie: 45,
            estado: "Disponible",
            propietarioId: "u-propietario",
            imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            descripcion: "Oficina con dos privados en un edificio de alta demanda. Buena conectividad y servicios en el entorno inmediato.",
            caracteristicas: ["2 privados", "Recepción", "Aire acondicionado", "Seguridad 24h"]
        },
        {
            id: "4",
            tipo: "Local comercial",
            titulo: "Local Comercial a Pie de Calle",
            comuna: "Santiago Centro",
            ciudad: "Santiago",
            direccion: "Paseo Ahumada 850",
            precio: 850000,
            gastosComunes: 95000,
            dormitorios: 0,
            banos: 2,
            estacionamientos: 0,
            superficie: 90,
            estado: "Reservada",
            propietarioId: "u-propietario",
            imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
            descripcion: "Local de planta libre a pie de calle, con alto flujo peatonal. Actualmente se encuentra reservado mientras se formaliza el arriendo.",
            caracteristicas: ["Pie de calle", "Planta libre", "Vitrina", "Baño de clientes"]
        }
    ],
    usuarios: [
        {
            id: "u-cliente",
            nombre: "Ana Pérez",
            email: "ana@correo.cl",
            rut: "12345678-5",
            password: "123456",
            perfil: "cliente",
            telefono: "+56 9 1111 1111"
        },
        {
            id: "u-propietario",
            nombre: "Luis Soto",
            email: "luis@correo.cl",
            rut: "11111111-1",
            password: "123456",
            perfil: "propietario",
            telefono: "+56 9 2222 2222"
        },
        {
            id: "u-ejecutivo",
            nombre: "Elena Rivas",
            email: "elena@gestionurbana.cl",
            rut: "22222222-2",
            password: "123456",
            perfil: "ejecutivo",
            telefono: "+56 9 3333 3333"
        },
        {
            id: "u-admin",
            nombre: "Carla Admin",
            email: "admin@gestionurbana.cl",
            rut: "33333333-3",
            password: "123456",
            perfil: "admin",
            telefono: "+56 9 4444 4444"
        }
    ],
    visitas: [
        {
            id: "v1",
            propiedadId: "1",
            titulo: "Departamento Amueblado en Av. Italia",
            nombre: "Ana Pérez",
            contacto: "ana@correo.cl",
            fecha: "2026-09-04",
            hora: "10:30",
            estado: "Pendiente",
            observaciones: "Prefiere horario de mañana"
        }
    ]
};

function leerJSON(clave, respaldo) {
    try {
        const crudo = window.localStorage.getItem(clave);
        return crudo ? JSON.parse(crudo) : respaldo;
    } catch (error) {
        return respaldo;
    }
}

function guardarSesion(usuario) {
    window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

function obtenerSesion() {
    const crudo = window.sessionStorage.getItem(CLAVE_SESION);
    return crudo ? JSON.parse(crudo) : null;
}

function cerrarSesion() {
    window.sessionStorage.removeItem(CLAVE_SESION);
}

function normalizarIdentificador(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/-/g, "");
}

function buscarUsuario(valor) {
    const texto = normalizarIdentificador(valor);
    const registrados = leerJSON(CLAVE_REGISTROS, []);
    const lista = DATOS.usuarios.concat(registrados);

    return lista.find(function (usuario) {
        return normalizarIdentificador(usuario.email) === texto
            || normalizarIdentificador(usuario.rut) === texto;
    });
}

function guardarRegistro(usuario) {
    const registrados = leerJSON(CLAVE_REGISTROS, []);
    registrados.push(usuario);
    window.localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registrados));
}

function obtenerRegistros() {
    return leerJSON(CLAVE_REGISTROS, []);
}

function obtenerVisitas() {
    return DATOS.visitas.concat(leerJSON(CLAVE_VISITAS, []));
}

function guardarVisita(visita) {
    const extra = leerJSON(CLAVE_VISITAS, []);
    extra.push(visita);
    window.localStorage.setItem(CLAVE_VISITAS, JSON.stringify(extra));
}

function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

function obtenerPropiedadPorId(id) {
    return DATOS.propiedades.find(function (propiedad) {
        return propiedad.id === String(id);
    });
}
