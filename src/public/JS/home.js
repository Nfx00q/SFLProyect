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