const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'diaulofood'
});

conexion.connect(err => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a DiauloFood');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

module.exports = conexion;
