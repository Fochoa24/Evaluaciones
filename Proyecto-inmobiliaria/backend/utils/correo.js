const nodemailer = require('nodemailer');

/**
 * Transporte SMTP de nodemailer, o null si no hay credenciales (modo consola).
 * Funciona con cualquier proveedor SMTP: Gmail (smtp.gmail.com, 465, con una
 * contraseña de aplicación), Resend, Outlook, etc. Ver .env.example.
 */
const transporte = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        // 465 usa TLS desde el inicio; 587 negocia STARTTLS.
        secure: (Number(process.env.SMTP_PORT) || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    : null;

/** Remitente visible, p. ej. "Gestión Urbana <cuenta@gmail.com>". */
const REMITENTE = process.env.SMTP_FROM || `Gestión Urbana <${process.env.SMTP_USER}>`;

/** Escribe el correo completo en la terminal / logs del servidor. */
const imprimir = ({ para, asunto, texto }) =>
    console.log(`
[correo] Para: ${para}
[correo] Asunto: ${asunto}
${texto}
`);

/**
 * Envío de correos transaccionales (activación D14, visitas D20, arriendos D15).
 * Con SMTP_* en .env los envía con nodemailer; sin ellas, los imprime en la
 * terminal del servidor (modo consola, para desarrollo).
 * Nunca lanza: se llama después de guardar los cambios, y un fallo del correo
 * no debe convertir en error una operación que ya se hizo. Si el envío falla,
 * el correo completo queda en el log para recuperarlo (p. ej. el enlace de
 * activación) y el usuario puede pedir que se reenvíe.
 * @param {{para: string, asunto: string, texto: string}} correo
 */
async function enviarCorreo(correo) {
    if (!transporte) {
        imprimir(correo);
        return;
    }
    try {
        await transporte.sendMail({ from: REMITENTE, to: correo.para, subject: correo.asunto, text: correo.texto });
        console.log(`[correo] Enviado a ${correo.para}: ${correo.asunto}`);
    } catch (error) {
        console.error(`[correo] No se pudo enviar a ${correo.para}: ${error.message}`);
        imprimir(correo);
    }
}

module.exports = { enviarCorreo };
