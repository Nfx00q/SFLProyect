// src/controllers/shopCartController.mjs
import * as cartModel from '../models/cartModel.mjs';

const shopCartController = {};

shopCartController.ensureCart = async (userId) => {
  const carrito = await cartModel.getActiveCartByUserId(userId);
  if (carrito) return carrito.id_carrito;
  const id = await cartModel.createCart(userId);
  return id;
};

shopCartController.agregarAlCarrito = async (req, res) => {
  const { id_producto, cantidad, talla } = req.body;
  const userId = req.session.usuario.id;

  try {
    const variante = await cartModel.getVariantByProductAndSize(id_producto, talla);
    if (!variante) return res.status(400).json({ success: false, message: 'Talla no disponible' });

    const carritoId = await shopCartController.ensureCart(userId);
    const existente = await cartModel.getProductInCart(carritoId, variante.id_var);

    if (existente) {
      await cartModel.updateProductInCart(cantidad, variante.precio_var, existente.id);
    } else {
      await cartModel.addProductToCart(carritoId, variante.id_var, cantidad, variante.precio_var);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

shopCartController.getCartCount = async (req, res) => {
  const userId = req.session.usuario.id;

  try {
    const count = await cartModel.countProductsInCart(userId);
    res.json({ count });
  } catch (err) {
    console.error('❌ Error al obtener el conteo:', err);
    res.json({ count: 0 });
  }
};

shopCartController.getTallasPorProducto = async (req, res) => {
  const { id_producto } = req.params;
  try {
    const tallas = await cartModel.getSizesByProduct(id_producto);
    res.json(tallas);
  } catch (err) {
    console.error('❌ Error obteniendo tallas:', err);
    res.status(500).json({ error: 'Error al obtener tallas' });
  }
};

shopCartController.mostrarCarrito = async (req, res) => {
  const userId = req.session.usuario.id;
  try {
    const carrito = await cartModel.getActiveCartByUserId(userId);
    if (!carrito) return res.render('cart', { carrito: [] });
    const productos = await cartModel.getCartProducts(carrito.id_carrito);
    res.render('cart', { carrito: productos });
  } catch (error) {
    console.error('❌ Error al mostrar el carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
};

shopCartController.removeFromCart = async (req, res) => {
  const { id_producto_carrito } = req.params;
  try {
    await cartModel.removeProductFromCart(id_producto_carrito);
    res.redirect('/shop-cart');
  } catch (error) {
    console.error('❌ Error al eliminar producto del carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
};

shopCartController.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await cartModel.clearCart(id_usuario);
    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('❌ Error al vaciar carrito:', err);
    res.status(500).send('Error al vaciar carrito');
  }
};

shopCartController.eliminarCarrito = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    await cartModel.deleteCart(id_usuario);
    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('❌ Error al eliminar carrito:', err);
    res.status(500).send('Error al eliminar carrito');
  }
};

shopCartController.getPrecioPorTalla = async (req, res) => {
  const { id_producto, nom_talla } = req.params;
  try {
    const precio = await cartModel.getPriceBySize(id_producto, nom_talla);
    if (!precio) return res.status(404).json({ error: 'Precio no encontrado' });
    res.json({ precio });
  } catch (err) {
    console.error('Error al obtener precio por talla:', err);
    res.status(500).json({ error: 'Error al obtener precio' });
  }
};

shopCartController.decreaseCantidad = async (req, res) => {
  const { id } = req.params;
  try {
    await cartModel.decreaseQuantity(id);
    res.redirect('/shop-cart');
  } catch (error) {
    console.error('❌ Error al disminuir cantidad:', error);
    res.status(500).send('Error al actualizar la cantidad del producto');
  }
};

shopCartController.increaseCantidad = async (req, res) => {
  const { id } = req.params;
  try {
    await cartModel.increaseQuantity(id);
    res.redirect('/shop-cart');
  } catch (error) {
    console.error('❌ Error al aumentar cantidad:', error);
    res.status(500).send('Error al actualizar la cantidad del producto');
  }
};

export default shopCartController;
