# Gestión Inmobiliaria

Aplicación web para administrar el arriendo de propiedades: catálogo público, agenda de visitas,
solicitudes de arriendo con doble aprobación y administración de usuarios por rol
(admin, ejecutivo, propietario, cliente).

- **Backend:** Node.js + Express 5 + MongoDB (Mongoose) — carpeta `backend/`
- **Frontend:** React + Vite — carpeta `frontend/`
- **Modelo de datos y reglas de negocio:** `docs/modelo-logico.md`

## Estructura del backend

```
backend/
├── server.js            Servidor Express: middleware, rutas, manejo de errores y tareas horarias
├── config/
│   ├── db.js            Conexión a MongoDB (Mongoose)
│   └── constantes.js    Roles, estados y parámetros de negocio
├── models/              Schemas de Mongoose: Usuario, Propiedad, Visita, Arriendo
├── routes/              Solo URLs y permisos: método + ruta + middleware → controlador
├── controllers/         Lógica de cada endpoint (validaciones, consultas, transacciones)
├── middleware/auth.js   Verificación del JWT y de los roles
├── utils/               Reglas reutilizables: agenda, permisos, cascadas, RUT, correo
├── data/semilla.js      Datos de demostración
├── seed.js              Carga la semilla en la base (npm run seed)
└── test/                Pruebas unitarias (node --test)
```

## Puesta en marcha

Requisitos: Node.js 18 o superior y una base MongoDB que sea **replica set** (MongoDB Atlas lo es;
se necesita para las transacciones).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # completar MONGODB_URI y JWT_SECRET
npm run seed              # BORRA y carga los datos de demostración
npm run dev               # API en http://localhost:3000
```

Comprobar que la API y la base responden: `GET http://localhost:3000/api/salud`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev               # http://localhost:5173
```

`FRONTEND_URL` en el `.env` del backend debe coincidir con la URL del frontend (CORS y enlaces de los correos).

### Usuarios de demostración

| Perfil      | Usuario       | Contraseña       |
|-------------|---------------|------------------|
| admin       | `admin`       | `admin123`       |
| ejecutivo   | `ejecutivo`   | `ejecutivo123`   |
| propietario | `propietario` | `propietario123` |
| cliente     | `cliente`     | `cliente123`     |

Los correos (activación de cuenta, avisos) se imprimen en la terminal del backend.

## API

| Recurso | Rutas |
|---|---|
| `/api/auth` | `POST /login`, `POST /registro`, `POST /verificar`, `POST /reenviar-verificacion`, `GET /yo`, `GET·PATCH /perfil`, `PATCH /password` |
| `/api/propiedades` | `GET /`, `GET /:id`, `GET /:id/horarios`, `POST /`, `PATCH /:id`, `POST /:id/estado`, `DELETE /:id` |
| `/api/visitas` | `GET /`, `POST /`, `POST /:id/estado`, `PATCH /:id`, `DELETE /:id` |
| `/api/arriendos` | `GET /`, `POST /`, `POST /:id/estado`, `DELETE /:id` |
| `/api/usuarios` | `GET /`, `POST /`, `PATCH /:id`, `POST /:id/verificar`, `/rechazar`, `/baja`, `/reactivar`, `DELETE /:id` |
| `/api/salud` | `GET` — estado de la API y de la conexión a MongoDB |

Las rutas protegidas reciben `Authorization: Bearer <token>`. Los errores responden `{ mensaje }`
con el código HTTP correspondiente.

## Pruebas

```bash
cd backend && npm test && npm run lint
cd frontend && npm run lint
```
