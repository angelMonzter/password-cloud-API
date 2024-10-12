import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import acountRoutes from "./routes/acountRoutes.js";
import dotenv from 'dotenv';
import cors from "cors";

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());

const dominiosPermitidos = [process.env.BACKEND_URL, process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen, como las hechas desde herramientas como Postman o localhost
    if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(cors(corsOptions));

// Rutas de usuario
app.use('/api', userRoutes);
app.use('/api', acountRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
