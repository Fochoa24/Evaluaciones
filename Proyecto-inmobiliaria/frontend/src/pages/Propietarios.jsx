import { useState } from 'react';
import { ESTADOS_PROPIETARIO } from '../data/propietarios';
import { usePropietarios } from '../context/PropietariosContext';
import { usePropiedades } from '../context/PropiedadesContext';
import Mensaje from '../components/Mensaje';

const formularioInicial = {
    nombre: '',
    email: '',
    telefono: '',
    rut: '',
    estado: 'Activo'
};

export default function Propietarios() {
    const { propietarios, crear, actualizar, eliminar } = usePropietarios();
    const { propiedades } = usePropiedades();
    const [form, setForm] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const [erroresCampo, setErroresCampo] = useState({});

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

    const validar = () => {
        const errores = {};
        if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
        if (!form.email.trim() || !form.email.includes('@')) {
            errores.email = 'Ingresa un correo válido.';
        }
        return errores;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const errores = validar();
        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje({ texto: 'Revisa los campos marcados.', tipo: 'error' });
            return;
        }

        setErroresCampo({});
        const datos = {
            nombre: form.nombre.trim(),
            email: form.email.trim(),
            telefono: form.telefono.trim(),
            rut: form.rut.trim(),
            estado: form.estado
        };

        if (editandoId) {
            actualizar(editandoId, datos);
            setMensaje({ texto: 'Propietario actualizado.', tipo: 'success' });
            setEditandoId(null);
        } else {
            crear(datos);
            setMensaje({ texto: 'Propietario agregado.', tipo: 'success' });
        }

        setForm(formularioInicial);
    };

    const editar = (propietario) => {
        setEditandoId(propietario.id);
        setForm({
            nombre: propietario.nombre,
            email: propietario.email,
            telefono: propietario.telefono,
            rut: propietario.rut,
            estado: propietario.estado
        });
        setMensaje({ texto: '', tipo: 'success' });
    };

    const cancelar = () => {
        setEditandoId(null);
        setForm(formularioInicial);
        setMensaje({ texto: '', tipo: 'success' });
    };

    const eliminarPropietario = (propietario) => {
        if (window.confirm(`¿Eliminar al propietario "${propietario.nombre}"?`)) {
            eliminar(propietario.id);
            setMensaje({ texto: 'Propietario eliminado.', tipo: 'success' });
        }
    };

    const propiedadesDe = (id) => propiedades.filter((item) => item.propietarioId === id).length;

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">GESTIÓN DE DUEÑOS</p>
                <h1>Propietarios</h1>
                <p className="subtitulo-login">
                    Administra los dueños de los inmuebles y asócialos a cada propiedad.
                </p>
            </section>

            <section className="tarjeta-form">
                <h2>{editandoId ? 'Editar propietario' : 'Nuevo propietario'}</h2>
                <form
                    onSubmit={handleSubmit}
                    className="formulario-propiedad"
                    noValidate
                    aria-label="Formulario de propietario"
                >
                    <div className="campo">
                        <label htmlFor="nombre-propietario">Nombre</label>
                        <input
                            type="text"
                            id="nombre-propietario"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.nombre ? 'true' : undefined}
                            aria-describedby={erroresCampo.nombre ? 'nombre-propietario-error' : undefined}
                        />
                        {erroresCampo.nombre && (
                            <span id="nombre-propietario-error" className="error-campo">
                                {erroresCampo.nombre}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="email-propietario">Correo</label>
                        <input
                            type="email"
                            id="email-propietario"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.email ? 'true' : undefined}
                            aria-describedby={erroresCampo.email ? 'email-propietario-error' : undefined}
                        />
                        {erroresCampo.email && (
                            <span id="email-propietario-error" className="error-campo">
                                {erroresCampo.email}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="telefono-propietario">Teléfono</label>
                        <input
                            type="tel"
                            id="telefono-propietario"
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="rut-propietario">RUT</label>
                        <input
                            type="text"
                            id="rut-propietario"
                            name="rut"
                            placeholder="Ej: 12.345.678-5"
                            value={form.rut}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="estado-propietario">Estado</label>
                        <select
                            id="estado-propietario"
                            name="estado"
                            value={form.estado}
                            onChange={handleChange}
                        >
                            {ESTADOS_PROPIETARIO.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-completo">
                        <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
                    </div>

                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton">
                            {editandoId ? 'Guardar cambios' : 'Agregar propietario'}
                        </button>
                        {editandoId && (
                            <button
                                type="button"
                                className="boton boton-secundario"
                                onClick={cancelar}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="table-panel">
                <h2>Listado de propietarios</h2>
                {propietarios.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Listado de propietarios">
                            <thead>
                                <tr>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Contacto</th>
                                    <th scope="col">RUT</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Propiedades</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propietarios.map((propietario) => (
                                    <tr key={propietario.id}>
                                        <th scope="row">{propietario.nombre}</th>
                                        <td>
                                            {propietario.email}
                                            <div className="subtexto-tabla">
                                                {propietario.telefono || 'Sin teléfono'}
                                            </div>
                                        </td>
                                        <td>{propietario.rut || '—'}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    propietario.estado === 'Activo'
                                                        ? 'disponible'
                                                        : 'vendida'
                                                }`}
                                            >
                                                {propietario.estado}
                                            </span>
                                        </td>
                                        <td>{propiedadesDe(propietario.id)}</td>
                                        <td>
                                            <div className="acciones-tabla">
                                                <button
                                                    type="button"
                                                    className="boton boton-mini"
                                                    onClick={() => editar(propietario)}
                                                    aria-label={`Editar propietario ${propietario.nombre}`}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="boton boton-mini boton-peligro"
                                                    onClick={() => eliminarPropietario(propietario)}
                                                    aria-label={`Eliminar propietario ${propietario.nombre}`}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        Aún no hay propietarios registrados.
                    </p>
                )}
            </section>
        </main>
    );
}
