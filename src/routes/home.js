const express = require('express');
const router = express.Router();

// Redirige la raíz '/' a '/home'
router.get('/', (req, res) => {
  res.redirect('/home');
});

module.exports = router;