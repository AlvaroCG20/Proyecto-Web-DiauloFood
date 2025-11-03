const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js'); 


router.post('/agregar-garzon', (req, res) => {
  const { nombre_usuario, email, contrasena } = req.body;


  if (!nombre_usuario || !email || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  const id_rol = 1; 

  const sql = `
    INSERT INTO usuarios (nombre_usuario, email, contrasena, id_rol)
    VALUES (?, ?, ?, ?)
  `;

  conexion.query(sql, [nombre_usuario, email, contrasena, id_rol], (err, result) => {
    if (err) {
      console.error('❌ Error al agregar garzón:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Garzón agregado correctamente con ID:', result.insertId);
    res.status(201).json({
      mensaje: 'Garzón agregado correctamente',
      id_insertado: result.insertId
    });
  });
});


router.get('/garzones', (req, res) => {
  console.log('🟢 Entró a GET /garzones/garzones');

  const sql = 'SELECT id, nombre_usuario, email, id_rol FROM usuarios WHERE id_rol = 1';

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener garzones:', err);
      return res.status(500).json({ mensaje: 'Error al obtener garzones', error: err.message });
    }

    console.log('✅ Garzones obtenidos:', results);
    res.status(200).json(results);
  });
});



router.delete('/garzon/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM usuarios WHERE id = ? AND id_rol = 1';
  conexion.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar garzón:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Garzón no encontrado' });
    }

    console.log('🗑️ Garzón eliminado con ID:', id);
    res.status(200).json({ mensaje: 'Garzón eliminado correctamente' });
  });
});

module.exports = router;
