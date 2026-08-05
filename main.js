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

const pad = (n) => String(n).padStart(2, '0');

function updateCountdown() {
    const now = new Date();
    let diff = LAUNCH_DATE - now;

    if (diff <= 0) {
        diff = 0;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMin = document.getElementById('cd-min');
    const cdSec = document.getElementById('cd-sec');

    if (cdDays) cdDays.textContent = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMin) cdMin.textContent = pad(minutes);
    if (cdSec) cdSec.textContent = pad(seconds);

    const telemetryClock = document.getElementById('telemetry-clock');
    if (telemetryClock) {
        telemetryClock.textContent = `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);
