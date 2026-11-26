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
const currentPath = window.location.pathname.replace(/index\\.html$/, "");
document.querySelectorAll(".nav-links a").forEach((link) => {
    const targetPath = new URL(link.href, window.location.origin).pathname;
    if (targetPath === currentPath || (currentPath === "/" && targetPath === "/")) {
        link.setAttribute("aria-current", "page");
    }
});

// Gentle entrance motion. Content remains visible if motion is reduced or the API is unavailable.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
