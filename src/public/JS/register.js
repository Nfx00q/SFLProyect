const mapboxToken = 'pk.eyJ1IjoibmZ4MDBxIiwiYSI6ImNtYm1vZW80OTFiOG8ybnB4eGl2enM4bGgifQ.XZhGGiTV9NZgrEpeXVx7pA';

    const direccionInput = document.getElementById('direccion');
    const suggestions = document.getElementById('suggestions');

    let controller = null;
    direccionInput.addEventListener('input', () => {
      const query = direccionInput.value.trim();
      suggestions.innerHTML = '';
      if (query.length < 3) return;

      if (controller) controller.abort();
      controller = new AbortController();

      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&types=address,place,locality,region,country`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.features) return;
          suggestions.innerHTML = '';
          data.features.forEach((feature) => {
            const div = document.createElement('div');
            div.textContent = feature.place_name;
            div.addEventListener('click', () => {
              direccionInput.value = feature.place_name;
              suggestions.innerHTML = '';
              fillAddressFields(feature);
            });
            suggestions.appendChild(div);
          });
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Error al consultar Mapbox:', err);
          }
        });
    });

    function fillAddressFields(feature) {

      document.getElementById('calle').value = '';
      document.getElementById('ciudad').value = '';
      document.getElementById('region').value = '';
      document.getElementById('cod_postal').value = '';
      document.getElementById('pais').value = '';

      const context = feature.context || [];
      const street = feature.address ? feature.address + ' ' + feature.text : feature.text;

      document.getElementById('calle').value = street || '';

      function getContext(type) {
        const c = context.find((c) => c.id.startsWith(type));
        return c ? c.text : '';
      }

      document.getElementById('ciudad').value = getContext('place') || getContext('locality') || '';
      document.getElementById('region').value = getContext('region') || '';
      document.getElementById('cod_postal').value = getContext('postcode') || '';
      document.getElementById('pais').value = getContext('country') || '';
    }

    document.addEventListener('click', (e) => {
      if (
        e.target !== direccionInput &&
        !suggestions.contains(e.target)
      ) {
        suggestions.innerHTML = '';
      }
    });

const telInput = document.getElementById('tel_us');
  const telCleanInput = document.getElementById('tel_us_clean');
  const telError = document.getElementById('tel-error');

  telInput.addEventListener('input', () => {
    let value = telInput.value.replace(/\D/g, '').slice(0,9);

    if (value.length > 1) {
      value = value[0] + ' ' + value.slice(1,5) + ' ' + value.slice(5);
    }

    telInput.value = value.trim();

    if (value.replace(/\s/g, '').length === 9) {
      telError.style.display = 'none';
    } else {
      telError.style.display = 'block';
    }

    // Actualizar input oculto con número limpio
    telCleanInput.value = value.replace(/\s/g, '');
  });

  // Opcional: validar en submit que esté correcto
  document.getElementById('form').addEventListener('submit', e => {
    if (telCleanInput.value.length !== 9) {
      e.preventDefault();
      telError.style.display = 'block';
      telInput.focus();
    }
  });

document.getElementById('form').addEventListener('submit', function (e) {
  const calle = document.getElementById('calle').value.trim();
  const ciudad = document.getElementById('ciudad').value.trim();
  const region = document.getElementById('region').value.trim();
  const cod_postal = document.getElementById('cod_postal').value.trim();
  const pais = document.getElementById('pais').value.trim();

  const errorBox = document.getElementById('direccion-error');

  if (!calle || !ciudad || !region || !cod_postal || !pais) {
    e.preventDefault();
    errorBox.classList.remove('d-none');
    errorBox.scrollIntoView({ behavior: 'smooth' });
  } else {
    errorBox.classList.add('d-none');
  }
});

