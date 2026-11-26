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

// The sky animation is opt-in. Reduced-motion preferences keep it paused.
const hero = document.querySelector(".signature-hero");
const skyMotionToggle = document.querySelector("#sky-motion-toggle");
const skyMotionStatus = document.querySelector("#sky-motion-status");

if (hero && skyMotionToggle) {
    if (reducedMotion) {
        skyMotionStatus.textContent = "Animation is paused because reduced motion is enabled on your device.";
    } else {
        skyMotionToggle.disabled = false;

        skyMotionToggle.addEventListener("click", () => {
            const isPlaying = skyMotionToggle.getAttribute("aria-pressed") === "true";
            const shouldPlay = !isPlaying;
            skyMotionToggle.setAttribute("aria-pressed", String(shouldPlay));
            skyMotionToggle.textContent = shouldPlay ? "✦ Pause moon & stars" : "✦ Play moon & stars";
            hero.classList.toggle("sky-motion-active", shouldPlay);
            skyMotionStatus.textContent = shouldPlay
                ? "Sky animation is playing. Move your pointer through the sky to guide the moonlight."
                : "Sky animation is paused.";
        });

        hero.addEventListener("pointermove", (event) => {
            if (!hero.classList.contains("sky-motion-active")) return;
            const bounds = hero.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
            const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
            hero.style.setProperty("--light-x", `${x}%`);
            hero.style.setProperty("--light-y", `${y}%`);
            hero.style.setProperty("--star-x", `${(50 - x) * 0.06}px`);
            hero.style.setProperty("--star-y", `${(50 - y) * 0.06}px`);
            hero.style.setProperty("--moon-x", `${(50 - x) * 0.1}px`);
            hero.style.setProperty("--moon-y", `${(50 - y) * 0.1}px`);
        });

        hero.addEventListener("pointerleave", () => {
            hero.style.setProperty("--light-x", "72%");
            hero.style.setProperty("--light-y", "38%");
            hero.style.setProperty("--star-x", "0px");
            hero.style.setProperty("--star-y", "0px");
            hero.style.setProperty("--moon-x", "0px");
            hero.style.setProperty("--moon-y", "0px");
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
