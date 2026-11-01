/**
 * Envío de correos transaccionales (activación D14, vencimientos D15).
 * ponytail: modo consola, el correo se imprime en la terminal del servidor.
 * Para enviar de verdad, reemplazar el cuerpo por nodemailer + variables SMTP_* en .env.
 * @param {{para: string, asunto: string, texto: string}} correo
 */
async function enviarCorreo({ para, asunto, texto }) {
    console.log(`\n[correo] Para: ${para}\n[correo] Asunto: ${asunto}\n${texto}\n`);
}

module.exports = { enviarCorreo };
