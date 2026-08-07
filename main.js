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

const JURADO_HONOR = [
    { name: 'Mario Benavente', role: 'Ingeniero en Computación / Intendente de la Ciudad Capital', img: '/public/jurados/intendente.png' },
    { name: 'Jaqueline Digion', role: 'Ingeniera en Computación / Esp. en Ingeniería Web / Esp. en Gestión Pública.', img: '/public/jurados/jaqueline.png' },
    { name: 'Monica Gaileola', role: 'Ingeninera / Institución', img: '/public/jurados/monica.png' },
    { name: 'Dr. Borzarelli', role: 'Rol / CONAE', img: '/public/jurados/honor-2.jpg' },
];

const JURADO_EVALUADOR = [
    { name: 'María de los Ángeles Pérez', role: 'Ingeniera en Computación / Programación 3 y 4 - Base de Datos 1 y 2 ITSE', img: '/public/jurados/maria.png' },
    { name: 'Viviana Brito', role: 'Mg.  / institución', img: '/public/jurados/viviana.png' },
    { name: 'Jorge Galucci', role: 'Ingeniero en Computación', img: '/public/jurados/jorge.png' },
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

// ---- Team ship slider ----

const TEAM = [
    { name: 'Maximiliano Padilla', role: 'Local Lead', img: '/public/equipo/maximiliano.png' },
    { name: 'Sandra Sanchez', role: 'Co-Lead', img: '/public/equipo/sandra.png' },
    { name: 'Yenina Barrera', role: 'RR.HH.', img: '/public/equipo/yenina.png' },
    { name: 'Carlos', role: 'Enlace UNSE', img: '/public/equipo/carlos.png' },
    { name: 'Matias', role: 'Staff', img: '/public/equipo/matias.jpeg' },
    { name: 'Gastón Segura', role: 'Enlace ITSE', img: '/public/equipo/conGaston.png' },
];

(function initTeamShip() {
    const track = document.getElementById('team-track');
    const dotsWrap = document.getElementById('team-dots');
    const nameEl = document.getElementById('team-name');
    const roleEl = document.getElementById('team-role');
    const btnPrev = document.getElementById('team-prev');
    const btnNext = document.getElementById('team-next');
    if (!track || !TEAM.length) return;

    let index = 0;
    let timer = null;
    const AUTOPLAY_MS = 4500;

    // Build slides
    TEAM.forEach((member) => {
        const slide = document.createElement('div');
        slide.className = 'ship-slide';
        slide.innerHTML = `<img src="${member.img}" alt="${member.name}" loading="lazy">`;

        const img = slide.querySelector('img');
        img.addEventListener('error', () => {
            slide.classList.add('ship-slide--empty');
            slide.innerHTML = '☆';
        }, { once: true });

        track.appendChild(slide);
    });

    // Build dots
    const dots = TEAM.map((member, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'ship-dot';
        dot.setAttribute('aria-label', member.name);
        dot.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function render() {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
        const current = TEAM[index];
        nameEl.textContent = current.name;
        roleEl.textContent = current.role;
    }

    function goTo(i, userInitiated) {
        index = (i + TEAM.length) % TEAM.length;
        render();
        if (userInitiated) restartAutoplay();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    btnNext.addEventListener('click', () => goTo(index + 1, true));
    btnPrev.addEventListener('click', () => goTo(index - 1, true));

    const shipSlider = document.querySelector('.ship-slider');
    if (shipSlider) {
        shipSlider.addEventListener('mouseenter', stopAutoplay);
        shipSlider.addEventListener('mouseleave', startAutoplay);
        shipSlider.addEventListener('focusin', stopAutoplay);
        shipSlider.addEventListener('focusout', startAutoplay);
    }

    render();
    startAutoplay();
})();

// ---- Mentor / Asesor sign-up modal ----

const MENTOR_WHATSAPP_NUMBER = '5493855075058';
const MENTOR_MAX_FILE_MB = 8;

(function initMentorModal() {
    const btnOpen = document.getElementById('btn-mentor');
    const btnClose = document.getElementById('mentor-close');
    const overlay = document.getElementById('mentor-overlay');
    const modal = document.getElementById('mentor-modal');
    const form = document.getElementById('mentor-form');
    const errorBox = document.getElementById('mentor-error');
    if (!btnOpen || !overlay || !modal || !form) return;

    let lastFocused = null;

    function openMentor() {
        lastFocused = document.activeElement;
        overlay.hidden = false;
        modal.hidden = false;
        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
            modal.classList.add('is-open');
        });
        document.body.classList.add('no-scroll');
        document.getElementById('mentor-nombre')?.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeMentor() {
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
        if (e.key === 'Escape') closeMentor();
    }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.hidden = false;
    }

    function hideError() {
        errorBox.hidden = true;
        errorBox.textContent = '';
    }

    async function onSubmit(e) {
        e.preventDefault();
        hideError();

        const data = new FormData(form);
        const nombre = (data.get('nombre') || '').toString().trim();
        const apellido = (data.get('apellido') || '').toString().trim();
        const condicion = (data.get('condicion') || '').toString().trim();
        const hackathon = (data.get('hackathon') || '').toString().trim();
        const anio = (data.get('anio') || '').toString().trim();
        const foto = data.get('foto');

        if (!nombre || !apellido || !condicion || !hackathon || !anio) {
            showError('Completá todos los campos antes de enviar.');
            return;
        }

        if (!foto || !(foto instanceof File) || foto.size === 0) {
            showError('Adjuntá una foto o comprobante de tu participación.');
            return;
        }

        if (foto.size > MENTOR_MAX_FILE_MB * 1024 * 1024) {
            showError(`La foto no puede superar los ${MENTOR_MAX_FILE_MB}MB.`);
            return;
        }

        const MENTOR_WHATSAPP_NUMBER = '5493855306840';

        const message =
            `🚀 Inscripción Mentor/Asesor - NASA Space Apps Santiago del Estero\n` +
            `Nombre: ${nombre}\n` +
            `Apellido: ${apellido}\n` +
            `Condición: ${condicion}\n` +
            `Hackathon en el que participó: ${hackathon}\n` +
            `Año: ${anio}\n` +
            `(Adjunto foto/comprobante en este chat)`;

        const waUrl = `https://wa.me/${MENTOR_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        let sharedWithFile = false;
        if (navigator.canShare && navigator.canShare({ files: [foto] })) {
            try {
                await navigator.share({
                    files: [foto],
                    title: 'Inscripción Mentor/Asesor',
                    text: message,
                });
                sharedWithFile = true;
            } catch (err) {
                // El usuario canceló el share o falló: seguimos con el fallback de wa.me
                sharedWithFile = false;
            }
        }

        if (!sharedWithFile) {
            window.open(waUrl, '_blank', 'noopener');
        }

        form.reset();
        closeMentor();
    }

    btnOpen.addEventListener('click', openMentor);
    btnClose.addEventListener('click', closeMentor);
    overlay.addEventListener('click', closeMentor);
    form.addEventListener('submit', onSubmit);
})();

// ---- Ubicación modal (mapa + galería del lugar) ----
const LUGAR_FOTOS = [
    { caption: 'Fachada de acceso', img: '/public/sede/exterior.jpg' },
    { caption: 'Sala principal', img: '/public/sede/forum.jpg' },
    { caption: 'Espacio de trabajo', img: '/public/sede/forum1.jpg' },
    { caption: 'Vista exterior', img: '/public/sede/forum2.jpg' },
    { caption: 'Fachada de acceso', img: '/public/sede/forum3.jpg' },
    { caption: 'Sala principal', img: '/public/sede/forum4.jpg' },
    { caption: 'Espacio de trabajo', img: '/public/sede/forum5.jpg' },
    { caption: 'Vista exterior', img: '/public/sede/peru.jpg' },
    { caption: 'Fachada de acceso', img: '/public/sede/sala.jpg' },
    { caption: 'Sala principal', img: '/public/sede/sala1.jpg' },
    { caption: 'Espacio de trabajo', img: '/public/sede/sala2.jpg' },
    { caption: 'Vista exterior', img: '/public/sede/sala3.jpg' },
    { caption: 'Fachada de acceso', img: '/public/sede/sala4.jpg' },
    { caption: 'Sala principal', img: '/public/sede/sala5.jpg' },
];

function buildLugarGallery() {
    const gallery = document.getElementById('ubicacion-gallery');
    if (!gallery || gallery.children.length) return;

    LUGAR_FOTOS.forEach((p) => {
        const fig = document.createElement('figure');
        fig.className = 'place-photo';
        fig.innerHTML = `<img src="${p.img}" alt="${p.caption}" loading="lazy">`;
        gallery.appendChild(fig);

        const img = fig.querySelector('img');
        img.addEventListener('error', () => {
            fig.classList.add('place-photo--empty');
        }, { once: true });
    });
}

(function initUbicacionModal() {
    const btnOpen = document.getElementById('btn-ubicacion');
    const btnClose = document.getElementById('ubicacion-close');
    const overlay = document.getElementById('ubicacion-overlay');
    const modal = document.getElementById('ubicacion-modal');
    if (!btnOpen || !overlay || !modal) return;

    let lastFocused = null;

    function openUbicacion() {
        buildLugarGallery();
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

    function closeUbicacion() {
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
        if (e.key === 'Escape') closeUbicacion();
    }

    btnOpen.addEventListener('click', openUbicacion);
    btnClose.addEventListener('click', closeUbicacion);
    overlay.addEventListener('click', closeUbicacion);
})();