const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js');  // ajusta a tu archivo de conexión

// GET /tables
router.get('/', (req, res) => {
  const sql = 'SELECT numero_mesa, capacidad, estado_mesa, ubicacion FROM mesas';

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener mesas:', err);
      return res.status(500).json({ error: 'Error al obtener mesas' });
    }
    res.status(200).json(results);
  });
});

// POST /tables
router.post('/', (req, res) => {
  console.log('Body recibido en POST /tables:', req.body);

  let { numero_mesa, capacidad, estado_mesa, ubicacion } = req.body;

  // ✅ solo exigimos numero_mesa
  if (numero_mesa == null) {
    return res.status(400).json({ error: 'Falta el número de mesa' });
  }

  // ✅ defaults si no vienen
  if (capacidad == null) capacidad = 4;
  if (!estado_mesa) estado_mesa = 'disponible';   // coincide con el ENUM
  if (ubicacion === undefined) ubicacion = null;        // puede ser null

  const sql = `
    INSERT INTO mesas (numero_mesa, capacidad, estado_mesa, ubicacion)
    VALUES (?, ?, ?, ?)
  `;

  conexion.query(sql, [numero_mesa, capacidad, estado_mesa, ubicacion], (err) => {
    if (err) {
      console.error('Error al crear mesa:', err);
      return res.status(500).json({ error: 'Error al crear mesa' });
    }

    res.status(201).json({
      numero_mesa,
      capacidad,
      estado_mesa,
      ubicacion
    });
  });
});


// PUT /tables/:numero_mesa
router.put('/:numero_mesa', (req, res) => {
  const { numero_mesa } = req.params;
  const { capacidad, estado_mesa, ubicacion } = req.body;

  const sql = `
    UPDATE mesas
    SET capacidad = ?, estado_mesa = ?, ubicacion = ?
    WHERE numero_mesa = ?
  `;

  conexion.query(sql, [capacidad, estado_mesa, ubicacion, numero_mesa], (err, result) => {
    if (err) {
      console.error('Error al actualizar mesa:', err);
      return res.status(500).json({ error: 'Error al actualizar mesa' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    res.status(200).json({
      numero_mesa,
      capacidad,
      estado_mesa,
      ubicacion
    });
  });
});

// DELETE /tables/:numero_mesa
router.delete('/:numero_mesa', (req, res) => {
  const { numero_mesa } = req.params;

  const sql = 'DELETE FROM mesas WHERE numero_mesa = ?';

  conexion.query(sql, [numero_mesa], (err, result) => {
    if (err) {
      console.error('Error al eliminar mesa:', err);
      return res.status(500).json({ error: 'Error al eliminar mesa' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    res.status(200).json({ mensaje: 'Mesa eliminada correctamente' });
  });
});

module.exports = router;
