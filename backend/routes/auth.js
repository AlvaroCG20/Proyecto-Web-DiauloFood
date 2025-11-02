const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js'); // ✅ importar desde la nueva ruta

router.post('/login', (req, res) => {
  const { email, contrasena } = req.body;
  console.log('🟢 Datos recibidos en login:', req.body);

  if (!email || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan credenciales' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
  conexion.query(sql, [email, contrasena], (err, results) => {
    if (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('🟣 Resultado de la query:', results);

    if (results.length > 0) {
      res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: results[0] });
    } else {
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
  });
});

module.exports = router;
