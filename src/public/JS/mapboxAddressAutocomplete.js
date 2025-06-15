mapboxgl.accessToken = 'pk.eyJ1IjoibmZ4MDBxIiwiYSI6ImNtYm1vZW80OTFiOG8ybnB4eGl2enM4bGgifQ.XZhGGiTV9NZgrEpeXVx7pA';

const container = document.getElementById('geocoder-container');

if (container) {
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Ingresa tu dirección...',
    types: 'address',
    countries: 'cl',
    language: 'es',
    mapboxgl: mapboxgl
  });

  geocoder.addTo(container);

  geocoder.on('result', (e) => {
    const ctx = e.result.context || [];
    const place = e.result.place_name || '';

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value || '';
    };

    set('direccion', place);
    set('calle', e.result.text);
    set('ciudad', getContext(ctx, 'place'));
    set('region', getContext(ctx, 'region'));
    set('cod_postal', getContext(ctx, 'postcode'));
    set('pais', getContext(ctx, 'country'));
  });
}

function getContext(ctx, type) {
  const match = ctx.find(c => c.id.startsWith(type));
  return match ? match.text : '';
}
