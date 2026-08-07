// ---- Starfield background ----
const starsContainer = document.getElementById('stars');
if (starsContainer) {
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.width = Math.random() * 2 + 1 + 'px';
        star.style.height = star.style.width;
        starsContainer.appendChild(star);
    }
}

// ---- Mission countdown: launch date Nov 14, 2026, 08:00 (Argentina, UTC-3) ----
const LAUNCH_DATE = new Date('2026-11-14T08:00:00-03:00');

const pad = (n, len = 2) => String(n).padStart(len, '0');

// ---- 3D Flip-card engine ----
// Each unit (days/hours/min/sec) is a card with a front face (currently
// shown value) and a back face (the incoming value). On change, the card
// rotates -180deg on the X axis in real 3D (perspective + preserve-3d),
// revealing the back face. When the rotation finishes we silently reset
// the card and swap the front face to the new value, ready for the next flip.
class FlipUnit {
    constructor(cardId) {
        this.card = document.getElementById(cardId);
        if (!this.card) return;
        this.inner = this.card.querySelector('.flip-card-inner');
        this.frontSpan = this.card.querySelector('.flip-face-front span');
        this.backSpan = this.card.querySelector('.flip-face-back span');
        this.current = this.frontSpan ? this.frontSpan.textContent : null;
        this.flipping = false;
    }

    set(value) {
        if (!this.card || value === this.current) return;

        if (this.flipping) {
            // A flip is already mid-flight: just make sure the back face
            // is caught up to the latest value.
            this.backSpan.textContent = value;
            this.current = value;
            return;
        }

        this.flipping = true;
        this.backSpan.textContent = value;
        this.current = value;
        this.inner.classList.add('is-flipping');

        const onEnd = (e) => {
            if (e.propertyName !== 'transform') return;
            this.inner.removeEventListener('transitionend', onEnd);
            this.inner.classList.add('no-transition');
            this.inner.classList.remove('is-flipping');
            this.frontSpan.textContent = this.current;
            // force reflow so the next transition re-enables cleanly
            void this.inner.offsetWidth;
            this.inner.classList.remove('no-transition');
            this.flipping = false;
        };

        this.inner.addEventListener('transitionend', onEnd);
    }
}

const flipUnits = {
    days: new FlipUnit('flip-days'),
    hours: new FlipUnit('flip-hours'),
    min: new FlipUnit('flip-min'),
    sec: new FlipUnit('flip-sec'),
};

function updateCountdown() {
    const now = new Date();
    let diff = LAUNCH_DATE - now;
    if (diff <= 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    flipUnits.days.set(pad(days, 3));
    flipUnits.hours.set(pad(hours));
    flipUnits.min.set(pad(minutes));
    flipUnits.sec.set(pad(seconds));

    const telemetryClock = document.getElementById('telemetry-clock');
    if (telemetryClock) {
        telemetryClock.textContent = `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---- Jurado drawer / gallery ----
// Editá estos dos arrays para agregar/quitar jurados. Cada "img" apunta a
// un archivo dentro de /public/jurados/ — solo poné la foto ahí con ese nombre.
const JURADO_HONOR = [
    { name: 'Mario Benavente', role: 'Ingeniero en Computación / Intendente de la Ciudad Capital', img: '/public/jurados/intendente.png' },
    { name: 'Jaqueline Digion', role: 'Ing. xxx / DGICSE', img: '/public/jurados/jaqueline.png' },
    { name: 'Monica Gaileola', role: 'Ing. xxx / Dirección de Informatica', img: '/public/jurados/monica.png' },
    { name: 'Dr. Borzarelli', role: 'Rol / CONAE', img: '/public/jurados/honor-2.jpg' },
];

const JURADO_EVALUADOR = [
    { name: 'Maria de los Angeles Perez', role: 'Ing. xxx / institución', img: '/public/jurados/maria.png' },
    { name: 'Viviana Brito', role: 'Mg. xxx / institución', img: '/public/jurados/viviana.png' },
    { name: 'Jorge Galucci', role: 'Ingeniero xxx / institución', img: '/public/jurados/jorge.png' },
    { name: 'Sebastian Savino', role: 'Senior Software Enginner / institución', img: '/public/jurados/sebastian.png' },
];

function buildJuradoCard(j) {
    const card = document.createElement('figure');
    card.className = 'jurado-card';
    card.innerHTML = `
        <div class="jurado-photo">
            <img src="${j.img}" alt="${j.name}" loading="lazy">
        </div>
        <figcaption>
            <span class="jurado-name">${j.name}</span>
            <span class="jurado-role">${j.role}</span>
        </figcaption>
    `;

    // Hasta que exista la foto real en esa ruta, muestra un placeholder
    // en vez de un ícono de imagen rota.
    const img = card.querySelector('img');
    img.addEventListener('error', () => {
        img.closest('.jurado-photo').classList.add('jurado-photo--empty');
    }, { once: true });

    return card;
}

function buildJuradoGroup(title, jurados) {
    const group = document.createElement('div');
    group.className = 'jurado-group';
    group.innerHTML = `<h3 class="jurado-group-title">${title}</h3>`;

    const grid = document.createElement('div');
    grid.className = 'jurado-gallery';
    jurados.forEach((j) => grid.appendChild(buildJuradoCard(j)));

    group.appendChild(grid);
    return group;
}

function buildJuradoGallery() {
    const container = document.getElementById('jurado-gallery');
    if (!container || container.children.length) return;

    container.appendChild(buildJuradoGroup('Jurado de Honor', JURADO_HONOR));
    container.appendChild(buildJuradoGroup('Jurado Evaluador', JURADO_EVALUADOR));
}

(function initJuradoModal() {
    const btnOpen = document.getElementById('btn-jurado');
    const btnClose = document.getElementById('jurado-close');
    const overlay = document.getElementById('jurado-overlay');
    const modal = document.getElementById('jurado-modal');
    if (!btnOpen || !overlay || !modal) return;

    let lastFocused = null;

    function openJurado() {
        buildJuradoGallery();
        lastFocused = document.activeElement;
        overlay.hidden = false;
        modal.hidden = false;
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
            modal.classList.add('is-open');
        });
        document.body.classList.add('no-scroll');
        btnClose.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeJurado() {
        overlay.classList.remove('is-open');
        modal.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
        document.removeEventListener('keydown', onKeydown);

        const onEnd = (e) => {
            if (e.target !== modal || e.propertyName !== 'transform') return;
            modal.removeEventListener('transitionend', onEnd);
            overlay.hidden = true;
            modal.hidden = true;
        };
        modal.addEventListener('transitionend', onEnd);

        if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeJurado();
    }

    btnOpen.addEventListener('click', openJurado);
    btnClose.addEventListener('click', closeJurado);
    overlay.addEventListener('click', closeJurado);
})();