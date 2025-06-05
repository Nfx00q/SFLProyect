exports.getCatalogPage = (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión a la base de datos');

    const sql = `
      SELECT c.id_categoria, c.nom_categoria, p.nom_producto, p.des_producto, p.precio_producto
      FROM categoria c
      LEFT JOIN producto p ON c.id_categoria = p.categoria_id_categoria
      ORDER BY c.id_categoria, p.id_producto
    `;

    conn.query(sql, (err, rows) => {
      if (err) return res.status(500).send('Error en la consulta SQL');

      const categorias = {};
      rows.forEach(row => {
        if (!categorias[row.id_categoria]) {
          categorias[row.id_categoria] = {
            nombre: row.nom_categoria,
            productos: []
          };
        }
        if (row.nom_producto) {
          categorias[row.id_categoria].productos.push({
            nombre: row.nom_producto,
            descripcion: row.des_producto,
            precio: row.precio_producto
          });
        }
      });

      res.render('catalog', { categorias });
    });
  });
};
