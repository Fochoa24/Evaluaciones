import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';

const credencialesIniciales = {
    usuario: '',
    password: '',
    perfil: ''
};

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [credenciales, setCredenciales] = useState(credencialesIniciales);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'error' });
    const [erroresCampo, setErroresCampo] = useState({});
    const formRef = useRef(null);

    const destino = location.state?.from || '/dashboard';

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCredenciales((prev) => ({ ...prev, [name]: value }));
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

    const handleSubmit = (event) => {
        event.preventDefault();

        const errores = {};
        if (!credenciales.usuario.trim()) errores.usuario = 'Ingresa tu usuario o correo.';
        if (!credenciales.password) errores.password = 'Ingresa tu contraseña.';
        if (!credenciales.perfil) errores.perfil = 'Selecciona tu tipo de usuario.';

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje({ texto: 'Revisa los campos marcados.', tipo: 'error' });
            focoPrimerError(errores);
            return;
        }

        setErroresCampo({});
        const resultado = login(credenciales);

        if (!resultado.ok) {
            setMensaje({ texto: resultado.mensaje, tipo: 'error' });
            return;
        }

        setMensaje({ texto: resultado.mensaje, tipo: 'success' });

        setTimeout(() => {
            navigate(destino, { replace: true });
        }, 800);
    };

    return (
        <main className="login-contenedor">
            <section className="tarjeta-login">
                <h1>Iniciar Sesión</h1>
                <p className="subtitulo-login">Ingresa tus credenciales para acceder a la plataforma</p>

                <form ref={formRef} onSubmit={handleSubmit} className="formulario-login" noValidate>
                    <div className="campo">
                        <label htmlFor="usuario">Usuario o Correo</label>
                        <input
                            type="text"
                            id="usuario"
                            name="usuario"
                            placeholder="Ej: admin o usuario@email.com"
                            value={credenciales.usuario}
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
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            minLength="6"
                            value={credenciales.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
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
                        <label htmlFor="perfil">Tipo de Usuario</label>
                        <select
                            id="perfil"
                            name="perfil"
                            value={credenciales.perfil}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.perfil ? 'true' : undefined}
                            aria-describedby={erroresCampo.perfil ? 'perfil-error' : undefined}
                        >
                            <option value="" disabled>
                                Selecciona tu perfil
                            </option>
                            <option value="cliente">Cliente / Arrendatario</option>
                            <option value="propietario">Propietario</option>
                            <option value="ejecutivo">Ejecutivo Inmobiliario</option>
                            <option value="admin">Administrador</option>
                        </select>
                        {erroresCampo.perfil && (
                            <span id="perfil-error" className="error-campo">
                                {erroresCampo.perfil}
                            </span>
                        )}
                    </div>

                    <button type="submit" className="boton boton-login">
                        Ingresar
                    </button>

                    <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

                    <p className="enlace-registro">
                        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
