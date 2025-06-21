// routes/payment.mjs
import express from 'express';
import { checkout } from '../controllers/paymentController.mjs';

const router = express.Router();

router.post('/checkout', checkout);

router.get('/success', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  const userId = req.session.usuario.id;

  try {
    // 1. Obtener el carrito activo del usuario
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [userId]
    );
    if (!carrito) return res.send('❌ Carrito no encontrado');

    const carritoId = carrito.id_carrito;

    // 2. Obtener productos del carrito
    const [productos] = await pool.query(
      `SELECT pc.*, vp.precio_var AS precio, vp.id_var, vp.producto_id_producto, p.nom_producto
      FROM producto_carrito pc
      JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
      JOIN producto p ON vp.producto_id_producto = p.id_producto
      WHERE pc.carrito_id_carrito = ?`,
      [carritoId]
    );

    if (productos.length === 0) {
      return res.send('🛒 El carrito está vacío');
    }

    // 3. Calcular total del pedido
    let total = 0;
    for (const p of productos) {
      total += p.cantidad * p.precio;
    }

    // 4. Crear pedido
    const [pedidoResult] = await pool.query(
      'INSERT INTO pedido (usuario_id_us, est_pedido, total_pedido, hora_fecha) VALUES (?, ?, ?, NOW())',
      [userId, 'pagado', total.toFixed(2)]
    );
    const pedidoId = pedidoResult.insertId;

    // 5. Insertar productos en producto_pedido
    for (const prod of productos) {
      await pool.query(
        `INSERT INTO producto_pedido (pedido_id_pedido, producto_id_producto, cantidad, precio)
         VALUES (?, ?, ?, ?)`,
        [pedidoId, prod.producto_id_producto, prod.cantidad, prod.precio]
      );
    }

    // 6. Crear registro en envio
    await pool.query(
      `INSERT INTO envio (pedido_id_pedido, est_envio, num_segui, transp)
       VALUES (?, ?, ?, ?)`,
      [pedidoId, 'preparando', NULL, 'Por asignar']
    );

    // 7. Vaciar el carrito
    await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carritoId]);

    res.render('success', { pedidoId, total, productos }); // Puedes hacer tu vista .ejs para mostrar el detalle

  } catch (err) {
    console.error('❌ Error al generar el pedido:', err);
    res.status(500).send('Error interno al procesar el pedido');
  }
});

router.get('/failure', (req, res) => {
  res.send('❌ El pago ha fallado. Intenta nuevamente.');
});

router.get('/pending', (req, res) => {
  res.send('⏳ El pago está pendiente.');
});

export default router;
