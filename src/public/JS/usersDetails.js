document.addEventListener('DOMContentLoaded', () => {
    const telSpan = document.getElementById('telUsuario');
    if (!telSpan) return;

    const raw = telSpan.textContent.replace(/\D/g, ''); // Quita todo menos números

    if (raw.length === 9 && raw.startsWith('9')) {
      const formatted = raw.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2 $3');
      telSpan.textContent = formatted;
    }
  });