import mysql from 'mysql';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER, // Tu usuario MySQL
    password: process.env.PASSWORD, // Tu contraseña MySQL
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

export default db;
