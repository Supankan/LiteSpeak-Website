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
            if(currentBtn) updateIcon(currentBtn, 'play');
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
    btn.innerHTML = `<i data-lucide="${iconName}" class="fill-current ml-1 w-6 h-6"></i>`;
    lucide.createIcons({ root: btn });
}

// ==========================================
// 🌊 INTERACTIVE SOUNDWAVE CANVAS
// ==========================================
const canvas = document.getElementById('hero-waves');
const ctx = canvas.getContext('2d');

let width, height;
let waves = [];
let mouse = { x: 0, y: 0 };

const config = {
    waveCount: 3,
    baseAmplitude: 30,
    mouseInfluence: 50,
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

        const mouseAmp = (mouse.y / height) * config.mouseInfluence;
        const amplitude = config.baseAmplitude + mouseAmp;
        const frequency = 0.002 + (mouse.x / width) * 0.001;

        for (let x = 0; x < width; x++) {
            const y = height / 2 + 
                      Math.sin(x * frequency + this.phase + this.offset) * amplitude * Math.sin(x * 0.005 + time * 0.5);
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        this.phase += config.speed;
    }
}

function initWaves() {
    resize();
    waves = [];
    for(let i=0; i<config.waveCount; i++) {
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