let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const indicators = document.querySelectorAll(".indicator");
const totalItems = items.length;
let autoSlideInterval;

// Asegurar que la página siempre inicie desde arriba
window.addEventListener("beforeunload", function () {
    window.scrollTo(0, 0);
});

window.addEventListener("load", function () {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

// También al cargar el DOM
document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

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
    const parentsSection = document.getElementById("parents-data");

    navbar.classList.toggle("hidden");
    personalSection.classList.toggle("visible");

    // Asegurarse de que la sección de padres esté oculta y sin clases adicionales
    parentsSection.classList.remove("visible", "slide-up");
    personalSection.classList.remove("slide-up");
}

// Función para mostrar la sección de padres
function showParentsSection() {
    const personalSection = document.getElementById("personal-data");
    const parentsSection = document.getElementById("parents-data");

    // Hacer que la sección personal se deslice hacia arriba
    personalSection.classList.add("slide-up");
    personalSection.classList.remove("visible");

    // Después de un pequeño delay, mostrar la sección de padres
    setTimeout(() => {
        parentsSection.classList.add("visible");
        parentsSection.classList.remove("slide-up");
    }, 400);
}

// Función para alternar la sección de padres (volver a la personal)
function toggleParentsSection() {
    const personalSection = document.getElementById("personal-data");
    const parentsSection = document.getElementById("parents-data");

    // Hacer que la sección de padres se deslice hacia arriba
    parentsSection.classList.add("slide-up");
    parentsSection.classList.remove("visible");

    // Después de un pequeño delay, mostrar la sección personal
    setTimeout(() => {
        personalSection.classList.add("visible");
        personalSection.classList.remove("slide-up");
    }, 400);
}

// Inicializar el carrusel
showSlide(currentIndex);
startAutoSlide();

// Función para copiar texto al portapapeles
function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(function () {
            // Mostrar notificación de copiado
            showCopyNotification();
        })
        .catch(function (err) {
            console.error("Error al copiar: ", err);
            // Fallback para navegadores que no soportan clipboard API
            fallbackCopyTextToClipboard(text);
        });
}

// Fallback para navegadores antiguos
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand("copy");
        if (successful) {
            showCopyNotification();
        }
    } catch (err) {
        console.error("Fallback: Error al copiar", err);
    }
    document.body.removeChild(textArea);
}

// Mostrar notificación de copiado
function showCopyNotification() {
    // Crear elemento de notificación
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = "📋 Número copiado";
    document.body.appendChild(notification);

    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    // Ocultar notificación después de 2 segundos
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Agregar event listeners para números de teléfono cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    // Función para agregar click listeners a los números
    function addPhoneClickListeners() {
        const phoneNumbers = document.querySelectorAll(".phone-number");
        phoneNumbers.forEach((element) => {
            element.addEventListener("click", function () {
                const phoneNumber = this.getAttribute("data-phone");
                copyToClipboard(phoneNumber);
            });
        });
    }

    // Agregar listeners inicialmente
    addPhoneClickListeners();

    // También agregar listeners cuando se cambie de sección
    const originalShowParentsSection = window.showParentsSection;
    const originalToggleParentsSection = window.toggleParentsSection;

    if (originalShowParentsSection) {
        window.showParentsSection = function () {
            originalShowParentsSection();
            setTimeout(addPhoneClickListeners, 500);
        };
    }

    if (originalToggleParentsSection) {
        window.toggleParentsSection = function () {
            originalToggleParentsSection();
            setTimeout(addPhoneClickListeners, 500);
        };
    }
});
