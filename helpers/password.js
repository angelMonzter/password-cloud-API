import crypto from 'crypto';
import db from '../config/db.js';

// Función para encriptar la contraseña
const claveSecreta = crypto.createHash('sha256').update('my_secret_key_123').digest('base64').substr(0, 32);

function encriptar(texto) {
    const iv = crypto.randomBytes(16); // Vector de inicialización
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(claveSecreta), iv);
    let encriptado = cipher.update(texto, 'utf8');
    encriptado = Buffer.concat([encriptado, cipher.final()]);
    return iv.toString('hex') + ':' + encriptado.toString('hex'); // IV + texto encriptado
}

// Función para desencriptar la contraseña
function desencriptar(textoEncriptado) {
    // El texto encriptado está en formato iv:cipherText (separado por ":")
    const partes = textoEncriptado.split(':');
    const iv = Buffer.from(partes[0], 'hex'); // Extraer IV
    const textoEncriptadoBuffer = Buffer.from(partes[1], 'hex'); // Extraer texto encriptado

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(claveSecreta), iv);
    let desencriptado = decipher.update(textoEncriptadoBuffer);
    desencriptado = Buffer.concat([desencriptado, decipher.final()]);

    return desencriptado.toString(); // Convertir el Buffer a string
}

function obtenerPassword(id){
    return new Promise((resolve, reject) => {
        // Consulta para obtener la cuenta según el ID
        const showQuery = 'SELECT * FROM datos_cuenta WHERE datos_cuenta_id = ?';
        db.query(showQuery, [id], (err, result) => {
            if (err) {
                return reject(err); // Rechaza la promesa si hay un error
            }

            if (result.length === 0) {
                return resolve(null); // No encontró la cuenta, retorna null
            }

            const textoDesencriptado = desencriptar(result[0].password);
            resolve(textoDesencriptado); // Resuelve la promesa con el valor desencriptado
        });
    });
}

export {
    encriptar,
    desencriptar,
    obtenerPassword
}