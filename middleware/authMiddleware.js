import jwt from "jsonwebtoken";
import db from "../config/db.js";  // Asegúrate de importar la configuración de tu conexión MySQL

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extraer el token
      token = req.headers.authorization.split(" ")[1];

      // Verificar y decodificar el token usando JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Consulta a la base de datos para obtener el usuario por ID
      const query = "SELECT * FROM usuario WHERE usuario_id = ?";
      db.query(query, [decoded.id], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }

        if (result.length === 0) {
          return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Excluir campos sensibles como password, token, etc.
        const { password, token, confirmado, ...usuario } = result[0];
        req.usuario = usuario;  // Guardamos la información del usuario en la request

        // Continuar con la siguiente función
        return next();
      });
    } catch (error) {
      const e = new Error("Token no valido");
      return res.status(400).json({ success: false, message: 'mensaje ' + e.message });
    }
  }

};

export default checkAuth;
