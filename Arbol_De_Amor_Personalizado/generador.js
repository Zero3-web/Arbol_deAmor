document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('gen-form');
  const resultado = document.getElementById('resultado');
  const linkFinal = document.getElementById('link-final');
  const copiarBtn = document.getElementById('copiar-btn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Obtener valores
    const mensaje = encodeURIComponent(document.getElementById('mensaje').value.trim().replace(/\n/g, '\\n'));
    const firma = encodeURIComponent(document.getElementById('firma').value.trim());
    const fecha = document.getElementById('fecha').value;
    const musica = encodeURIComponent(document.getElementById('musica').value.trim());

    // Construir URL
    let url = window.location.origin + window.location.pathname.replace('generador.html','index.html') + '?';
    if (mensaje) url += `text=${mensaje}&`;
    if (firma) url += `firma=${firma}&`;
    if (fecha) url += `event=${fecha}&`;
    if (musica) url += `musica=${musica}&`;
    url = url.replace(/&$/, '');

    linkFinal.value = url;
    resultado.classList.remove('hidden');
  });

  copiarBtn.addEventListener('click', function() {
    linkFinal.select();
    document.execCommand('copy');
    copiarBtn.textContent = '¡Copiado!';
    setTimeout(() => copiarBtn.textContent = 'Copiar Link', 1200);
  });
});
