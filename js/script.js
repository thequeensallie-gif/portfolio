// Accessible mobile navigation.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    const closeMenu = () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
        navLinks.classList.toggle("active", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
            closeMenu();
            menuToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
}

// Mark the current page in the navigation for sighted and assistive technology users.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const currentPath = window.location.pathname.replace(/index\.html$/, "");
document.querySelectorAll(".nav-links a").forEach((link) => {
    const targetPath = new URL(link.href, window.location.origin).pathname;
    if (targetPath === currentPath || (currentPath === "/" && targetPath === "/")) {
        link.setAttribute("aria-current", "page");
    }
});

// Site-wide sky animation starts automatically unless reduced motion is preferred.
// The play/pause choice is remembered while visitors move between pages in this tab.
const hero = document.querySelector(".signature-hero");
const skyMotionToggle = document.querySelector("#sky-motion-toggle");
const skyMotionStatus = document.querySelector("#sky-motion-status");
const motionStorageKey = "hope-celestial-motion-v2";
let savedMotion = true;

try {
    const storedMotion = sessionStorage.getItem(motionStorageKey);
    if (storedMotion !== null) savedMotion = storedMotion === "on";
} catch (error) {
    savedMotion = true;
}

if (skyMotionToggle && skyMotionStatus) {
    if (reducedMotion) {
        skyMotionStatus.textContent = "Animation is paused because reduced motion is enabled on your device.";
    } else {
        skyMotionToggle.disabled = false;

        const applyMotionState = (isPlaying) => {
            document.body.classList.toggle("site-motion-active", isPlaying);
            if (hero) {
                hero.classList.toggle("sky-motion-active", isPlaying);
                if (isPlaying) {
                    const bounds = hero.getBoundingClientRect();
                    hero.style.setProperty("--light-px-x", `${bounds.width * 0.72}px`);
                    hero.style.setProperty("--light-px-y", `${bounds.height * 0.38}px`);
                }
            }
            skyMotionToggle.setAttribute("aria-pressed", String(isPlaying));
            skyMotionToggle.querySelector(".sky-toggle-label").textContent = isPlaying ? "Pause sky" : "Play sky";
            skyMotionStatus.textContent = isPlaying
                ? "Sky animation is playing across the site. Move your pointer to guide the moonlight."
                : "Sky animation is paused.";
            try {
                sessionStorage.setItem(motionStorageKey, isPlaying ? "on" : "off");
            } catch (error) {
                // The button still works for this page when session storage is unavailable.
            }
        };

        applyMotionState(savedMotion);
        skyMotionToggle.addEventListener("click", () => {
            const isPlaying = skyMotionToggle.getAttribute("aria-pressed") === "true";
            applyMotionState(!isPlaying);
        });

        let pointerFrame = null;
        let latestPointer = null;
        document.addEventListener("pointermove", (event) => {
            if (!document.body.classList.contains("site-motion-active")) return;
            latestPointer = { x: event.clientX, y: event.clientY };
            if (pointerFrame !== null) return;

            pointerFrame = window.requestAnimationFrame(() => {
                pointerFrame = null;
                if (!latestPointer || !document.body.classList.contains("site-motion-active")) return;
                const { x: pointerX, y: pointerY } = latestPointer;
                const x = Math.max(0, Math.min(100, (pointerX / window.innerWidth) * 100));
                const y = Math.max(0, Math.min(100, (pointerY / window.innerHeight) * 100));
                const bounds = hero ? hero.getBoundingClientRect() : null;
                const heroX = bounds ? Math.max(0, Math.min(bounds.width, pointerX - bounds.left)) : 0;
                const heroY = bounds ? Math.max(0, Math.min(bounds.height, pointerY - bounds.top)) : 0;
                const heroXPercent = bounds ? (heroX / bounds.width) * 100 : 50;
                const heroYPercent = bounds ? (heroY / bounds.height) * 100 : 50;

                document.body.style.setProperty("--site-light-x", `${pointerX}px`);
                document.body.style.setProperty("--site-light-y", `${pointerY}px`);
                document.body.style.setProperty("--site-star-x", `${(50 - x) * 0.06}px`);
                document.body.style.setProperty("--site-star-y", `${(50 - y) * 0.06}px`);
                document.body.style.setProperty("--site-moon-x", `${(50 - x) * 0.1}px`);
                document.body.style.setProperty("--site-moon-y", `${(50 - y) * 0.1}px`);

                if (hero && bounds) {
                    hero.style.setProperty("--light-px-x", `${heroX}px`);
                    hero.style.setProperty("--light-px-y", `${heroY}px`);
                    hero.style.setProperty("--star-x", `${(50 - heroXPercent) * 0.06}px`);
                    hero.style.setProperty("--star-y", `${(50 - heroYPercent) * 0.06}px`);
                    hero.style.setProperty("--moon-x", `${(50 - heroXPercent) * 0.1}px`);
                    hero.style.setProperty("--moon-y", `${(50 - heroYPercent) * 0.1}px`);
                }
            });
        });
    }
}

// Gentle entrance motion. Content remains visible if motion is reduced or the API is unavailable.
const isHomePage = document.body.classList.contains("home-page");
if (!reducedMotion && !isHomePage && "IntersectionObserver" in window) {
    const revealItems = document.querySelectorAll(
        "main section, body > section, .skill-card, .project-card, .case-study-card, .job, .gallery-grid img"
    );

    revealItems.forEach((item) => item.classList.add("reveal"));

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    revealItems.forEach((item) => observer.observe(item));
}

// Keyboard-friendly project image lightbox.
const galleryImages = document.querySelectorAll(".gallery-grid img, .project-card img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.querySelector(".close-lightbox");
let lastFocusedImage = null;

if (lightbox && lightboxImg && closeLightbox) {
    const closeViewer = () => {
        lightbox.hidden = true;
        document.body.style.overflow = "";
        if (lastFocusedImage) lastFocusedImage.focus();
    };

    galleryImages.forEach((image) => {
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute("aria-label", `View larger image: ${image.alt}`);

        const openViewer = () => {
            lastFocusedImage = image;
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;
            lightbox.hidden = false;
            document.body.style.overflow = "hidden";
            closeLightbox.focus();
        };

        image.addEventListener("click", openViewer);
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openViewer();
            }
        });
    });

    closeLightbox.addEventListener("click", closeViewer);
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeViewer();
    });
    document.addEventListener("keydown", (event) => {
        if (lightbox.hidden) return;
        if (event.key === "Escape") {
            closeViewer();
        } else if (event.key === "Tab") {
            // The close button is the only focusable control in this dialog.
            event.preventDefault();
            closeLightbox.focus();
        }
    });
}

// Site-wide background music: visitors start it themselves; their choice and
// listening position can continue while they move between portfolio pages.
(() => {
    const player = document.createElement("aside");
    player.className = "site-music-player";
    player.setAttribute("aria-label", "Portfolio background music");
    player.innerHTML = `
        <button class="site-music-toggle" type="button" aria-pressed="false" aria-label="Play background music">
            <span class="site-music-icon" aria-hidden="true">♫</span>
            <span class="site-music-toggle-label">Play music</span>
        </button>
        <label class="site-music-volume">
            <span>Volume</span>
            <input class="site-music-volume-input" type="range" min="0" max="100" step="1" value="45" aria-label="Background music volume" aria-valuetext="45 percent">
            <output class="site-music-volume-value" aria-hidden="true">45%</output>
        </label>
        <a class="site-music-credit" href="https://pixabay.com/music/adventure-ocean-237911/" target="_blank" rel="noopener noreferrer">
            Music: Ocean by AmarantaMusic <span aria-hidden="true">↗</span>
            <span class="visually-hidden"> (Pixabay; opens in a new tab)</span>
        </a>
        <span class="site-music-status visually-hidden" role="status" aria-live="polite">Music is paused.</span>
        <audio class="site-music-audio" src="/audio/amarantamusic-ocean-237911.mp3" preload="auto" loop></audio>
    `;
    document.body.append(player);

    const audio = player.querySelector(".site-music-audio");
    const toggle = player.querySelector(".site-music-toggle");
    const toggleLabel = player.querySelector(".site-music-toggle-label");
    const volumeInput = player.querySelector(".site-music-volume-input");
    const volumeValue = player.querySelector(".site-music-volume-value");
    const status = player.querySelector(".site-music-status");
    const playingKey = "hope-portfolio-music-playing-v1";
    const timeKey = "hope-portfolio-music-time-v1";
    const volumeKey = "hope-portfolio-music-volume-v1";
    let shouldContinue = false;
    let savedTime = 0;
    let restorePosition = false;

    try {
        shouldContinue = sessionStorage.getItem(playingKey) === "on";
        savedTime = Number(sessionStorage.getItem(timeKey)) || 0;
        restorePosition = savedTime > 0;
        const storedVolume = localStorage.getItem(volumeKey);
        if (storedVolume !== null && Number.isFinite(Number(storedVolume))) {
            volumeInput.value = String(Math.max(0, Math.min(100, Math.round(Number(storedVolume) * 100))));
        }
    } catch (error) {
        // The player remains usable when browser storage is unavailable.
    }

    const applyVolume = () => {
        const percent = Number(volumeInput.value);
        audio.volume = percent / 100;
        volumeValue.value = `${percent}%`;
        volumeInput.setAttribute("aria-valuetext", `${percent} percent`);
        try {
            localStorage.setItem(volumeKey, String(audio.volume));
        } catch (error) {
            // Volume still changes for the current page.
        }
    };

    const setPlaying = (isPlaying, message) => {
        toggle.setAttribute("aria-pressed", String(isPlaying));
        toggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
        toggleLabel.textContent = isPlaying ? "Pause music" : "Play music";
        status.textContent = message || (isPlaying ? "Background music is playing." : "Music is paused.");
        try {
            sessionStorage.setItem(playingKey, isPlaying ? "on" : "off");
        } catch (error) {
            // The control still works for the current page.
        }
    };

    applyVolume();
    volumeInput.addEventListener("input", applyVolume);

    const restorePlayback = async () => {
        if (restorePosition && Number.isFinite(audio.duration) && audio.duration > 0) {
            try {
                audio.currentTime = savedTime % audio.duration;
                // Wait for the seek to finish before restarting, so playback
                // cannot briefly begin at the start of the track.
                await new Promise((resolve) => {
                    if (!audio.seeking) return resolve();
                    audio.addEventListener("seeked", resolve, { once: true });
                });
                restorePosition = false;
            } catch (error) {
                // If seeking is unavailable, keep the player usable.
            }
        }
        if (shouldContinue) {
            audio.play().then(() => setPlaying(true)).catch(() => {
                shouldContinue = false;
                setPlaying(false, "Press Play music to continue listening.");
            });
        }
    };

    audio.addEventListener("loadedmetadata", restorePlayback, { once: true });

    const savePlaybackPosition = () => {
        try {
            if (Number.isFinite(audio.currentTime)) {
                sessionStorage.setItem(timeKey, String(audio.currentTime));
            }
        } catch (error) {
            // Playback still works if browser storage is unavailable.
        }
    };
    // Keep a recent position in case navigation happens between timeupdate events.
    audio.addEventListener("timeupdate", savePlaybackPosition);

    toggle.addEventListener("click", async () => {
        if (!audio.paused) {
            audio.pause();
            setPlaying(false);
            return;
        }
        try {
            await audio.play();
            setPlaying(true);
        } catch (error) {
            setPlaying(false, "The music could not start. Please try again.");
        }
    });

    audio.addEventListener("error", () => {
        shouldContinue = false;
        setPlaying(false, "The music file could not load. Please try again later.");
    });

    window.addEventListener("pagehide", () => {
        try {
            savePlaybackPosition();
            sessionStorage.setItem(playingKey, audio.paused ? "off" : "on");
        } catch (error) {
            // Cross-page continuity is optional if session storage is unavailable.
        }
    });

    if (shouldContinue) {
        audio.load();
    }
})();
