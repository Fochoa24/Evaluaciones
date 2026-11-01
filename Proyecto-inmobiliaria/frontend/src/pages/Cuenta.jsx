import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const claveInicial = { actual: '', nueva: '', confirmar: '' };

/**
 * Mi cuenta (§8): datos propios con el RUT (se pide aparte de la sesión
 * para no guardarlo en localStorage), edición de nombre y teléfono y
 * cambio de contraseña (obligatorio tras recibir una temporal).
 */
export default function Cuenta() {
    const { user, refrescarSesion } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [datos, setDatos] = useState({ nombre: '', telefono: '' });
    const [clave, setClave] = useState(claveInicial);
    const [mensajeDatos, setMensajeDatos] = useState({ texto: '', tipo: 'success' });
    const [mensajeClave, setMensajeClave] = useState({ texto: '', tipo: 'success' });

    useEffect(() => {
        api('/api/auth/perfil')
            .then((respuesta) => {
                setPerfil(respuesta);
                setDatos({ nombre: respuesta.nombre, telefono: respuesta.telefono });
            })
            .catch((error) => setMensajeDatos({ texto: error.message, tipo: 'error' }));
    }, []);

    const guardarDatos = async (event) => {
        event.preventDefault();
        if (!datos.nombre.trim()) {
            setMensajeDatos({ texto: 'El nombre no puede quedar vacío.', tipo: 'error' });
            return;
        }
        try {
            const actualizado = await api('/api/auth/perfil', { method: 'PATCH', body: datos });
            setPerfil((prev) => ({ ...prev, ...actualizado }));
            await refrescarSesion();
            setMensajeDatos({ texto: 'Datos actualizados.', tipo: 'success' });
        } catch (error) {
            setMensajeDatos({ texto: error.message, tipo: 'error' });
        }
    };

    const cambiarClave = async (event) => {
        event.preventDefault();
        if (clave.nueva.length < 6) {
            setMensajeClave({ texto: 'La contraseña debe tener al menos 6 caracteres.', tipo: 'error' });
            return;
        }
        if (clave.nueva !== clave.confirmar) {
            setMensajeClave({ texto: 'Las contraseñas no coinciden.', tipo: 'error' });
            return;
        }
        try {
            const { mensaje } = await api('/api/auth/password', {
                method: 'PATCH',
                body: { actual: clave.actual, nueva: clave.nueva }
            });
            setClave(claveInicial);
            setMensajeClave({ texto: mensaje, tipo: 'success' });
            // Quita la marca de contraseña temporal de la sesión (desbloquea el resto del sitio).
            await refrescarSesion();
        } catch (error) {
            setMensajeClave({ texto: error.message, tipo: 'error' });
        }
    };

    const alCambiar = (setter) => (event) => {
        const { name, value } = event.target;
        setter((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">MI CUENTA</p>
                <h1>{perfil?.nombre || 'Mi cuenta'}</h1>
                {perfil && (
                    <p className="subtitulo-login">
                        @{perfil.usuario} · {perfil.email} · RUT {perfil.rut} · <Badge estado={perfil.estado} />
                    </p>
                )}
                {user?.debeCambiarPassword && (
                    <p className="mensaje error visible" role="alert">
                        Tu cuenta tiene una contraseña temporal. Cámbiala abajo para usar el resto del sitio.
                    </p>
                )}
            </section>

            <section className="tarjeta-form">
                <h2>Datos personales</h2>
                <form onSubmit={guardarDatos} className="formulario-propiedad" noValidate aria-label="Datos personales">
                    <div className="campo">
                        <label htmlFor="cuenta-nombre">Nombre</label>
                        <input id="cuenta-nombre" name="nombre" type="text" value={datos.nombre} onChange={alCambiar(setDatos)} required />
                    </div>
                    <div className="campo">
                        <label htmlFor="cuenta-telefono">Teléfono</label>
                        <input id="cuenta-telefono" name="telefono" type="tel" value={datos.telefono} onChange={alCambiar(setDatos)} />
                    </div>
                    <p className="campo-completo subtexto-tabla">
                        El correo y el RUT son datos verificados: para cambiarlos, contacta a la inmobiliaria.
                    </p>
                    <div className="campo-completo">
                        <Mensaje texto={mensajeDatos.texto} tipo={mensajeDatos.tipo} />
                    </div>
                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton">Guardar datos</button>
                    </div>
                </form>
            </section>

            <section className="tarjeta-form">
                <h2>Cambiar contraseña</h2>
                <form onSubmit={cambiarClave} className="formulario-propiedad" noValidate aria-label="Cambiar contraseña">
                    <div className="campo">
                        <label htmlFor="cuenta-actual">Contraseña actual</label>
                        <input id="cuenta-actual" name="actual" type="password" autoComplete="current-password" value={clave.actual} onChange={alCambiar(setClave)} required />
                    </div>
                    <div className="campo">
                        <label htmlFor="cuenta-nueva">Nueva contraseña</label>
                        <input id="cuenta-nueva" name="nueva" type="password" autoComplete="new-password" minLength="6" value={clave.nueva} onChange={alCambiar(setClave)} required />
                    </div>
                    <div className="campo">
                        <label htmlFor="cuenta-confirmar">Confirmar nueva contraseña</label>
                        <input id="cuenta-confirmar" name="confirmar" type="password" autoComplete="new-password" minLength="6" value={clave.confirmar} onChange={alCambiar(setClave)} required />
                    </div>
                    <div className="campo-completo">
                        <Mensaje texto={mensajeClave.texto} tipo={mensajeClave.tipo} />
                    </div>
                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton">Cambiar contraseña</button>
                    </div>
                </form>
            </section>
        </main>
    );
}
