import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';
import { rutValido } from '../services/rut';

const registroInicial = {
    nombre: '',
    usuario: '',
    email: '',
    rut: '',
    telefono: '',
    password: '',
    confirmar: '',
    rol: 'cliente'
};

export default function Registro() {
    const { registrar } = useAuth();
    const [datos, setDatos] = useState(registroInicial);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'error' });
    const [erroresCampo, setErroresCampo] = useState({});
    const [enviando, setEnviando] = useState(false);
    const formRef = useRef(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setDatos((prev) => ({ ...prev, [name]: value }));
        setErroresCampo((prev) => {
            if (!prev[name]) return prev;
            const siguiente = { ...prev };
            delete siguiente[name];
            return siguiente;
        });
    };

    const focoPrimerError = (errores) => {
        const primero = Object.keys(errores)[0];
        if (!primero || !formRef.current) return;
        const campo = formRef.current.elements.namedItem(primero);
        if (campo && typeof campo.focus === 'function') {
            campo.focus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errores = {};
        if (!datos.nombre.trim()) errores.nombre = 'Ingresa tu nombre completo.';
        if (!datos.usuario.trim()) errores.usuario = 'Ingresa un usuario.';
        if (!datos.email.trim()) errores.email = 'Ingresa tu correo electrónico.';
        if (!datos.rut.trim()) errores.rut = 'Ingresa tu RUT.';
        else if (!rutValido(datos.rut)) errores.rut = 'El RUT no es válido. Revisa el dígito verificador.';
        if (!datos.password) errores.password = 'Ingresa una contraseña.';
        if (datos.password && datos.password.length < 6) {
            errores.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
        if (datos.password !== datos.confirmar) {
            errores.confirmar = 'Las contraseñas no coinciden.';
        }

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje({ texto: 'Revisa los campos marcados.', tipo: 'error' });
            focoPrimerError(errores);
            return;
        }

        setErroresCampo({});
        setEnviando(true);
        const resultado = await registrar(datos);
        setEnviando(false);

        if (!resultado.ok) {
            setMensaje({ texto: resultado.mensaje, tipo: 'error' });
            return;
        }

        // Sin sesión: la cuenta queda Pendiente hasta abrir el enlace del correo.
        setDatos(registroInicial);
        setMensaje({
            texto: `${resultado.mensaje} Revisa tu bandeja de entrada (y spam); el enlace vence en 24 horas.`,
            tipo: 'success'
        });
    };

    return (
        <main className="login-contenedor">
            <section className="tarjeta-login">
                <h1>Crear Cuenta</h1>
                <p className="subtitulo-login">Regístrate para solicitar visitas y gestionar propiedades</p>

                <form ref={formRef} onSubmit={handleSubmit} className="formulario-login" noValidate>
                    <div className="campo">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ej: María Pérez"
                            value={datos.nombre}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            aria-invalid={erroresCampo.nombre ? 'true' : undefined}
                            aria-describedby={erroresCampo.nombre ? 'nombre-error' : undefined}
                        />
                        {erroresCampo.nombre && (
                            <span id="nombre-error" className="error-campo">
                                {erroresCampo.nombre}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="usuario">Usuario</label>
                        <input
                            type="text"
                            id="usuario"
                            name="usuario"
                            placeholder="Ej: mariaperez"
                            value={datos.usuario}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            aria-invalid={erroresCampo.usuario ? 'true' : undefined}
                            aria-describedby={erroresCampo.usuario ? 'usuario-error' : undefined}
                        />
                        {erroresCampo.usuario && (
                            <span id="usuario-error" className="error-campo">
                                {erroresCampo.usuario}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Ej: usuario@email.com"
                            value={datos.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            aria-invalid={erroresCampo.email ? 'true' : undefined}
                            aria-describedby={erroresCampo.email ? 'email-error' : undefined}
                        />
                        {erroresCampo.email && (
                            <span id="email-error" className="error-campo">
                                {erroresCampo.email}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="rut">RUT</label>
                        <input
                            type="text"
                            id="rut"
                            name="rut"
                            placeholder="Ej: 12.345.678-5"
                            value={datos.rut}
                            onChange={handleChange}
                            required
                            inputMode="text"
                            autoComplete="off"
                            aria-invalid={erroresCampo.rut ? 'true' : undefined}
                            aria-describedby={erroresCampo.rut ? 'rut-error' : 'rut-ayuda'}
                        />
                        {erroresCampo.rut ? (
                            <span id="rut-error" className="error-campo">
                                {erroresCampo.rut}
                            </span>
                        ) : (
                            <small id="rut-ayuda">Dato privado: solo lo ve el equipo de la inmobiliaria.</small>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="telefono">Teléfono (opcional)</label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            placeholder="Ej: +56 9 1234 5678"
                            value={datos.telefono}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mínimo 6 caracteres"
                            minLength="6"
                            value={datos.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            aria-invalid={erroresCampo.password ? 'true' : undefined}
                            aria-describedby={erroresCampo.password ? 'password-error' : undefined}
                        />
                        {erroresCampo.password && (
                            <span id="password-error" className="error-campo">
                                {erroresCampo.password}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="confirmar">Confirmar contraseña</label>
                        <input
                            type="password"
                            id="confirmar"
                            name="confirmar"
                            placeholder="Repite tu contraseña"
                            minLength="6"
                            value={datos.confirmar}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            aria-invalid={erroresCampo.confirmar ? 'true' : undefined}
                            aria-describedby={erroresCampo.confirmar ? 'confirmar-error' : undefined}
                        />
                        {erroresCampo.confirmar && (
                            <span id="confirmar-error" className="error-campo">
                                {erroresCampo.confirmar}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="rol">Tipo de Usuario</label>
                        <select id="rol" name="rol" value={datos.rol} onChange={handleChange} required>
                            <option value="cliente">Cliente / Arrendatario</option>
                            <option value="propietario">Propietario</option>
                        </select>
                        {datos.rol === 'propietario' && (
                            <small>Un ejecutivo verificará tus datos antes de que puedas publicar propiedades.</small>
                        )}
                    </div>

                    <button type="submit" className="boton boton-login" disabled={enviando}>
                        {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>

                    <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

                    <p className="enlace-registro">
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
