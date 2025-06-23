// ✅ Abre el modal y carga las tallas disponibles
async function abrirModalCarrito(productoId) {
  const idInput = document.getElementById("id_producto");
  const precioElement = document.getElementById("modalProductoPrecio");
  const nombreElement = document.getElementById("modalProductoNombre");
  const imagenElement = document.getElementById("modalProductoImagen");

  // Asignar ID del producto
  idInput.value = productoId;
  precioElement.textContent = "$--";

  // Limpiar selección de tallas previa
  document
    .querySelectorAll('input[name="talla"]')
    .forEach((input) => (input.checked = false));

  try {
    // Obtener info del producto (nombre, imagen, precio base)
    const nombre = document.querySelector(`button[data-id="${productoId}"]`)
      .dataset.nombre;
    const precio = document.querySelector(`button[data-id="${productoId}"]`)
      .dataset.precio;
    const imagen = document.querySelector(`button[data-id="${productoId}"]`)
      .dataset.imagen;

    nombreElement.textContent = nombre;
    imagenElement.src = imagen;
    precioElement.textContent = `$${Number(precio).toLocaleString("es-CL")}`;

    // Cargar tallas disponibles
    const res = await fetch(`/shop-cart/tallas/${productoId}`);
    const tallas = await res.json();

    if (Array.isArray(tallas)) {
      // Desactivar todas
      document.querySelectorAll('input[name="talla"]').forEach((input) => {
        input.disabled = true;
        input.parentElement.classList.add("disabled");
      });

      // Habilitar solo las disponibles
      tallas.forEach((talla) => {
        const input = document.getElementById(`talla_${talla.nom_talla}`);
        if (input) {
          input.disabled = false;
          input.parentElement.classList.remove("disabled");
        }
      });
    }

    // Escuchar cambio de talla y actualizar precio dinámicamente
    document.querySelectorAll('input[name="talla"]').forEach((input) => {
      // ⚠️ Primero elimina cualquier listener anterior (remover no es directo, así que simplemente usamos una bandera)
      input.onchange = async (e) => {
        const tallaSeleccionada = e.target.value;
        try {
          const res = await fetch(
            `/shop-cart/precio/${productoId}/${tallaSeleccionada}`
          );
          const data = await res.json();
          if (data.precio) {
            precioElement.textContent = `$${data.precio.toLocaleString(
              "es-CL"
            )}`;
          } else {
            precioElement.textContent = "$--";
          }
        } catch (err) {
          console.error("❌ Error al obtener precio por talla:", err);
          precioElement.textContent = "$--";
        }
      };
    });
  } catch (err) {
    console.error("❌ Error al cargar datos del producto:", err);
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
        console.warn("⚠️ Respuesta inesperada (HTML):", html);
        throw new Error("Respuesta del servidor no válida");
      }

      const result = await response.json();

      if (result.success) {
        // Cierra modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("modalCarrito")
        );
        modal.hide();

        // Muestra toast de éxito
        const toastEl = document.getElementById("toastExito");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        // Actualiza el contador
        actualizarContadorCarrito();
      } else {
        console.error("❌ Error al agregar:", result.message);
        alert("Error al agregar al carrito: " + (result.message || ""));
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      alert("Ocurrió un error al agregar al carrito");
    }
  });

// ✅ Contador del carrito
async function actualizarContadorCarrito() {
  try {
    const res = await fetch("/shop-cart/count");
    const data = await res.json();
    document.getElementById("cart-count").textContent = data.count || 0;
  } catch (err) {
    console.error("⚠️ No se pudo obtener el contador del carrito:", err);
  }
}

actualizarContadorCarrito();
