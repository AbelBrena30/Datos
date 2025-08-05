let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const indicators = document.querySelectorAll(".indicator");
const totalItems = items.length;
let autoSlideInterval;

function showSlide(index) {
    items.forEach((item, i) => {
        item.classList.remove("active", "prev", "next");

        // Elemento activo (centro)
        if (i === index) {
            item.classList.add("active");
        }
        // Elemento anterior (izquierda)
        else if (i === (index - 1 + totalItems) % totalItems) {
            item.classList.add("prev");
        }
        // Elemento siguiente (derecha)
        else if (i === (index + 1) % totalItems) {
            item.classList.add("next");
        }
    });

    // Actualizar indicadores
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === index);
    });
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 10000);
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalItems;
    showSlide(currentIndex);
}

function previousSlide() {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    showSlide(currentIndex);
    startAutoSlide();
}

function currentSlide(index) {
    currentIndex = index - 1;
    showSlide(currentIndex);
    startAutoSlide();
}

function nextSlideManual() {
    nextSlide();
    startAutoSlide();
}

// Función para alternar entre navbar y sección personal
function toggleSection() {
    const navbar = document.getElementById("navbar");
    const personalSection = document.getElementById("personal-data");

    navbar.classList.toggle("hidden");
    personalSection.classList.toggle("visible");
}

// Inicializar el carrusel
showSlide(currentIndex);
startAutoSlide();
