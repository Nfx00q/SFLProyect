function actualizarContadorCarrito() {
  fetch("/shop-cart/count")
    .then((res) => {
      if (!res.ok)
        return res.json().then((err) => {
          throw err;
        });
      return res.json();
    })
    .then((data) => {
      const contador = document.getElementById("contador-carrito");
      if (contador) contador.textContent = data.count;
    })
    .catch((err) => {
      console.warn("No se pudo obtener el contador del carrito:", err);

      if (err?.redirect) {
        mostrarToast("⚠️ Debes iniciar sesión para continuar.", "warning");
        setTimeout(() => {
          window.location.href = err.redirect;
        }, 3000);
      }
    });
}

actualizarContadorCarrito();

document.addEventListener("DOMContentLoaded", () => {
  const botonesAgregar = document.querySelectorAll(".btn-agregar-carrito");

  botonesAgregar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const precio = btn.dataset.precio;
      const imagen = btn.dataset.imagen;

      // Rellenar campos del modal
      document.getElementById("id_producto").value = id;
      document.getElementById("modalProductoNombre").textContent = nombre;
      document.getElementById("modalProductoPrecio").textContent = `$${precio}`;
      document.getElementById("modalProductoImagen").src = imagen;
    });
  });
});