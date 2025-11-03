const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js'); 

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'XakQLo013_3131xwl1kro'; 


router.post('/login', (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan credenciales' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
  conexion.query(sql, [email, contrasena], (err, results) => {
    if (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }


    const usuario = results[0];
    const token = jwt.sign(
      { id: usuario.rut, email: usuario.email, rol: usuario.id_rol },
      SECRET_KEY,
      { expiresIn: '2h' } 
    );

    console.log('🟢 Usuario autenticado. Enviando token...');
    console.log('Token generado:', token);

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario,
      token, 
    });
  });
});
module.exports = router;
