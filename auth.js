// Versión simplificada de autenticación para Netlify
const users_local = JSON.parse(localStorage.getItem("users_database")) || {};
let currentUser = localStorage.getItem("current_user");

// Inicializar aplicación
document.addEventListener("DOMContentLoaded", function () {
    if (currentUser) {
        // Usuario ya logueado, ir al dashboard
        window.location.href = "dashboard.html";
        return;
    }

    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Formulario de login
    document
        .getElementById("loginForm")
        .addEventListener("submit", handleLogin);

    // Formulario de registro
    document
        .getElementById("registerForm")
        .addEventListener("submit", handleRegister);

    // Formulario de datos iniciales
    const initialForm = document.getElementById("initialDataForm");
    if (initialForm) {
        initialForm.addEventListener("submit", handleInitialData);
    }
}

// Manejar login
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");

    const userData = users_local[username];

    if (userData && userData.password === password) {
        localStorage.setItem("current_user", username);
        showMessage("¡Bienvenido! Iniciando sesión...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    } else {
        showMessage("Usuario o contraseña incorrectos", "error");
    }
}

// Manejar registro
async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    if (users_local[username]) {
        showMessage("El usuario ya existe", "error");
        return;
    }

    // Crear nuevo usuario
    users_local[username] = {
        username: username,
        email: email,
        password: password,
        hasPersonalData: false,
    };

    // Guardar en localStorage
    localStorage.setItem("users_database", JSON.stringify(users_local));
    localStorage.setItem("current_user", username);

    showMessage("¡Cuenta creada exitosamente!", "success");

    setTimeout(() => {
        showInitialDataForm();
    }, 1500);
}

// Manejar datos iniciales
async function handleInitialData(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Guardar datos personales
    localStorage.setItem("personal_data_local", JSON.stringify(data));

    // Guardar datos de padres si existen
    const parentsData = {};
    const parentsFields = [
        "padre_nombre",
        "padre_edad",
        "padre_ocupacion",
        "padre_lugar_nacimiento",
        "padre_numero",
        "madre_nombre",
        "madre_edad",
        "madre_ocupacion",
        "madre_lugar_nacimiento",
        "madre_numero",
    ];

    let hasParentsData = false;
    parentsFields.forEach((field) => {
        if (data[field]) {
            parentsData[field] = data[field];
            hasParentsData = true;
        }
    });

    if (hasParentsData) {
        localStorage.setItem("parents_data_local", JSON.stringify(parentsData));
    }

    // Actualizar usuario
    const currentUsername = localStorage.getItem("current_user");
    if (users_local[currentUsername]) {
        users_local[currentUsername].hasPersonalData = true;
        localStorage.setItem("users_database", JSON.stringify(users_local));
    }

    showMessage("¡Datos guardados exitosamente! Redirigiendo...", "success");

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 2000);
}

// Cambiar a formulario de registro
function switchToRegister() {
    document.getElementById("login-form").classList.remove("active");
    document.getElementById("register-form").classList.add("active");
}

// Cambiar a formulario de login
function switchToLogin() {
    document.getElementById("register-form").classList.remove("active");
    document.getElementById("login-form").classList.add("active");
}

// Mostrar formulario de datos iniciales
function showInitialDataForm() {
    document.querySelector(".auth-card").style.display = "none";
    document.getElementById("initial-data-form").classList.remove("hidden");
}

// Saltar datos iniciales
function skipInitialData() {
    if (
        confirm(
            "¿Estás seguro? Podrás completar tus datos más tarde en la configuración."
        )
    ) {
        window.location.href = "dashboard.html";
    }
}

// Mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add("show");
    }, 10);

    setTimeout(() => {
        messageDiv.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}
