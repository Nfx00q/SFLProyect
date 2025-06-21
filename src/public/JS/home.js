async function actualizarContadorCarrito() {
    try {
      const res = await fetch('/shop-cart/count');
      const data = await res.json();
      document.getElementById('cart-count').textContent = data.count || 0;
    } catch (err) {
      console.error('No se pudo obtener el contador del carrito:', err);
    }
  }

  actualizarContadorCarrito();

document.addEventListener('DOMContentLoaded', () => {
  const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');

  botonesAgregar.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const precio = btn.dataset.precio;
      const imagen = btn.dataset.imagen;

      // Rellenar campos del modal
      document.getElementById('id_producto').value = id;
      document.getElementById('modalProductoNombre').textContent = nombre;
      document.getElementById('modalProductoPrecio').textContent = `$${precio}`;
      document.getElementById('modalProductoImagen').src = imagen;
    });
  });
});
