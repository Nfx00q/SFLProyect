async function abrirModalCarrito(productoId) {
  const idInput = document.getElementById("id_producto");
  const selectTalla = document.getElementById("talla");

  // Asigna el ID del producto al campo oculto
  idInput.value = productoId;

  // Limpia las opciones anteriores
  selectTalla.innerHTML = '<option disabled selected>Seleccione una talla</option>';

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
      console.warn('Formato de tallas no válido:', tallas);
    }
  } catch (err) {
    console.error('Error al cargar tallas:', err);
  }
}

document
  .getElementById("formAgregarCarrito")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      console.log("Data enviada:", data);
      const response = await fetch("/shop-cart/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert("Producto añadido al carrito");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("modalCarrito")
        );
        modal.hide();
      } else {
        alert(result.message || "Error al agregar");
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert("Ocurrió un error");
    }
  });
