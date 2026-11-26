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
        if (event.key === "Escape") closeMenu();
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

// Site-wide sky animation is opt-in, remembers the choice in this tab, and respects reduced motion.
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
            if (hero) hero.classList.toggle("sky-motion-active", isPlaying);
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

        document.addEventListener("pointermove", (event) => {
            if (!document.body.classList.contains("site-motion-active")) return;
            const x = Math.max(0, Math.min(100, (event.clientX / window.innerWidth) * 100));
            const y = Math.max(0, Math.min(100, (event.clientY / window.innerHeight) * 100));
            document.body.style.setProperty("--site-light-x", `${x}%`);
            document.body.style.setProperty("--site-light-y", `${y}%`);
            document.body.style.setProperty("--site-star-x", `${(50 - x) * 0.06}px`);
            document.body.style.setProperty("--site-star-y", `${(50 - y) * 0.06}px`);
            document.body.style.setProperty("--site-moon-x", `${(50 - x) * 0.1}px`);
            document.body.style.setProperty("--site-moon-y", `${(50 - y) * 0.1}px`);

            if (hero) {
                const bounds = hero.getBoundingClientRect();
                const heroX = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
                const heroY = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
                hero.style.setProperty("--light-x", `${heroX}%`);
                hero.style.setProperty("--light-y", `${heroY}%`);
                hero.style.setProperty("--star-x", `${(50 - heroX) * 0.06}px`);
                hero.style.setProperty("--star-y", `${(50 - heroY) * 0.06}px`);
                hero.style.setProperty("--moon-x", `${(50 - heroX) * 0.1}px`);
                hero.style.setProperty("--moon-y", `${(50 - heroY) * 0.1}px`);
            }
        });
    }
}

// Gentle entrance motion. Content remains visible if motion is reduced or the API is unavailable.
if (!reducedMotion && "IntersectionObserver" in window) {
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
        if (!lightbox.hidden && event.key === "Escape") closeViewer();
    });
}
