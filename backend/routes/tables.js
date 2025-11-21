const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js');

// GET /tables
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      numero_mesa,
      capacidad,
      estado_mesa AS disponibilidad,
      ubicacion
    FROM mesas
  `;

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

  let { numero_mesa, capacidad, disponibilidad, ubicacion } = req.body;

  if (numero_mesa == null) {
    return res.status(400).json({ error: 'Falta el número de mesa' });
  }

  if (capacidad == null) capacidad = 4;
  if (!disponibilidad) disponibilidad = 'disponible'; // ENUM válido
  if (ubicacion === undefined) ubicacion = null;

  const sql = `
    INSERT INTO mesas (numero_mesa, capacidad, estado_mesa, ubicacion)
    VALUES (?, ?, ?, ?)
  `;

  conexion.query(
    sql,
    [numero_mesa, capacidad, disponibilidad, ubicacion],
    (err) => {
      if (err) {
        console.error('Error al crear mesa:', err);
        return res.status(500).json({ error: 'Error al crear mesa' });
      }

      res.status(201).json({
        numero_mesa,
        capacidad,
        disponibilidad,
        ubicacion
      });
    }
  );
});

// PUT /tables/:numero_mesa
router.put('/:numero_mesa', (req, res) => {
  const numero_mesa = req.params.numero_mesa;

  // 👇 El front envía "disponibilidad", así que lo tomamos
  let { capacidad, disponibilidad, ubicacion } = req.body;

  console.log('PUT /tables body =>', req.body);

  // Si el front no manda disponibilidad, no forzamos NULL:
  if (disponibilidad === undefined) disponibilidad = null;
  if (capacidad === undefined) capacidad = null;
  if (ubicacion === undefined) ubicacion = null;

  const sql = `
    UPDATE mesas
    SET 
      capacidad = ?,
      estado_mesa = ?,       -- 👈 Guardamos disponibilidad aquí
      ubicacion = ?
    WHERE numero_mesa = ?
  `;

  const params = [capacidad, disponibilidad, ubicacion, numero_mesa];

  console.log('SQL params =>', params);

  conexion.query(sql, params, (err, result) => {
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
      disponibilidad,
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
