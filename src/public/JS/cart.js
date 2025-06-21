// ✅ Abre el modal y carga las tallas disponibles
async function abrirModalCarrito(productoId) {
  const idInput = document.getElementById("id_producto");
  const selectTalla = document.getElementById("talla");
  const precioElement = document.getElementById("modalProductoPrecio");

  // Asignar ID del producto al campo oculto
  idInput.value = productoId;

  // Reiniciar select y precio
  selectTalla.innerHTML = '<option disabled selected>Seleccione una talla</option>';
  precioElement.textContent = '$--';

  try {
    const res = await fetch(`/shop-cart/tallas/${productoId}`);
    const tallas = await res.json();

    if (Array.isArray(tallas)) {
      tallas.forEach(talla => {
        const option = document.createElement("option");
        option.value = talla.nom_talla;
        option.textContent = talla.nom_talla;
        selectTalla.appendChild(option);
      });
    } else {
      console.warn('⚠️ Formato inválido de tallas:', tallas);
    }

    // Escuchar cambio de talla después de cargar
    selectTalla.addEventListener("change", async function () {
      const tallaSeleccionada = this.value;

      try {
        const res = await fetch(`/shop-cart/precio/${productoId}/${tallaSeleccionada}`);
        const data = await res.json();

        if (data.precio) {
          precioElement.textContent = `$${data.precio.toLocaleString('es-CL')}`;
        } else {
          precioElement.textContent = '$--';
        }
      } catch (err) {
        console.error('❌ Error al actualizar precio:', err);
        precioElement.textContent = '$--';
      }
    });
  } catch (err) {
    console.error('❌ Error al cargar tallas:', err);
  }
}

// ✅ Manejo del formulario de agregar al carrito
document
  .getElementById("formAgregarCarrito")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/shop-cart/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const html = await response.text();
        console.warn('⚠️ Respuesta inesperada (HTML):', html);
        throw new Error('Respuesta del servidor no válida');
      }

      const result = await response.json();

      if (result.success) {
        // Cierra modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalCarrito"));
        modal.hide();

        // Muestra toast de éxito
        const toastEl = document.getElementById("toastExito");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        // Actualiza el contador
        actualizarContadorCarrito();
      } else {
        console.error("❌ Error al agregar:", result.message);
        alert("Error al agregar al carrito: " + (result.message || ''));
      }

    } catch (err) {
      console.error("❌ Error inesperado:", err);
      alert("Ocurrió un error al agregar al carrito");
    }
  });

// ✅ Contador del carrito
async function actualizarContadorCarrito() {
  try {
    const res = await fetch('/shop-cart/count');
    const data = await res.json();
    document.getElementById('cart-count').textContent = data.count || 0;
  } catch (err) {
    console.error('⚠️ No se pudo obtener el contador del carrito:', err);
  }
}

actualizarContadorCarrito();
