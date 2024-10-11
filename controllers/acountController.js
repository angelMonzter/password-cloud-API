import db from '../config/db.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

// Registrar una nueva cuenta
const registerAcount = (req, res) => {
    const { nombre_cuenta, usuario, password, datos_extra, usuario_id } = req.body;
    
    if (!password || !nombre_cuenta || !usuario) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;

        // Generar un ID aleatorio usando uuid
        const id = uuidv4();

        // Insertar la nueva cuenta en la base de datos
        const insertUserQuery = 'INSERT INTO datos_cuenta (datos_cuenta_id, nombre_cuenta, usuario, password, datos_extra, usuario_sid) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertUserQuery, [id, nombre_cuenta, usuario, hash, datos_extra, usuario_id], (err, result) => {
            if (err) throw err;

            res.status(201).json({ message: 'Cuenta registrada exitosamente' });
        });
    });
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

export {
    registerAcount,
    deleteAcount,
    editAcount,
    getAcount
};
  