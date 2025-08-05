const API_BASE = "http://localhost:3000/api";

// Estado de autenticación
let authState = {
    token: localStorage.getItem("token"),
    user: null,
    isAuthenticated: false,
};

// Inicializar aplicación
document.addEventListener("DOMContentLoaded", function () {
    if (authState.token) {
        verifyToken();
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
    document
        .getElementById("initialDataForm")
        .addEventListener("submit", handleInitialData);
}

// Verificar token existente
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/verify-token`, {
            headers: {
                Authorization: `Bearer ${authState.token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            authState.user = data.user;
            authState.isAuthenticated = true;

            if (data.hasPersonalData) {
                // Usuario tiene datos, redirigir a la app
                window.location.href = "dashboard.html";
            } else {
                // Usuario nuevo, mostrar formulario de datos iniciales
                showInitialDataForm();
            }
        } else {
            // Token inválido
            localStorage.removeItem("token");
            authState.token = null;
        }
    } catch (error) {
        console.error("Error verificando token:", error);
        localStorage.removeItem("token");
        authState.token = null;
    }
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const credentials = {
        username: formData.get("username"),
        password: formData.get("password"),
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
            // Login exitoso
            authState.token = data.token;
            authState.user = data.user;
            authState.isAuthenticated = true;

            localStorage.setItem("token", data.token);

            showMessage("¡Bienvenido! Iniciando sesión...", "success");

            setTimeout(() => {
                if (data.hasPersonalData) {
                    window.location.href = "dashboard.html";
                } else {
                    showInitialDataForm();
                }
            }, 1500);
        } else {
            showMessage(data.error || "Error al iniciar sesión", "error");
        }
    } catch (error) {
        showMessage("Error de conexión. Intenta nuevamente.", "error");
    } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    };

    // Validar contraseñas
    if (userData.password !== userData.confirmPassword) {
        showMessage("Las contraseñas no coinciden", "error");
        return;
    }

    if (userData.password.length < 6) {
        showMessage("La contraseña debe tener al menos 6 caracteres", "error");
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Registro exitoso
            authState.token = data.token;
            authState.user = data.user;
            authState.isAuthenticated = true;

            localStorage.setItem("token", data.token);

            showMessage("¡Cuenta creada exitosamente!", "success");

            setTimeout(() => {
                showInitialDataForm();
            }, 1500);
        } else {
            showMessage(data.error || "Error al crear la cuenta", "error");
        }
    } catch (error) {
        showMessage("Error de conexión. Intenta nuevamente.", "error");
    } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
    }
}

// Manejar datos iniciales
async function handleInitialData(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Datos personales
    const personalData = {
        nombre: formData.get("nombre"),
        fecha_nacimiento: formData.get("fecha_nacimiento"),
        edad: parseInt(formData.get("edad")),
        lugar_nacimiento: formData.get("lugar_nacimiento"),
        ocupacion: formData.get("ocupacion"),
        escuela: formData.get("escuela"),
        email: formData.get("email"),
        numero: formData.get("numero"),
        direccion: formData.get("direccion"),
    };

    // Datos de padres
    const parentsData = {
        padre_nombre: formData.get("padre_nombre"),
        padre_edad: formData.get("padre_edad")
            ? parseInt(formData.get("padre_edad"))
            : null,
        padre_ocupacion: formData.get("padre_ocupacion"),
        padre_lugar_nacimiento: formData.get("padre_lugar_nacimiento"),
        padre_numero: formData.get("padre_numero"),
        madre_nombre: formData.get("madre_nombre"),
        madre_edad: formData.get("madre_edad")
            ? parseInt(formData.get("madre_edad"))
            : null,
        madre_ocupacion: formData.get("madre_ocupacion"),
        madre_lugar_nacimiento: formData.get("madre_lugar_nacimiento"),
        madre_numero: formData.get("madre_numero"),
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
        // Guardar datos personales
        const personalResponse = await fetch(`${API_BASE}/personal-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify(personalData),
        });

        if (!personalResponse.ok) {
            throw new Error("Error al guardar datos personales");
        }

        // Guardar datos de padres si se proporcionaron
        if (parentsData.padre_nombre || parentsData.madre_nombre) {
            const parentsResponse = await fetch(`${API_BASE}/parents-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify(parentsData),
            });

            if (!parentsResponse.ok) {
                console.warn(
                    "Error al guardar datos de padres, pero continuando..."
                );
            }
        }

        showMessage(
            "¡Datos guardados exitosamente! Redirigiendo...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
    } catch (error) {
        showMessage("Error al guardar los datos. Intenta nuevamente.", "error");
    } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
    }
}

// Saltar configuración inicial
function skipInitialData() {
    if (
        confirm(
            "¿Estás seguro? Podrás completar tus datos más tarde en la configuración."
        )
    ) {
        window.location.href = "dashboard.html";
    }
}

// Mostrar formulario de datos iniciales
function showInitialDataForm() {
    document.querySelector(".auth-card").style.display = "none";
    document.getElementById("initial-data-form").classList.remove("hidden");
}

// Cambiar entre login y registro
function switchToRegister() {
    document.getElementById("login-form").classList.remove("active");
    document.getElementById("register-form").classList.add("active");
    clearMessage();
}

function switchToLogin() {
    document.getElementById("register-form").classList.remove("active");
    document.getElementById("login-form").classList.add("active");
    clearMessage();
}

// Mostrar mensaje
function showMessage(text, type) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = "block";

    if (type === "success") {
        setTimeout(clearMessage, 5000);
    }
}

// Limpiar mensaje
function clearMessage() {
    const messageEl = document.getElementById("message");
    messageEl.style.display = "none";
    messageEl.textContent = "";
    messageEl.className = "message";
}
