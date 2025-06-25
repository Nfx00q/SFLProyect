import * as catalogModel from '../models/catalogModel.mjs';

export async function getCatalogPage(req, res) {
  try {
    const rows = await catalogModel.getCatalogData();

    const categorias = {};

    rows.forEach(row => {
      if (!categorias[row.id_categoria]) {
        categorias[row.id_categoria] = {
          nombre: row.nom_categoria,
          productos: []
        };
      }

      if (row.id_producto) {
        categorias[row.id_categoria].productos.push({
          id_producto: row.id_producto,
          nombre: row.nombre,
          descripcion: row.descripcion,
          precio: Number(row.precio),
          url_img: row.url_img || 'default.jpg'
        });
      }
    });

    res.render('catalog', { categorias });

  } catch (err) {
    console.error('❌ Error al cargar catálogo:', err);
    res.status(500).send('Error al cargar el catálogo');
  }
}
