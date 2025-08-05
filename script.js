// Variables de autenticación y datos
const API_BASE = "http://localhost:3000/api";
let authToken = localStorage.getItem("token");
let userData = {};

let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const indicators = document.querySelectorAll(".indicator");
const totalItems = items.length;
let autoSlideInterval;

// Verificar autenticación y cargar datos al iniciar
document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Verificar autenticación
    if (!authToken) {
        window.location.href = "/";
        return;
    }

    // Cargar datos del usuario
    loadUserData();
});

// Cargar datos del usuario desde la base de datos
async function loadUserData() {
    try {
        // Cargar datos personales
        const personalResponse = await fetch(`${API_BASE}/personal-data`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (personalResponse.ok) {
            const personalData = await personalResponse.json();
            if (personalData && personalData.nombre) {
                updatePersonalDataUI(personalData);
            }
        }

        // Cargar datos de padres
        const parentsResponse = await fetch(`${API_BASE}/parents-data`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (parentsResponse.ok) {
            const parentsData = await parentsResponse.json();
            if (
                parentsData &&
                (parentsData.padre_nombre || parentsData.madre_nombre)
            ) {
                updateParentsDataUI(parentsData);
            }
        }
    } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        // Si hay error de autenticación, redirigir al login
        if (error.message.includes("401") || error.message.includes("403")) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
    }
}

// Actualizar la interfaz con datos personales
function updatePersonalDataUI(data) {
    // Actualizar carrusel
    const carouselItems = document.querySelectorAll(".carousel-item");
    if (carouselItems[0]) {
        const nameElement = carouselItems[0].querySelector("h1");
        if (nameElement)
            nameElement.innerHTML = data.nombre.replace(" ", "<br />");
    }

    if (carouselItems[2]) {
        const phoneElement = carouselItems[2].querySelector("h1");
        if (phoneElement && data.numero) {
            phoneElement.textContent = data.numero;
            phoneElement.setAttribute("data-phone", data.numero);
        }
    }

    // Actualizar sección de datos personales
    const dataItems = document.querySelectorAll("#personal-data .data-item");
    dataItems.forEach((item) => {
        const label = item.querySelector("h3").textContent.toLowerCase();
        const valueElement = item.querySelector("p");

        switch (label) {
            case "nombre":
                if (data.nombre) valueElement.textContent = data.nombre;
                break;
            case "fecha de nacimiento":
                if (data.fecha_nacimiento)
                    valueElement.textContent = formatDate(
                        data.fecha_nacimiento
                    );
                break;
            case "edad":
                if (data.edad) valueElement.textContent = data.edad + " años";
                break;
            case "lugar de nacimiento":
                if (data.lugar_nacimiento)
                    valueElement.textContent = data.lugar_nacimiento;
                break;
            case "ocupación":
                if (data.ocupacion) valueElement.textContent = data.ocupacion;
                break;
            case "escuela":
                if (data.escuela) valueElement.textContent = data.escuela;
                break;
            case "email":
                if (data.email) valueElement.textContent = data.email;
                break;
            case "numero":
                if (data.numero) {
                    valueElement.textContent = data.numero;
                    valueElement.setAttribute("data-phone", data.numero);
                }
                break;
            case "dirección":
                if (data.direccion) valueElement.textContent = data.direccion;
                break;
        }
    });
}

// Actualizar la interfaz con datos de padres
function updateParentsDataUI(data) {
    // Actualizar datos del padre
    if (data.padre_nombre) {
        const padreSection = document.querySelector(
            ".parent-section:first-child .data-grid"
        );
        updateParentData(padreSection, {
            nombre: data.padre_nombre,
            edad: data.padre_edad,
            ocupacion: data.padre_ocupacion,
            lugar_nacimiento: data.padre_lugar_nacimiento,
            numero: data.padre_numero,
        });
    }

    // Actualizar datos de la madre
    if (data.madre_nombre) {
        const madreSection = document.querySelector(
            ".parent-section:last-child .data-grid"
        );
        updateParentData(madreSection, {
            nombre: data.madre_nombre,
            edad: data.madre_edad,
            ocupacion: data.madre_ocupacion,
            lugar_nacimiento: data.madre_lugar_nacimiento,
            numero: data.madre_numero,
        });
    }
}

// Actualizar datos de un padre/madre específico
function updateParentData(section, data) {
    const dataItems = section.querySelectorAll(".data-item");
    dataItems.forEach((item) => {
        const label = item.querySelector("h3").textContent.toLowerCase();
        const valueElement = item.querySelector("p");

        switch (label) {
            case "nombre":
                if (data.nombre) valueElement.textContent = data.nombre;
                break;
            case "edad":
                if (data.edad) valueElement.textContent = data.edad;
                break;
            case "ocupación":
                if (data.ocupacion) valueElement.textContent = data.ocupacion;
                break;
            case "lugar de nacimiento":
                if (data.lugar_nacimiento)
                    valueElement.textContent = data.lugar_nacimiento;
                break;
            case "numero":
                if (data.numero) {
                    valueElement.textContent = data.numero;
                    valueElement.setAttribute("data-phone", data.numero);
                    valueElement.classList.add("phone-number");
                }
                break;
        }
    });
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Función para cerrar sesión
function logout() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        localStorage.removeItem("token");
        window.location.href = "/";
    }
}

// Función para toggle del menú de usuario
function toggleUserMenu() {
    const dropdown = document.getElementById("userMenuDropdown");
    dropdown.classList.toggle("show");
}

// Función para editar perfil
function editProfile() {
    alert(
        "Funcionalidad de edición en desarrollo. Por ahora puedes crear una nueva cuenta."
    );
    toggleUserMenu();
}

// Cerrar menú si se hace clic fuera
document.addEventListener("click", function (event) {
    const userMenu = document.querySelector(".user-menu");
    if (!userMenu.contains(event.target)) {
        document.getElementById("userMenuDropdown").classList.remove("show");
    }
});

// Actualizar nombre de usuario en el menú
function updateUserMenu(username) {
    const currentUserElement = document.getElementById("currentUser");
    if (currentUserElement && username) {
        currentUserElement.textContent = username;
    }
}

// Asegurar que la página siempre inicie desde arriba
window.addEventListener("beforeunload", function () {
    window.scrollTo(0, 0);
});

window.addEventListener("load", function () {
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
