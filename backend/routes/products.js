const express = require('express');
const router = express.Router();
const conexion = require('../database/conexion.js'); 

router.get('/', (req, res) => {
  const sql = `
    SELECT id_producto, nombre_producto, precio_venta, costo_compra, 
           margen_ganancia, descripcion
    FROM productos
  `;

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.status(200).json(results);
  });
});

router.get('/:id_producto', (req, res) => {
  const { id_producto } = req.params;

  const sql = `
    SELECT id_producto, nombre_producto, precio_venta, costo_compra, 
           margen_ganancia, descripcion
    FROM productos
    WHERE id_producto = ?
  `;

  conexion.query(sql, [id_producto], (err, results) => {
    if (err) {
      console.error('Error al obtener producto:', err);
      return res.status(500).json({ error: 'Error al obtener producto' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(results[0]);
  });
});

router.post('/', (req, res) => {
  let { nombre_producto, precio_venta, costo_compra, descripcion } = req.body;

  if (!nombre_producto || precio_venta == null || costo_compra == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios del producto' });
  }

  const margen_ganancia = precio_venta - costo_compra;

  const sql = `
    INSERT INTO productos (nombre_producto, precio_venta, costo_compra, margen_ganancia, descripcion)
    VALUES (?, ?, ?, ?, ?)
  `;

  if (descripcion === undefined) descripcion = null;

  conexion.query(
    sql,
    [nombre_producto, precio_venta, costo_compra, margen_ganancia, descripcion],
    (err, result) => {
      if (err) {
        console.error('Error al crear producto:', err);
        return res.status(500).json({ error: 'Error al crear producto' });
      }

      res.status(201).json({
        id_producto: result.insertId,
        nombre_producto,
        precio_venta,
        costo_compra,
        margen_ganancia,
        descripcion
      });
    }
  );
});

router.put('/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  let { nombre_producto, precio_venta, costo_compra, descripcion } = req.body;

  if (!nombre_producto || precio_venta == null || costo_compra == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios del producto' });
  }

  const margen_ganancia = precio_venta - costo_compra;
  if (descripcion === undefined) descripcion = null;

  const sql = `
    UPDATE productos
    SET nombre_producto = ?, precio_venta = ?, costo_compra = ?, 
        margen_ganancia = ?, descripcion = ?
    WHERE id_producto = ?
  `;

  conexion.query(
    sql,
    [nombre_producto, precio_venta, costo_compra, margen_ganancia, descripcion, id_producto],
    (err, result) => {
      if (err) {
        console.error('Error al actualizar producto:', err);
        return res.status(500).json({ error: 'Error al actualizar producto' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.status(200).json({
        id_producto: Number(id_producto),
        nombre_producto,
        precio_venta,
        costo_compra,
        margen_ganancia,
        descripcion
      });
    }
  );
});

router.delete('/:id_producto', (req, res) => {
  const { id_producto } = req.params;

  const sql = 'DELETE FROM productos WHERE id_producto = ?';

  conexion.query(sql, [id_producto], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  });
});

module.exports = router;
