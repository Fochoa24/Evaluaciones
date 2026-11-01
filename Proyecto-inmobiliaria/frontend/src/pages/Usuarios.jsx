import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { rutValido } from '../services/rut';

const ETIQUETAS_ROL = {
    admin: 'Administrador',
    ejecutivo: 'Ejecutivo',
    propietario: 'Propietario',
    cliente: 'Cliente'
};
/** Igual que backend/routes/usuarios.js: el ejecutivo administra propietarios y clientes. */
const ROLES_POR_ACTOR = {
    admin: ['propietario', 'cliente', 'ejecutivo', 'admin'],
    ejecutivo: ['propietario', 'cliente']
};
const ESTADOS_CUENTA = ['Pendiente', 'Activo', 'Inactivo'];
/** Efectos de la baja que se advierten antes de confirmar (§7). */
const EFECTOS_BAJA = {
    propietario: 'Sus propiedades pasarán a Inactiva y se cancelarán sus visitas y solicitudes abiertas.',
    cliente: 'Se cancelarán sus visitas y solicitudes abiertas.',
    ejecutivo: 'Su cartera se repartirá entre los demás ejecutivos; sus visitas y solicitudes volverán a Pendiente.',
    admin: 'Perderá el acceso de administración.'
};

const formularioInicial = { nombre: '', usuario: '', email: '', rut: '', telefono: '', rol: '' };

/**
 * Texto del resumen que devuelve POST /api/usuarios/:id/baja.
 * @param {object} resumen
 * @returns {string}
 */
function describirResumen(resumen) {
    const partes = [];
    if (resumen.propiedadesInactivas) partes.push(`${resumen.propiedadesInactivas} propiedad(es) pasaron a Inactiva`);
    if (resumen.visitasCanceladas) partes.push(`${resumen.visitasCanceladas} visita(s) cancelada(s)`);
    if (resumen.arriendosCancelados) partes.push(`${resumen.arriendosCancelados} solicitud(es) cancelada(s)`);
    if (resumen.reasignacion) {
        const detalle = Object.entries(resumen.reasignacion)
            .map(([propiedad, ejecutivo]) => `propiedad ${propiedad} → ejecutivo ${ejecutivo}`)
            .join(', ');
        partes.push(`cartera repartida (${detalle || 'sin propiedades'})`);
    }
    if (resumen.visitasReasignadas) partes.push(`${resumen.visitasReasignadas} visita(s) volvieron a Pendiente`);
    if (resumen.arriendosReiniciados) partes.push(`${resumen.arriendosReiniciados} solicitud(es) volvieron a Pendiente`);
    return partes.length ? `${partes.join('; ')}.` : 'Sin efectos en otros registros.';
}

/**
 * Administración de cuentas (§8): el ejecutivo gestiona propietarios y
 * clientes (alta, ficha, verificación, baja); el admin, además, internos y
 * borrado físico. Toda acción se confirma en el backend.
 */
export default function Usuarios() {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const rolesPermitidos = ROLES_POR_ACTOR[user.rol] || [];
    const filtroRol = rolesPermitidos.includes(params.get('rol')) ? params.get('rol') : '';
    const filtroEstado = ESTADOS_CUENTA.includes(params.get('estado')) ? params.get('estado') : '';

    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [form, setForm] = useState({ ...formularioInicial, rol: rolesPermitidos[0] });
    const [editando, setEditando] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const [erroresCampo, setErroresCampo] = useState({});
    const [enviando, setEnviando] = useState(false);

    const cargar = useCallback(async () => {
        const consulta = new URLSearchParams({
            ...(filtroRol && { rol: filtroRol }),
            ...(filtroEstado && { estado: filtroEstado })
        });
        try {
            setUsuarios(await api(`/api/usuarios?${consulta}`));
        } catch (error) {
            setMensaje({ texto: error.message, tipo: 'error' });
        } finally {
            setCargando(false);
        }
    }, [filtroRol, filtroEstado]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const cambiarFiltro = (event) => {
        const { name, value } = event.target;
        const siguiente = new URLSearchParams(params);
        if (value) siguiente.set(name, value);
        else siguiente.delete(name);
        setParams(siguiente, { replace: true });
    };

    /**
     * Ejecuta una acción de la API y recarga la lista.
     * @param {string} exito - Mensaje si sale bien.
     * @param {string} ruta @param {object} opciones - Para api().
     */
    const ejecutar = async (exito, ruta, opciones) => {
        try {
            const respuesta = await api(ruta, opciones);
            const extra = respuesta?.resumen ? ` ${describirResumen(respuesta.resumen)}` : '';
            setMensaje({ texto: `${exito}.${extra}`, tipo: 'success' });
            await cargar();
        } catch (error) {
            setMensaje({ texto: error.message, tipo: 'error' });
        }
    };

    const darDeBaja = (u) => {
        if (window.confirm(`¿Dar de baja a ${u.nombre}? ${EFECTOS_BAJA[u.rol]}`)) {
            ejecutar(`${u.nombre} quedó desactivado`, `/api/usuarios/${u.id}/baja`, { method: 'POST' });
        }
    };

    const rechazar = (u) => {
        if (window.confirm(`¿Rechazar la verificación de ${u.nombre}? La cuenta quedará desactivada.`)) {
            ejecutar(`Verificación de ${u.nombre} rechazada`, `/api/usuarios/${u.id}/rechazar`, { method: 'POST' });
        }
    };

    const eliminarUsuario = (u) => {
        if (window.confirm(`¿Eliminar definitivamente a ${u.nombre}? Esta acción no se puede deshacer.`)) {
            ejecutar(`${u.nombre} fue eliminado`, `/api/usuarios/${u.id}`, { method: 'DELETE' });
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErroresCampo((prev) => {
            if (!prev[name]) return prev;
            const siguiente = { ...prev };
            delete siguiente[name];
            return siguiente;
        });
    };

    const cancelar = () => {
        setEditando(null);
        setForm({ ...formularioInicial, rol: rolesPermitidos[0] });
        setErroresCampo({});
    };

    const editar = (u) => {
        setEditando(u);
        setForm({ nombre: u.nombre, usuario: u.usuario, email: u.email, rut: u.rut, telefono: u.telefono, rol: u.rol });
        setMensaje({ texto: '', tipo: 'success' });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errores = {};
        if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
        if (!editando && !form.usuario.trim()) errores.usuario = 'El usuario es obligatorio.';
        if (!form.email.trim() || !form.email.includes('@')) errores.email = 'Ingresa un correo válido.';
        if (!rutValido(form.rut)) errores.rut = 'El RUT no es válido. Revisa el dígito verificador.';
        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje({ texto: 'Revisa los campos marcados.', tipo: 'error' });
            return;
        }

        const { nombre, usuario, email, rut, telefono, rol } = form;
        setEnviando(true);
        try {
            if (editando) {
                const cambios = { nombre, email, rut, telefono, ...(rol !== editando.rol && { rol }) };
                await api(`/api/usuarios/${editando.id}`, { method: 'PATCH', body: cambios });
                setMensaje({ texto: 'Datos actualizados.', tipo: 'success' });
            } else {
                const { passwordTemporal } = await api('/api/usuarios', {
                    method: 'POST',
                    body: { nombre, usuario, email, rut, telefono, rol }
                });
                setMensaje({
                    texto: `Cuenta creada. Contraseña temporal: ${passwordTemporal} — también se envió por correo; debe cambiarla en "Mi cuenta".`,
                    tipo: 'success'
                });
            }
            cancelar();
            await cargar();
        } catch (error) {
            setMensaje({ texto: error.message, tipo: 'error' });
        } finally {
            setEnviando(false);
        }
    };

    const campo = (nombre, etiqueta, props = {}) => (
        <div className="campo">
            <label htmlFor={`${nombre}-usuario`}>{etiqueta}</label>
            <input
                id={`${nombre}-usuario`}
                name={nombre}
                value={form[nombre]}
                onChange={handleChange}
                aria-invalid={erroresCampo[nombre] ? 'true' : undefined}
                aria-describedby={erroresCampo[nombre] ? `${nombre}-usuario-error` : undefined}
                {...props}
            />
            {erroresCampo[nombre] && (
                <span id={`${nombre}-usuario-error`} className="error-campo">
                    {erroresCampo[nombre]}
                </span>
            )}
        </div>
    );

    const acciones = (u) => {
        const propio = u.id === user.id;
        const botones = [];
        if (u.rol === 'propietario' && u.estado === 'Pendiente') {
            botones.push(
                <button
                    key="verificar"
                    type="button"
                    className="boton boton-mini"
                    disabled={!u.emailVerificado}
                    title={u.emailVerificado ? undefined : 'Aún no confirma su correo'}
                    onClick={() => ejecutar(`${u.nombre} quedó verificado`, `/api/usuarios/${u.id}/verificar`, { method: 'POST' })}
                >
                    Verificar
                </button>,
                <button key="rechazar" type="button" className="boton boton-mini boton-peligro" onClick={() => rechazar(u)}>
                    Rechazar
                </button>
            );
        }
        if (u.estado !== 'Inactivo') {
            botones.push(
                <button key="editar" type="button" className="boton boton-mini" onClick={() => editar(u)}>
                    Editar
                </button>
            );
        }
        if (u.estado === 'Activo' && !propio) {
            botones.push(
                <button key="baja" type="button" className="boton boton-mini boton-peligro" onClick={() => darDeBaja(u)}>
                    Dar de baja
                </button>
            );
        }
        if (u.estado === 'Inactivo') {
            botones.push(
                <button
                    key="reactivar"
                    type="button"
                    className="boton boton-mini"
                    onClick={() => ejecutar(`${u.nombre} fue reactivado`, `/api/usuarios/${u.id}/reactivar`, { method: 'POST' })}
                >
                    Reactivar
                </button>
            );
        }
        if (user.rol === 'admin' && u.estado !== 'Activo' && !propio) {
            botones.push(
                <button key="eliminar" type="button" className="boton boton-mini boton-peligro" onClick={() => eliminarUsuario(u)}>
                    Eliminar
                </button>
            );
        }
        return botones;
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">GESTIÓN DE CUENTAS</p>
                <h1>Usuarios</h1>
                <p className="subtitulo-login">
                    {user.rol === 'admin'
                        ? 'Administra todas las cuentas: propietarios, clientes y equipo interno.'
                        : 'Verifica propietarios y administra las cuentas de propietarios y clientes.'}
                </p>
            </section>

            <section className="tarjeta-form">
                <h2>{editando ? `Editar a ${editando.nombre}` : 'Nueva cuenta'}</h2>
                <form onSubmit={handleSubmit} className="formulario-propiedad" noValidate aria-label="Formulario de usuario">
                    {campo('nombre', 'Nombre', { type: 'text', required: true })}
                    {campo('usuario', 'Usuario', { type: 'text', required: true, disabled: Boolean(editando) })}
                    {campo('email', 'Correo', { type: 'email', required: true })}
                    {campo('rut', 'RUT', { type: 'text', required: true, placeholder: 'Ej: 12.345.678-5' })}
                    {campo('telefono', 'Teléfono', { type: 'tel' })}

                    <div className="campo">
                        <label htmlFor="rol-usuario">Rol</label>
                        <select
                            id="rol-usuario"
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                            disabled={Boolean(editando) && user.rol !== 'admin'}
                        >
                            {rolesPermitidos.map((rol) => (
                                <option key={rol} value={rol}>
                                    {ETIQUETAS_ROL[rol]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-completo">
                        <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
                    </div>

                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton" disabled={enviando}>
                            {editando ? 'Guardar cambios' : 'Crear cuenta'}
                        </button>
                        {editando && (
                            <button type="button" className="boton boton-secundario" onClick={cancelar}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="contenedor-filtros" aria-label="Filtrar usuarios">
                <div className="bar-filtros">
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-rol">Rol</label>
                        <select id="filtro-rol" name="rol" value={filtroRol} onChange={cambiarFiltro}>
                            <option value="">Todos</option>
                            {rolesPermitidos.map((rol) => (
                                <option key={rol} value={rol}>
                                    {ETIQUETAS_ROL[rol]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grupo-filtro">
                        <label htmlFor="filtro-estado">Estado</label>
                        <select id="filtro-estado" name="estado" value={filtroEstado} onChange={cambiarFiltro}>
                            <option value="">Todos</option>
                            {ESTADOS_CUENTA.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Cuentas</h2>
                {cargando ? (
                    <p role="status">Cargando usuarios...</p>
                ) : usuarios.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Listado de usuarios">
                            <thead>
                                <tr>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Contacto</th>
                                    <th scope="col">RUT</th>
                                    <th scope="col">Rol</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Propiedades</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id}>
                                        <th scope="row">
                                            {u.nombre}
                                            <div className="subtexto-tabla">
                                                @{u.usuario} · id {u.id}
                                            </div>
                                        </th>
                                        <td>
                                            {u.email}
                                            <div className="subtexto-tabla">{u.telefono || 'Sin teléfono'}</div>
                                        </td>
                                        <td>{u.rut}</td>
                                        <td>{ETIQUETAS_ROL[u.rol]}</td>
                                        <td>
                                            <Badge estado={u.estado} />
                                            {!u.emailVerificado && (
                                                <div className="subtexto-tabla">Correo sin confirmar</div>
                                            )}
                                        </td>
                                        <td>
                                            {u.rol === 'propietario'
                                                ? `${u.propiedades} propia(s)`
                                                : u.rol === 'ejecutivo'
                                                  ? `${u.cartera} en cartera`
                                                  : '—'}
                                        </td>
                                        <td>
                                            <div className="acciones-tabla">{acciones(u)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay cuentas con esos filtros.
                    </p>
                )}
            </section>
        </main>
    );
}
