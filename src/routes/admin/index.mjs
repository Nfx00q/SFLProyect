// routes/admin/index.mjs
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.render('admin/dashboard', { usuario: req.session.usuario });
});

// Podrías también definir aquí admin/products, admin/users, o importar esos módulos

export default router;
