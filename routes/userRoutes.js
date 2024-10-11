import express from "express";
import { 
    registerUser,
    getUsers,
    confirmUser,
    forgotPassword,
    recoberyPassword,
    tokenPasswordValidation,
    loginUser,
    perfilUser
} from '../controllers/userController.js'; 
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);
// Ruta de confirmación de cuenta
router.get('/confirmar/:token', confirmUser);
// Ruta para enviar link restablecer contraseña
router.post('/password', forgotPassword);
// Ruta para verificar token de contraseña
router.get('/password/:token', tokenPasswordValidation);
// Ruta para actualizar contraseña
router.put('/update-password', recoberyPassword);
// Ruta para obtener todos los usuarios
router.get('/users', getUsers);
// Ruta para login de usuarios
router.post('/login', loginUser);

//Rutas protegidas de usuario

//Ruta del perfil de usuario
router.get('/perfil', checkAuth, perfilUser);


// Exporta el router por defecto
export default router;
