import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Mensaje from '../components/Mensaje';
import { useAuth } from '../context/AuthContext';

/**
 * Destino del enlace de activación enviado por correo (D14).
 * Confirma el token una sola vez: el enlace es de un solo uso.
 */
export default function Verificar() {
    const { token } = useParams();
    const { verificarCorreo } = useAuth();
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const enviado = useRef(false);

    useEffect(() => {
        // StrictMode ejecuta el efecto dos veces en desarrollo; la segunda llamada vería el token ya usado.
        if (enviado.current) return;
        enviado.current = true;
        verificarCorreo(token).then((resultado) =>
            setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? 'success' : 'error' })
        );
    }, [token, verificarCorreo]);

    return (
        <main className="login-contenedor">
            <section className="tarjeta-login">
                <h1>Activación de cuenta</h1>
                {mensaje.texto ? (
                    <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
                ) : (
                    <p className="subtitulo-login" role="status">
                        Confirmando tu correo...
                    </p>
                )}
                <p className="enlace-registro">
                    <Link to="/login">Ir a iniciar sesión</Link>
                </p>
            </section>
        </main>
    );
}
