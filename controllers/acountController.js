import db from '../config/db.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import {encriptar, obtenerPassword} from '../helpers/password.js'

// Registrar una nueva cuenta
const registerAcount = (req, res) => {
    const { nombre_cuenta, usuario, password, datos_extra, usuario_id } = req.body;
    
    if (!password || !nombre_cuenta || !usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Encriptar la contraseña
        const passwordEncriptada = encriptar(password);

        // Generar un ID aleatorio usando uuid
        const id = uuidv4();

        // Insertar la nueva cuenta en la base de datos
        const insertUserQuery = 'INSERT INTO datos_cuenta (datos_cuenta_id, nombre_cuenta, usuario, password, datos_extra, usuario_sid) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertUserQuery, [id, nombre_cuenta, usuario, passwordEncriptada, datos_extra, usuario_id], (err, result) => {
            if (err) throw err;

            res.status(201).json({ message: 'Cuenta registrada exitosamente' });
        });
    } catch (error) {
        console.error('Error encriptando la contraseña:', error);
        res.status(500).json({ message: 'Error al registrar la cuenta' });
    }
};

// Eliminar una cuenta por su ID
const deleteAcount = (req, res) => {
    const { id } = req.params;

    // Consulta para eliminar la cuenta según el ID
    const deleteQuery = 'DELETE FROM datos_cuenta WHERE datos_cuenta_id = ?';
    db.query(deleteQuery, [id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }

        res.status(200).json({ message: 'Cuenta eliminada exitosamente' });
    });
};

// Editar una cuenta por su ID
const editAcount = (req, res) => {
    const { id } = req.params;
    const { nombre_cuenta, usuario, password, datos_extra } = req.body;

    const dataActualizada = { ...req.body, id };

    // Verificar si el ID y los campos requeridos fueron proporcionados
    if (!id || !nombre_cuenta || !usuario || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Encriptar la nueva contraseña
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;

        // Consulta para actualizar la cuenta según el ID
        const updateQuery = 'UPDATE datos_cuenta SET nombre_cuenta = ?, usuario = ?, password = ?, datos_extra = ? WHERE datos_cuenta_id = ?';
        db.query(updateQuery, [nombre_cuenta, usuario, hash, datos_extra, id], (err, result) => {
            if (err) throw err;

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Cuenta no encontrada' });
            }

            res.status(200).json({ message: 'Cuenta actualizada exitosamente', dataActualizada});
        });
    });
};

// Editar una cuenta por su ID
const getAcount = (req, res) => {
    const { id } = req.params;
console.log(req.params);
    // Consulta para obtener las cuentas según el ID
    const getQuery = 'SELECT * FROM datos_cuenta WHERE usuario_sid = ?';
    db.query(getQuery, [id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No hay datos' });
        }

        res.json(result);
    });
};

// Buscar cuentas por texto ingresado
const searchAcount = (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ message: 'El texto de búsqueda es requerido' });
    }

    // Consulta para buscar en los campos nombre_cuenta, usuario y datos_extra
    const searchQuery = `
        SELECT * 
        FROM datos_cuenta 
        WHERE nombre_cuenta LIKE ? 
        OR usuario LIKE ? 
        OR datos_extra LIKE ?`;

    // Usar el texto de búsqueda con el operador LIKE
    const searchText = `%${texto}%`;

    db.query(searchQuery, [searchText, searchText, searchText], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la búsqueda', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron cuentas' });
        }

        return res.json(result);
    });
};

// Editar una cuenta por su ID
const copyPassword = async (req, res) => {
    const { id } = req.params;

    try {
        const textoDesencriptado = await obtenerPassword(id); // Espera a que se obtenga la contraseña

        if (!textoDesencriptado) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }

        return res.status(200).json({ message: 'Desencriptado exitoso', textoDesencriptado });
    } catch (error) {
        console.error('Error al obtener la contraseña:', error);
        return res.status(500).json({ message: 'Error al desencriptar la contraseña' });
    }
};

export {
    registerAcount,
    deleteAcount,
    editAcount,
    getAcount,
    copyPassword,
    searchAcount
};
  