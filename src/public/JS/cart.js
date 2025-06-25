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

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          if (error.redirect) {
            mostrarRedirectToast(error.message, error.redirect);
            return;
          }
          throw new Error(error.message || "Error inesperado");
        } else {
          throw new Error("Respuesta inesperada del servidor");
        }
      }

      const result = await response.json();
      if (result.success) {
        bootstrap.Modal.getInstance(
          document.getElementById("modalCarrito")
        )?.hide();
        bootstrap.Toast.getOrCreateInstance(
          document.getElementById("toastExito")
        )?.show();
        actualizarContadorCarrito();
      } else {
        console.warn("⚠️ Agregado fallido:", result.message);
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
    }
  });

// ✅ Contador del carrito
function actualizarContadorCarrito() {
  fetch("/shop-cart/count")
    .then((res) => res.json())
    .then((data) => {
      const contador = document.getElementById("cart-count");
      if (contador) {
        contador.textContent = data.count;
      } else {
        console.warn("⚠️ No se encontró el elemento #contador-carrito");
      }
    })
    .catch((err) => {
      console.warn("⚠️ No se pudo obtener el contador del carrito:", err);
    });
}

function mostrarRedirectToast(mensaje, url) {
  const toastEl = document.getElementById("redirectToast");
  if (!toastEl) return;

  let seconds = 3;
  toastEl.querySelector(".toast-body").innerHTML = `${mensaje} Redirigiendo en <span id="countdown">${seconds}</span> segundos…`;

  const countdownSpan = toastEl.querySelector("#countdown");
  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();

  const interval = setInterval(() => {
    seconds--;
    countdownSpan.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      window.location.href = url;
    }
  }, 1000);
}


actualizarContadorCarrito();
