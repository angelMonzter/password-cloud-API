import express from "express";
import { 
    registerAcount,
    deleteAcount,
    editAcount,
    getAcount,
    copyPassword,
    searchAcount,
    totalAcount
} from '../controllers/acountController.js'; 
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para registrar un nueva cuenta 
router.post('/acount', checkAuth, registerAcount);
// Ruta para eliminar una cuenta 
router.delete('/acount/:id', checkAuth, deleteAcount);
// Ruta para editar una cuenta 
router.put('/acount/:id', checkAuth, editAcount);
// Ruta para obtener cuentas 
router.get('/acount/:id', checkAuth, getAcount);
// Ruta para obtener total de cuentas 
router.get('/acount-total/:id', checkAuth, totalAcount);
// Ruta para obtener password de la cuenta 
router.get('/show-password/:id', checkAuth, copyPassword);
// Ruta para obtener cuenta por busqueda
router.post('/search-acount', checkAuth, searchAcount);

// Exporta el router por defecto
export default router;
