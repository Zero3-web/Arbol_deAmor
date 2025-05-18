//© Zero - Código libre no comercial


// Cargar el SVG y animar el castillo
fetch('Img/castle.svg')
  .then(res => res.text())
  .then(svgText => {
    const container = document.getElementById('tree-container');
    container.innerHTML = svgText;
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Animación de "dibujo" para todos los paths
    const allPaths = Array.from(svg.querySelectorAll('path'));
    allPaths.forEach(path => {
      path.style.stroke = '#222';
      path.style.strokeWidth = '2.5';
      path.style.fillOpacity = '0';
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.transition = 'none';
    });

    // Forzar reflow y luego animar
    setTimeout(() => {
      allPaths.forEach((path, i) => {
        path.style.transition = `stroke-dashoffset 1.2s cubic-bezier(.77,0,.18,1) ${i * 0.08}s, fill-opacity 0.5s ${0.9 + i * 0.08}s`;
        path.style.strokeDashoffset = 0;
        setTimeout(() => {
          path.style.fillOpacity = '1';
          path.style.stroke = '';
          path.style.strokeWidth = '';
        }, 1200 + i * 80);
      });

      // Después de la animación de dibujo, mueve y agranda el SVG
      const totalDuration = 1200 + (allPaths.length - 1) * 80 + 500;
      setTimeout(() => {
        svg.classList.add('move-and-scale');
        // Cuando la animación de mover y escalar termine, cambiar fondo, letras y svg a blanco
        svg.addEventListener('transitionend', function onMoveAndScale(e) {
          if (e.propertyName === 'transform') {
            // Cambiar fondo y letras
            document.body.style.background = '#84a59d';
            document.body.style.transition = 'background 1.2s';
            // Cambiar color de textos principales a negro
            const dedication = document.getElementById('dedication-text');
            if (dedication) dedication.style.color = '#000';
            const countdown = document.getElementById('countdown');
            if (countdown) countdown.style.color = '#000';
            // Cambiar firma si existe
            const signature = document.getElementById('signature');
            if (signature) signature.style.color = '#000';
            // Cambiar el SVG a blanco
            if (svg) {
              const svgEls = svg.querySelectorAll('*');
              svgEls.forEach(el => {
                if (el.tagName !== 'svg') {
                  el.setAttribute('fill', 'none');
                  el.setAttribute('stroke', '#fff');
                  el.style.fill = 'none';
                  el.style.stroke = '#fff';
                  el.style.filter = '';
                }
              });
            }
            // Lanzar fuegos artificiales
            launchFireworks();
            // Mostrar mensaje, pétalos, cuenta regresiva y música SOLO después de mover el castillo
            setTimeout(() => {
              showDedicationText();
              startFloatingObjects();
              showCountdown();
              playBackgroundMusic();
            }, 600); // Puedes ajustar el tiempo si quieres más protagonismo para los fuegos
            svg.removeEventListener('transitionend', onMoveAndScale);
          }
        });
        // (No mostrar nada aquí, todo se muestra después de mover el castillo)
      }, totalDuration);
// Fuegos artificiales sencillos
function launchFireworks() {
  let canvas = document.getElementById('fireworks-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    const castle = document.getElementById('tree-container');
    if (castle && castle.offsetWidth > 0 && castle.offsetHeight > 0 && getComputedStyle(castle).display !== 'none') {
      // Asegura que el contenedor tenga position: relative
      castle.style.position = 'relative';
      canvas.width = castle.offsetWidth;
      canvas.height = castle.offsetHeight;
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = 10;
      // Insertar canvas como último hijo para estar sobre el SVG
      castle.appendChild(canvas);
      // Asegura que el SVG tenga z-index menor y fondo transparente
      const svg = castle.querySelector('svg');
      if (svg) {
        svg.style.position = 'relative';
        svg.style.zIndex = '1';
        svg.style.background = 'none';
        svg.setAttribute('style', (svg.getAttribute('style') || '') + ';background:none!important;');
      }
      canvas.style.display = 'block';
      canvas.style.background = 'transparent';
    } else {
      // fallback a pantalla completa si no existe el castillo o está oculto
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = 20;
      document.body.appendChild(canvas);
    }
  }
  // Forzar mostrar el canvas
  canvas.style.display = 'block';
  canvas.style.background = 'transparent';
  // DEBUG: Log dimensiones y modo
  //console.log('FW Canvas:', canvas.width, canvas.height, 'parent:', canvas.parentElement && canvas.parentElement.id);
  const ctx = canvas.getContext('2d');
  let fireworks = [];
  let particles = [];
  let sparkles = [];

  // --- NUEVO: Fuegos artificiales infinitos ---
  function spawnFirework() {
    // Variedad de posiciones: SOLO sobre el castillo
    let canvas = document.getElementById('fireworks-canvas');
    let x, y;
    if (canvas && canvas.parentElement && canvas.parentElement.id === 'tree-container') {
      x = Math.random() * canvas.width * 0.85 + canvas.width * 0.08;
      y = Math.random() * canvas.height * 0.45 + canvas.height * 0.08;
    } else {
      x = Math.random() * window.innerWidth * 0.9 + window.innerWidth * 0.05;
      y = Math.random() * window.innerHeight * 0.45 + window.innerHeight * 0.05;
    }
    // Efecto de onda (pop de luz)
    let wave = {
      x,
      y,
      radius: 0,
      maxRadius: 38 + Math.random() * 32,
      alpha: 0.38 + Math.random() * 0.22,
      color: randomColor(),
      growing: true
    };
    if (!window._fireworkWaves) window._fireworkWaves = [];
    window._fireworkWaves.push(wave);

    fireworks.push({ x, y, radius: 2, alpha: 1, color: randomColor() });
    for (let j = 0; j < 38; j++) {
      let angle = (Math.PI * 2 * j) / 38;
      let speed = 2.2 + Math.random() * 2.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: randomColor(),
      });
    }
    // Brillos tipo "Disney"
    for (let k = 0; k < 18; k++) {
      let angle = Math.random() * Math.PI * 2;
      let r = 30 + Math.random() * 60;
      let sx = x + Math.cos(angle) * r;
      let sy = y + Math.sin(angle) * r;
      sparkles.push({
        x: sx,
        y: sy,
        alpha: 1,
        size: 1.5 + Math.random() * 2.5,
        color: randomSparkleColor(),
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  // Lanzar varios al inicio
  for (let i = 0; i < 12; i++) {
    setTimeout(spawnFirework, i * 220);
  }

  // Lanzar fuegos artificiales de forma infinita cada cierto tiempo
  let fireworksInterval = setInterval(() => {
    spawnFirework();
  }, 900);

  let frame = 0;
  let running = true;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Efectos de onda (pop de luz)
    if (!window._fireworkWaves) window._fireworkWaves = [];
    window._fireworkWaves.forEach((wave, idx) => {
      if (wave.growing) {
        wave.radius += 3.2;
        if (wave.radius > wave.maxRadius) wave.growing = false;
      } else {
        wave.alpha -= 0.018;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, wave.alpha);
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2.5 + 1.5 * Math.random();
      ctx.shadowColor = wave.color;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    });
    // Eliminar ondas que ya se desvanecieron
    window._fireworkWaves = window._fireworkWaves.filter(wave => wave.alpha > 0.01);

    // Dibujar fuegos
    fireworks.forEach(fw => {
      ctx.save();
      ctx.globalAlpha = fw.alpha;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
      ctx.fillStyle = fw.color;
      ctx.shadowColor = fw.color;
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.restore();
      fw.alpha -= 0.035;
    });
    // Dibujar partículas
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035; // gravedad
      p.alpha -= 0.014;
    });
    // Brillos mágicos
    sparkles.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.alpha * (0.7 + 0.3 * Math.sin(frame * 0.18 + s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.7 + 0.5 * Math.abs(Math.sin(frame * 0.12 + s.twinkle))), 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
      s.alpha -= 0.008;
    });
    // Filtrar
    fireworks = fireworks.filter(fw => fw.alpha > 0);
    particles = particles.filter(p => p.alpha > 0);
    sparkles = sparkles.filter(s => s.alpha > 0);
    frame++;
    if (running) {
      requestAnimationFrame(animate);
    } else {
      clearInterval(fireworksInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.remove();
    }
  }
  animate();

  // Si alguna vez quieres detener los fuegos artificiales, puedes exponer una función para ello:
  // window.stopFireworks = function() { running = false; };
}

function randomColor() {
  const colors = ['#ff2d55', '#ff9500', '#ffd700', '#32d74b', '#0a84ff', '#5e5ce6', '#ff375f', '#fff', '#b4e0ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}
function randomSparkleColor() {
  const colors = ['#fff', '#ffe6a7', '#b4e0ff', '#fffbe7', '#f8e1ff', '#e0f7fa'];
  return colors[Math.floor(Math.random() * colors.length)];
}
    }, 50);

    // Selecciona los corazones (formas rojas)
    const heartPaths = allPaths.filter(el => {
      const style = el.getAttribute('style') || '';
      return style.includes('#FC6F58') || style.includes('#C1321F');
    });
    heartPaths.forEach(path => {
      path.classList.add('animated-heart');
    });
  });

// Efecto máquina de escribir para el texto de dedicatoria (seguidores)
function getURLParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function showDedicationText() { //seguidores
  let text = getURLParam('text');
  if (!text) {
    text = `Para el amor de mi vida:\n\nDesde el primer momento supe que eras tú. Tu sonrisa, tu voz, tu forma de ser… todo en ti me hace sentir en casa.\n\nGracias por acompañarme en cada paso, por entenderme incluso en silencio, y por llenar mis días de amor.\n\nTe amo más de lo que las palabras pueden expresar.`;  } else {
    text = decodeURIComponent(text).replace(/\\n/g, '\n');
  }
  const container = document.getElementById('dedication-text');
  container.classList.add('typing');
  let i = 0;
  function type() {
    if (i <= text.length) {
      container.textContent = text.slice(0, i);
      i++;
      setTimeout(type, text[i - 2] === '\n' ? 350 : 45);
    } else {
      // Al terminar el typing, mostrar la firma animada
      setTimeout(showSignature, 600);
    }
  }
  type();
}

// Firma manuscrita animada
function showSignature() {
  // Cambia para buscar la firma dentro del contenedor de dedicatoria
  const dedication = document.getElementById('dedication-text');
  let signature = dedication.querySelector('#signature');
  if (!signature) {
    signature = document.createElement('div');
    signature.id = 'signature';
    signature.className = 'signature';
    dedication.appendChild(signature);
  }
  let firma = getURLParam('firma');
  signature.textContent = firma ? decodeURIComponent(firma) : "Con amor, Zero";
  signature.classList.add('visible');
}



// Controlador de objetos flotantes
function startFloatingObjects() {
  const container = document.getElementById('floating-objects');
  let count = 0;
  function spawn() {
    let el = document.createElement('div');
    el.className = 'floating-petal';
    // Posición inicial
    el.style.left = `${Math.random() * 90 + 2}%`;
    el.style.top = `${100 + Math.random() * 10}%`;
    el.style.opacity = 0.7 + Math.random() * 0.3;
    container.appendChild(el);

    // Animación flotante
    const duration = 6000 + Math.random() * 4000;
    const drift = (Math.random() - 0.5) * 60;
    setTimeout(() => {
      el.style.transition = `transform ${duration}ms linear, opacity 1.2s`;
      el.style.transform = `translate(${drift}px, -110vh) scale(${0.8 + Math.random() * 0.6}) rotate(${Math.random() * 360}deg)`;
      el.style.opacity = 0.2;
    }, 30);

    // Eliminar después de animar
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, duration + 2000);

    // Generar más objetos
    if (count++ < 32) setTimeout(spawn, 350 + Math.random() * 500);
    else setTimeout(spawn, 1200 + Math.random() * 1200);
  }
  spawn();
}

// Cuenta regresiva o fecha especial
function showCountdown() {
  const container = document.getElementById('countdown');
  let startParam = getURLParam('start');
  let eventParam = getURLParam('event');
  let startDate = startParam ? new Date(startParam + 'T00:00:00') : new Date('2024-08-03T00:00:00'); 
  let eventDate = eventParam ? new Date(eventParam + 'T00:00:00') : new Date('2025-08-03T00:00:00');

  function update() {
    const now = new Date();
    let eventDiff = eventDate - now;
    let eventDays = Math.max(0, Math.floor(eventDiff / (1000 * 60 * 60 * 24)));
    let eventHours = Math.max(0, Math.floor((eventDiff / (1000 * 60 * 60)) % 24));
    let eventMinutes = Math.max(0, Math.floor((eventDiff / (1000 * 60)) % 60));
    let eventSeconds = Math.max(0, Math.floor((eventDiff / 1000) % 60));

    container.innerHTML =
      `Tu cumpleaños comienza en: <b>${eventDays}d ${eventHours}h ${eventMinutes}m ${eventSeconds}s</b>`;
    container.classList.add('visible');
  }
  update();
  setInterval(update, 1000);
}

// --- Música de fondo ---
function playBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  // --- Opción archivo local por parámetro 'musica' ---
  let musicaParam = getURLParam('musica');
  if (musicaParam) {
    // Decodifica y previene rutas maliciosas
    musicaParam = decodeURIComponent(musicaParam).replace(/[^\w\d .\-]/g, '');
    audio.src = 'Music/' + musicaParam;
  }

  // --- Opción YouTube (solo mensaje de ayuda) ---
  let youtubeParam = getURLParam('youtube');
  if (youtubeParam) {
    // Muestra mensaje de ayuda para descargar el audio
    let helpMsg = document.getElementById('yt-help-msg');
    if (!helpMsg) {
      helpMsg = document.createElement('div');
      helpMsg.id = 'yt-help-msg';
      helpMsg.style.position = 'fixed';
      helpMsg.style.right = '18px';
      helpMsg.style.bottom = '180px';
      helpMsg.style.background = 'rgba(255,255,255,0.95)';
      helpMsg.style.color = '#e60026';
      helpMsg.style.padding = '10px 16px';
      helpMsg.style.borderRadius = '12px';
      helpMsg.style.boxShadow = '0 2px 8px #e6002633';
      helpMsg.style.fontSize = '1.05em';
      helpMsg.style.zIndex = 100;
      helpMsg.innerHTML = 'Para usar música de YouTube, descarga el audio (por ejemplo, usando y2mate, 4K Video Downloader, etc.), colócalo en la carpeta <b>Music</b> y usa la URL así:<br><br><code>?musica=nombre.mp3</code>';
      document.body.appendChild(helpMsg);
      setTimeout(() => { if(helpMsg) helpMsg.remove(); }, 15000);
    }
  }

  // Eliminar el botón de música si existe
  const btn = document.getElementById('music-btn');
  if (btn) btn.remove();
  audio.volume = 0.7;
  audio.loop = true;
  // Intentar reproducir inmediatamente
  audio.play().catch(() => {
    // Si falla el autoplay, no hacer nada (el usuario puede interactuar con la página para habilitar el sonido)
  });
}

// --- Intro Screen Logic ---
window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro-screen');
  const holaBtn = document.getElementById('hola-btn');
  const mainEls = [
    document.getElementById('tree-container'),
    document.getElementById('dedication-text'),
    document.getElementById('countdown'),
    document.getElementById('floating-objects')
  ];
  // Hide all main content, show intro
  mainEls.forEach(el => el && el.classList.add('hidden'));
  if (intro) intro.style.display = 'flex';

  holaBtn && holaBtn.addEventListener('click', () => {
    // Hide intro, show main content
    intro.classList.add('hidden');
    mainEls.forEach(el => el && el.classList.remove('hidden'));
    // Start everything
    startMainExperience();
  });
});

function startMainExperience() {
  // Cargar y animar el castillo, mostrar textos, música, etc.
  // (Re-ejecuta el fetch y animación del castillo)
  fetch('Img/castle.svg')
    .then(res => res.text())
    .then(svgText => {
      const container = document.getElementById('tree-container');
      container.innerHTML = svgText;
      const svg = container.querySelector('svg');
      if (!svg) return;

      // Animación de "dibujo" para todos los paths
      const allPaths = Array.from(svg.querySelectorAll('path'));
      allPaths.forEach(path => {
        path.style.stroke = '#222';
        path.style.strokeWidth = '2.5';
        path.style.fillOpacity = '0';
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.transition = 'none';
      });

      setTimeout(() => {
        allPaths.forEach((path, i) => {
          path.style.transition = `stroke-dashoffset 1.2s cubic-bezier(.77,0,.18,1) ${i * 0.08}s, fill-opacity 0.5s ${0.9 + i * 0.08}s`;
          path.style.strokeDashoffset = 0;
          setTimeout(() => {
            path.style.fillOpacity = '1';
            path.style.stroke = '';
            path.style.strokeWidth = '';
          }, 1200 + i * 80);
        });

        // Después de la animación de dibujo, mueve y agranda el SVG
        const totalDuration = 1200 + (allPaths.length - 1) * 80 + 500;
        setTimeout(() => {
          svg.classList.add('move-and-scale');
          svg.addEventListener('transitionend', function onMoveAndScale(e) {
            if (e.propertyName === 'transform') {
              document.body.style.background = '#84a59d';
              document.body.style.transition = 'background 1.2s';
              const dedication = document.getElementById('dedication-text');
              if (dedication) dedication.style.color = '#000';
              const countdown = document.getElementById('countdown');
              if (countdown) countdown.style.color = '#000';
              const signature = document.getElementById('signature');
              if (signature) signature.style.color = '#000';
              if (svg) {
                const svgEls = svg.querySelectorAll('*');
                svgEls.forEach(el => {
                  if (el.tagName !== 'svg') {
                    el.setAttribute('fill', 'none');
                    el.setAttribute('stroke', '#fff');
                    el.style.fill = 'none';
                    el.style.stroke = '#fff';
                    el.style.filter = '';
                  }
                });
              }
              launchFireworks();
              svg.removeEventListener('transitionend', onMoveAndScale);
            }
          });
          setTimeout(() => {
            showDedicationText();
            startFloatingObjects();
            showCountdown();
            playBackgroundMusic();
          }, 1200);
        }, totalDuration);
      }, 50);

      // Selecciona los corazones (formas rojas)
      const heartPaths = allPaths.filter(el => {
        const style = el.getAttribute('style') || '';
        return style.includes('#FC6F58') || style.includes('#C1321F');
      });
      heartPaths.forEach(path => {
        path.classList.add('animated-heart');
      });
    });
}
