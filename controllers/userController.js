import db from '../config/db.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import sendVerificationEmail from '../helpers/emailAcount.js';
import sendLinkPassword from '../helpers/emailPassword.js';
import generarJWT from '../helpers/generarJWT.js';

// Registrar un nuevo usuario
const registerUser = async (req, res) => { // Declarar la función como async
    const { correo, password, nombre, usuario } = req.body;
    if (!correo || !password || !nombre || !usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el correo o el usuario ya existen
    const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ? OR usuario = ?';
    db.query(checkUserQuery, [correo, usuario], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const existingUser = result[0];
            if (existingUser.correo === correo) {
                console.log(correo);
                return res.status(409).json({ message: 'El correo ya está registrado' });
            }
            if (existingUser.usuario === usuario) {
                console.log(usuario);
                return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
            }
        }

        // Encriptar la contraseña
        bcrypt.hash(password, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            const id = uuidv4();
            const token = uuidv4().slice(0, 10);

            const insertUserQuery = 'INSERT INTO usuario (usuario_id, nombre, usuario, correo, password, token) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(insertUserQuery, [id, nombre, usuario, correo, hash, token], async (err, result) => {
                if (err) throw err;

                // Enviar correo de verificación
                await sendVerificationEmail(correo, nombre, token); // Aquí ahora el await es válido

                res.status(201).json({ message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.' });
            });
        });
    });
};

// Obtener todos los usuarios
const getUsers = (req, res) => {
    const query = 'SELECT usuario_id, correo FROM usuario';
    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// Ruta para confirmar el usuario
const confirmUser = (req, res) => {
    const { token } = req.params;
    console.log(req.params);
    
    // Verificar si el token existe en la base de datos
    const query = 'SELECT * FROM usuario WHERE token = ?';
    db.query(query, [token], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        // Si el token no es válido
        if (result.length === 0) {
            return res.status(400).json({ success: false, message: 'Token no válido' });
        }

        // Actualizar la base de datos para confirmar al usuario y eliminar el token
        const updateQuery = 'UPDATE usuario SET token = "", confirmado = 1 WHERE token = ?';
        db.query(updateQuery, [token], (err, updateResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al confirmar la cuenta' });
            }

            // Confirmación exitosa
            return res.status(200).json({ success: true, message: 'Cuenta confirmada exitosamente' });
        });
    });
};

const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    // Verificar si el correo ya existen
    const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ?';
    db.query(checkUserQuery, [correo], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const existingUser = result[0];
            const { correo, nombre } = existingUser;
            if (correo) {
                const token = uuidv4().slice(0, 10);

                // Actualizar la base de datos para confirmar al correo y crear token 
                const updateQuery = 'UPDATE usuario SET token = ? WHERE correo = ?';
                db.query(updateQuery, [token, correo], (err, updateResult) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'Error' });
                    }

                    // Confirmación exitosa
                    return res.status(200).json({ success: true, message: 'Token creado' });
                });

                // Enviar correo de restablecer contraseña
                await sendLinkPassword(correo, nombre, token); // Aquí ahora el await es válido
            }else{
                return res.status(409).json({ message: 'El correo no está registrado' });
            }
        }
        
    });
  
};

const tokenPasswordValidation = async (req, res) => {
    // Leer los datos
    const { token } = req.params;
    
        const query = 'SELECT * FROM usuario WHERE token = ?';
        db.query(query, [token], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            // Si el token no es válido
            if (result.length === 0) {
                return res.status(400).json({ success: false, message: 'Token no válido' });
            }

            return res.status(200).json({ success: true, message: 'Token válido' });

        });
};

const recoberyPassword = async (req, res) => {
    // Leer los datos
    const { password, passsword_confirmar, token } = req.body;
    console.log(req.body);
    if (password === passsword_confirmar){
        // Encriptar la contraseña
        bcrypt.hash(passsword_confirmar, 10, async (err, hash) => { // Agregar async aquí también si usas await dentro
            if (err) throw err;

            // Actualizar la base de datos para confirmar password y eliminar el token
            const updateQuery = 'UPDATE usuario SET password = ?, token = "" WHERE token = ?';
            db.query(updateQuery, [hash, token], (err, updateResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error al actualizar la cuenta' });
                }

                // Confirmación exitosa
                return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
            });
        });
    }else{
        return res.status(400).json({ success: false, message: 'Las contraseñas no coniciden' });
    }
};

const loginUser = async (req, res) => {
    const { correo, password } = req.body;
  
    // Comprobar si el usuario existe
    const query = 'SELECT * FROM usuario WHERE correo = ?';
    db.query(query, [correo], async (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        if (result.length === 0) {
            return res.status(400).json({ success: false, message: 'Correo no registrado' });
        }

        // Comprobar si el usuario esta confirmado
        if (!result[0].confirmado ) {
            return res.status(400).json({ success: false, message: 'Tu Cuenta no ha sido confirmada' });
        }

        // Verificar la contraseña ingresada con la almacenada en la base de datos
        const validPassword = await bcrypt.compare(password, result[0].password);

        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
        }
        
        //return res.status(200).json({ success: true, message: 'cuenta ' + result[0].confirmado + ' confirmada' });
        return res.status(200).json({ token: generarJWT(result[0].usuario_id)});
    });
};

const perfilUser = async (req, res) => {
    const { usuario } = req;

    return res.status(200).json({ perfil: usuario });
};

export {
    registerUser,
    getUsers,
    confirmUser,
    forgotPassword,
    recoberyPassword,
    tokenPasswordValidation,
    loginUser,
    perfilUser
};
  