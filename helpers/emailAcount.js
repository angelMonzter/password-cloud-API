import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración del servicio de correo
const sendVerificationEmail = async (correo, nombre, token) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Configuración del contenido del correo
    const info = await transporter.sendMail({
        from: '"Password Cloud"  <password_cloud@angelvelazquez.site>', // Dirección de remitente
        to: correo, // Dirección de destino
        subject: "Verifica tu cuenta", // Asunto
        html: `<p>Hola ${nombre},</p>
               <p>Gracias por registrarte. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>
               <a href="${process.env.FRONTEND_URL}/acount/${token}">Confirmar Cuenta</a>
               <p>Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>`,
    });

    console.log("Correo enviado: %s", info.messageId);
};

export default sendVerificationEmail;