// Initialize Lucide Icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('nav-glass', 'py-2');
        navbar.classList.remove('py-4');
    } else {
        navbar.classList.remove('nav-glass', 'py-2');
        navbar.classList.add('py-4');
    }
});

// Scroll Reveal Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// Audio Player Logic (Visualizer Trigger)
const playButtons = document.querySelectorAll('.play-btn');
let currentAudio = null;
let currentBtn = null;

playButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const audioSrc = btn.dataset.audio;
        // Find parent card to access its specific visualizer
        const card = btn.closest('.player-card');
        const visualizer = card.querySelector('.visualizer');

        // Helper to reset all visualizers
        const stopAllVisualizers = () => {
            document.querySelectorAll('.visualizer').forEach(v => v.classList.remove('playing'));
        };

        // Stop current if same
        if (currentAudio && currentAudio.src.includes(audioSrc)) {
            if (currentAudio.paused) {
                currentAudio.play();
                updateIcon(btn, 'pause');
                visualizer.classList.add('playing');
            } else {
                currentAudio.pause();
                updateIcon(btn, 'play');
                visualizer.classList.remove('playing');
            }
            return;
        }

        // Stop others
        if (currentAudio) {
            currentAudio.pause();
            stopAllVisualizers();
            if (currentBtn) updateIcon(currentBtn, 'play');
        }

        // Play new
        currentAudio = new Audio(audioSrc);
        currentBtn = btn;

        currentAudio.play().then(() => {
            updateIcon(btn, 'pause');
            visualizer.classList.add('playing');
        }).catch(e => {
            console.log("Audio file missing for demo");
            alert("Demo audio file not found. Please place mp3 in assets/audio/");
        });

        // Reset on end
        currentAudio.addEventListener('ended', () => {
            updateIcon(btn, 'play');
            visualizer.classList.remove('playing');
            currentAudio = null;
        });
    });
});

function updateIcon(btn, iconName) {
    const marginClass = iconName === 'play' ? 'ml-1' : '';
    btn.innerHTML = `<i data-lucide="${iconName}" class="fill-current ${marginClass} w-6 h-6"></i>`;
    lucide.createIcons({ root: btn });
}

// Format time as mm:ss
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Fetch and display audio duration
function initAudioDurations() {
    document.querySelectorAll('.play-btn').forEach(btn => {
        const audioSrc = btn.dataset.audio;
        const card = btn.closest('.player-card');
        const durationDisplay = card.querySelector('[data-duration-target]');

        if (!durationDisplay) return;

        const audio = new Audio(audioSrc);
        audio.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = `• ${formatTime(audio.duration)}`;
        });

        // Fallback if metadata fails to load quickly
        audio.addEventListener('error', () => {
            durationDisplay.textContent = `• --:--`;
        });
    });
}

// Initialize durations on load
window.addEventListener('DOMContentLoaded', initAudioDurations);

// ==========================================
// 🌊 INTERACTIVE SOUNDWAVE CANVAS (NEURAL FLUX)
// ==========================================
const canvas = document.getElementById('hero-waves');
const ctx = canvas.getContext('2d');

let width, height;
let waves = [];
let mouse = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };

// Energy System
let targetEnergy = 0;
let currentEnergy = 0;

const config = {
    waveCount: 3,
    baseAmplitude: 20,
    energyMultiplier: 5,   // How much mouse speed adds to energy
    energyDecay: 0.96,     // How fast energy fades (0-1)
    energySmoothing: 0.1,  // How smooth energy attack is
    speed: 0.005,
    colors: ['rgba(255, 255, 255, 0.3)', 'rgba(251, 146, 60, 0.3)', 'rgba(168, 85, 247, 0.3)']
};

class Wave {
    constructor(color, offset) {
        this.color = color;
        this.offset = offset;
        this.phase = 0;
    }

    draw(ctx, time) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;

        // Amplitude varies with energy
        const amplitude = config.baseAmplitude + (currentEnergy * 50);

        // Frequency adds "jitter" with energy
        const baseFreq = 0.002;
        const jitter = currentEnergy * 0.01;

        for (let x = 0; x < width; x++) {
            // Complex wave function: Base sine + Energy noise
            const y = height / 2 +
                Math.sin(x * (baseFreq + jitter) + this.phase + this.offset) * amplitude * Math.sin(x * 0.005 + time * 0.5);

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();

        // Waves move faster with high energy
        this.phase += config.speed + (currentEnergy * 0.05);
    }
}

function initWaves() {
    resize();
    waves = [];
    for (let i = 0; i < config.waveCount; i++) {
        waves.push(new Wave(config.colors[i], i * 2));
    }
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // 1. Calculate Mouse Speed (Instant Energy)
    const dx = mouse.x - lastMouse.x;
    const dy = mouse.y - lastMouse.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // 2. Add speed to target energy (capped)
    targetEnergy += speed * config.energyMultiplier * 0.01;
    targetEnergy = Math.min(targetEnergy, 2.5); // Max energy cap

    // 3. Smoothly decay target energy
    targetEnergy *= config.energyDecay;

    // 4. Smoothly move current energy towards target
    currentEnergy += (targetEnergy - currentEnergy) * config.energySmoothing;

    // 5. Update last mouse position
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    const t = time * 0.001;
    waves.forEach(wave => wave.draw(ctx, t));
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

initWaves();
