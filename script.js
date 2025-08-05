// Variables de autenticación y datos
const API_BASE = "http://localhost:3000/api"; // Solo para desarrollo local
let authToken = localStorage.getItem("token");
let userData = {};
let isLoadingData = false;
let isGitHubPagesMode = true; // Siempre en modo GitHub Pages

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
    CLIENT_ID:
        "1087207166556-9o8mgr8b1j4o8b3oh8h9r9q1q9q1q9q1.apps.googleusercontent.com", // Necesitas crear tu propio Client ID
    API_KEY: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Necesitas crear tu propia API Key
    DISCOVERY_DOC: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    SCOPES: "https://www.googleapis.com/auth/drive.file",
};

let gapi_loaded = false;
let google_drive_authorized = false;

let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const indicators = document.querySelectorAll(".indicator");
const totalItems = items.length;
let autoSlideInterval;

// Función para generar y descargar archivo .txt con datos del usuario
function downloadUserDataTXT(username) {
    const personalData =
        JSON.parse(localStorage.getItem("personal_data_local")) || {};
    const parentsData =
        JSON.parse(localStorage.getItem("parents_data_local")) || {};

    let txtContent = `DATOS PERSONALES DE ${
        username ? username.toUpperCase() : "USUARIO"
    }\n`;
    txtContent += `=====================================================\n\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleString(
        "es-ES"
    )}\n\n`;

    // Datos personales
    txtContent += `INFORMACIÓN PERSONAL\n`;
    txtContent += `--------------------\n`;
    txtContent += `Nombre: ${personalData.name || "No especificado"}\n`;
    txtContent += `Email: ${personalData.email || "No especificado"}\n`;
    txtContent += `Fecha de nacimiento: ${
        personalData.birthdate || "No especificado"
    }\n`;
    txtContent += `Edad: ${personalData.age || "No especificado"}\n`;
    txtContent += `Lugar de nacimiento: ${
        personalData.birthplace || "No especificado"
    }\n`;
    txtContent += `Ocupación: ${
        personalData.occupation || "No especificado"
    }\n`;
    txtContent += `Escuela: ${personalData.school || "No especificado"}\n`;
    txtContent += `Teléfono: ${personalData.phone || "No especificado"}\n`;
    txtContent += `Dirección: ${personalData.address || "No especificado"}\n\n`;

    // Datos de los padres
    txtContent += `INFORMACIÓN DE LOS PADRES\n`;
    txtContent += `-------------------------\n`;

    // Padre
    txtContent += `PADRE:\n`;
    txtContent += `  Nombre: ${parentsData.fatherName || "No especificado"}\n`;
    txtContent += `  Edad: ${parentsData.fatherAge || "No especificado"}\n`;
    txtContent += `  Ocupación: ${
        parentsData.fatherOccupation || "No especificado"
    }\n`;
    txtContent += `  Lugar de nacimiento: ${
        parentsData.fatherBirthplace || "No especificado"
    }\n`;
    txtContent += `  Teléfono: ${
        parentsData.fatherPhone || "No especificado"
    }\n\n`;

    // Madre
    txtContent += `MADRE:\n`;
    txtContent += `  Nombre: ${parentsData.motherName || "No especificado"}\n`;
    txtContent += `  Edad: ${parentsData.motherAge || "No especificado"}\n`;
    txtContent += `  Ocupación: ${
        parentsData.motherOccupation || "No especificado"
    }\n`;
    txtContent += `  Lugar de nacimiento: ${
        parentsData.motherBirthplace || "No especificado"
    }\n`;
    txtContent += `  Teléfono: ${
        parentsData.motherPhone || "No especificado"
    }\n\n`;

    txtContent += `=====================================================\n`;
    txtContent += `Este archivo fue generado automáticamente por el sistema\n`;
    txtContent += `de gestión de datos personales.`;

    const fileName = `datos_${username || "usuario"}_${new Date()
        .toISOString()
        .slice(0, 10)}.txt`;

    // Intentar guardar en Google Drive automáticamente
    saveToGoogleDriveOrLocal(txtContent, fileName);
}

// Función para guardar en Google Drive o localmente como fallback
async function saveToGoogleDriveOrLocal(txtContent, fileName) {
    try {
        // Verificar si Google Drive está disponible y autorizado
        if (window.gapi && gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance && authInstance.isSignedIn.get()) {
                console.log("Guardando en Google Drive...");
                await uploadToGoogleDrive(txtContent, fileName);
                showMessage(
                    `☁️ Archivo guardado en Google Drive: ${fileName}`,
                    "success"
                );
                return;
            }
        }

        // Si Google Drive no está disponible, guardar localmente
        console.log("Google Drive no disponible, descargando localmente...");
        downloadFileLocally(txtContent, fileName);
    } catch (error) {
        console.log("Error guardando en Google Drive:", error);
        // Fallback a descarga local
        downloadFileLocally(txtContent, fileName);
    }
}

// Función para descargar archivo localmente (método original)
function downloadFileLocally(txtContent, fileName) {
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showMessage(`📄 Archivo descargado: ${fileName}`, "success");
}

// Inicializar Google Drive API automáticamente
async function initializeGoogleDrive() {
    try {
        console.log("Inicializando Google Drive API...");

        if (!window.gapi) {
            console.log("Cargando Google API...");
            await loadGoogleAPI();
        }

        await new Promise((resolve) => {
            gapi.load("auth2", resolve);
        });

        await gapi.auth2.init({
            client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
        });

        const authInstance = gapi.auth2.getAuthInstance();

        // Intentar autenticación silenciosa primero
        let isSignedIn = authInstance.isSignedIn.get();

        if (!isSignedIn) {
            console.log("Autenticando con Google Drive...");
            try {
                await authInstance.signIn({ prompt: "none" }); // Intento silencioso
            } catch (error) {
                // Si falla el intento silencioso, hacer login normal
                await authInstance.signIn();
            }
        }

        console.log("✅ Google Drive conectado exitosamente");
        showMessage("☁️ Google Drive conectado", "success");
        return true;

        google_drive_authorized = true;
        showMessage("✅ Conectado a Google Drive", "success");
    } catch (error) {
        console.error("Error al inicializar Google Drive:", error);
        showMessage("❌ Error al conectar con Google Drive", "error");
        google_drive_authorized = false;
    }
}

// Cargar Google API
function loadGoogleAPI() {
    return new Promise((resolve, reject) => {
        if (typeof gapi !== "undefined") {
            gapi_loaded = true;
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
            gapi.load("client:auth2", async () => {
                try {
                    await gapi.client.init({
                        apiKey: GOOGLE_DRIVE_CONFIG.API_KEY,
                        clientId: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
                        discoveryDocs: [GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC],
                        scope: GOOGLE_DRIVE_CONFIG.SCOPES,
                    });
                    gapi_loaded = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Subir archivo a Google Drive
async function uploadToGoogleDrive(content, fileName) {
    try {
        showMessage("☁️ Subiendo archivo a Google Drive...", "success");

        const boundary = "-------314159265358979323846";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const metadata = {
            name: fileName,
            parents: [], // Se guardará en la raíz de Drive
        };

        const multipartRequestBody =
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: text/plain\r\n\r\n" +
            content +
            close_delim;

        const request = gapi.client.request({
            path: "https://www.googleapis.com/upload/drive/v3/files",
            method: "POST",
            params: { uploadType: "multipart" },
            headers: {
                "Content-Type":
                    'multipart/related; boundary="' + boundary + '"',
            },
            body: multipartRequestBody,
        });

        const response = await request;

        if (response.status === 200) {
            showMessage(
                "✅ Archivo guardado en Google Drive exitosamente",
                "success"
            );

            // También descargar localmente como respaldo
            downloadFileLocally(content, fileName);
        } else {
            throw new Error("Error al subir archivo");
        }
    } catch (error) {
        console.error("Error al subir a Google Drive:", error);
        showMessage(
            "❌ Error al guardar en Google Drive. Descargando localmente...",
            "error"
        );
        downloadFileLocally(content, fileName);
    }
}

// Función para cerrar sesión
function logout() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        console.log("Cerrando sesión...");
        localStorage.removeItem("token");
        authToken = null;

        // Redirigir a la página de login
        window.location.href = "index.html";
    }
}

// Verificar autenticación y cargar datos al iniciar
document.addEventListener("DOMContentLoaded", function () {
    console.log("Página cargada");

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // En GitHub Pages, siempre usar modo estático con datos locales
    if (isGitHubPagesMode) {
        initializeGitHubPagesMode();
        return;
    }

    // Si no hay token, permitir modo estático pero mostrar mensaje
    if (!authToken) {
        console.log("No hay token de autenticación");
        initializeStaticMode();
        return;
    }

    // Verificar token y cargar usuario
    verifyTokenAndLoadUser();

    // Inicializar en modo estático por defecto
    initializeStaticMode();

    // Si hay token, intentar cargar datos del servidor
    if (authToken && !isLoadingData) {
        console.log("Token encontrado, intentando conectar al servidor...");
        loadUserData().catch(() => {
            console.log("Servidor no disponible, continuando en modo estático");
        });
    }
});

// Modo estático (sin autenticación)
function initializeStaticMode() {
    console.log("Inicializando modo estático");
    // Inicializar carrusel con datos por defecto
    showSlide(currentIndex);
    startAutoSlide();

    // Configurar listeners para números de teléfono
    setTimeout(() => {
        addPhoneClickListeners();
    }, 100);
}

// Modo GitHub Pages (con datos locales persistentes y Google Drive)
function initializeGitHubPagesMode() {
    console.log("Inicializando modo GitHub Pages");

    // Cargar datos guardados localmente
    loadLocalData();

    // Inicializar carrusel
    showSlide(currentIndex);
    startAutoSlide();

    // Configurar listeners para números de teléfono
    setTimeout(() => {
        addPhoneClickListeners();
    }, 100);

    // Mostrar usuario en el menú
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
        updateUserMenu(savedUser);
    }

    // Inicializar Google Drive automáticamente después de cargar todo
    setTimeout(() => {
        initializeGoogleDrive().catch((error) => {
            console.log("Google Drive no disponible:", error);
            showMessage(
                "⚠️ Google Drive no conectado - usando solo descarga local",
                "error"
            );
        });
    }, 2000);
}

// Cargar datos locales guardados
function loadLocalData() {
    try {
        // Cargar datos personales
        const personalData = localStorage.getItem("personal_data_local");
        if (personalData) {
            const data = JSON.parse(personalData);
            updatePersonalDataUI(data);
        }

        // Cargar datos de padres
        const parentsData = localStorage.getItem("parents_data_local");
        if (parentsData) {
            const data = JSON.parse(parentsData);
            updateParentsDataUI(data);
        }
    } catch (error) {
        console.log("Error cargando datos locales:", error);
    }
}

// Cargar datos del usuario desde la base de datos
async function loadUserData() {
    if (isLoadingData) {
        console.log("Ya se están cargando los datos...");
        return;
    }

    isLoadingData = true;
    console.log("Intentando cargar datos del servidor...");

    try {
        // Timeout corto para no bloquear la interfaz
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Cargar datos personales
        const personalResponse = await fetch(`${API_BASE}/personal-data`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (personalResponse.ok) {
            const personalData = await personalResponse.json();
            if (personalData && personalData.nombre) {
                console.log("Datos personales cargados del servidor");
                updatePersonalDataUI(personalData);
            }
        } else if (
            personalResponse.status === 401 ||
            personalResponse.status === 403
        ) {
            console.log("Token inválido - limpiando token");
            localStorage.removeItem("token");
            authToken = null;
        }

        // Cargar datos de padres (sin bloquear si falla)
        try {
            const parentsResponse = await fetch(`${API_BASE}/parents-data`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                signal: controller.signal,
            });

            if (parentsResponse.ok) {
                const parentsData = await parentsResponse.json();
                if (
                    parentsData &&
                    (parentsData.padre_nombre || parentsData.madre_nombre)
                ) {
                    console.log("Datos de padres cargados del servidor");
                    updateParentsDataUI(parentsData);
                }
            }
        } catch (parentsError) {
            console.log("No se pudieron cargar datos de padres del servidor");
        }
    } catch (error) {
        if (error.name === "AbortError") {
            console.log(
                "Timeout conectando al servidor - continuando en modo estático"
            );
        } else {
            console.log("Error de conexión al servidor:", error.message);
        }
    } finally {
        isLoadingData = false;
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
        // Limpiar toda la sesión y caché
        localStorage.clear();
        sessionStorage.clear();

        // Limpiar caché del navegador si es posible
        if ("caches" in window) {
            caches.keys().then(function (names) {
                for (let name of names) caches.delete(name);
            });
        }

        // Redirigir a login
        window.location.href = "index.html";
    }
}

// Función para descargar datos del usuario manualmente
function downloadMyData() {
    const currentUser = localStorage.getItem("current_user");
    if (currentUser) {
        downloadUserDataTXT(currentUser);
        toggleUserMenu(); // Cerrar el menú
    } else {
        showMessage("❌ No se pudo identificar el usuario", "error");
    }
}

// Función para conectar/desconectar Google Drive
async function toggleGoogleDrive() {
    const driveBtn = document.getElementById("driveBtn");

    if (google_drive_authorized) {
        // Desconectar
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            google_drive_authorized = false;
            driveBtn.innerHTML = "☁️ Conectar Google Drive";
            showMessage("🔌 Desconectado de Google Drive", "success");
        } catch (error) {
            showMessage("❌ Error al desconectar", "error");
        }
    } else {
        // Conectar
        try {
            await initializeGoogleDrive();
            if (google_drive_authorized) {
                driveBtn.innerHTML = "☁️ Desconectar Google Drive";
            }
        } catch (error) {
            showMessage("❌ Error al conectar con Google Drive", "error");
        }
    }

    toggleUserMenu(); // Cerrar el menú
}

// Función para toggle del menú de usuario
function toggleUserMenu() {
    const dropdown = document.getElementById("userMenuDropdown");
    dropdown.classList.toggle("show");
}

// Función para editar perfil
function editProfile() {
    if (!authToken) {
        alert("Necesitas iniciar sesión para editar tu perfil.");
        window.location.href = "index.html";
        return;
    }

    // Crear modal de edición
    createEditModal();
    toggleUserMenu();
}

// Crear modal de edición de datos
function createEditModal() {
    // Verificar si ya existe el modal
    let modal = document.getElementById("editModal");
    if (modal) {
        modal.style.display = "flex";
        return;
    }

    // Crear modal
    modal = document.createElement("div");
    modal.id = "editModal";
    modal.className = "edit-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Editar Datos</h2>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-tabs">
                <button class="tab-btn active" onclick="switchTab('personal')">Datos Personales</button>
                <button class="tab-btn" onclick="switchTab('parents')">Datos de Padres</button>
            </div>
            
            <!-- Formulario de datos personales -->
            <form id="editForm" class="edit-form tab-content active">
                <div class="form-group">
                    <label for="editNombre">Nombre Completo:</label>
                    <input type="text" id="editNombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="editFechaNacimiento">Fecha de Nacimiento:</label>
                    <input type="date" id="editFechaNacimiento" name="fecha_nacimiento">
                </div>
                <div class="form-group">
                    <label for="editEdad">Edad:</label>
                    <input type="number" id="editEdad" name="edad" min="1" max="120">
                </div>
                <div class="form-group">
                    <label for="editLugarNacimiento">Lugar de Nacimiento:</label>
                    <input type="text" id="editLugarNacimiento" name="lugar_nacimiento">
                </div>
                <div class="form-group">
                    <label for="editOcupacion">Ocupación:</label>
                    <input type="text" id="editOcupacion" name="ocupacion">
                </div>
                <div class="form-group">
                    <label for="editEscuela">Escuela/Institución:</label>
                    <input type="text" id="editEscuela" name="escuela">
                </div>
                <div class="form-group">
                    <label for="editEmail">Email:</label>
                    <input type="email" id="editEmail" name="email">
                </div>
                <div class="form-group">
                    <label for="editNumero">Número de Teléfono:</label>
                    <input type="tel" id="editNumero" name="numero">
                </div>
                <div class="form-group">
                    <label for="editDireccion">Dirección:</label>
                    <textarea id="editDireccion" name="direccion" rows="3"></textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Guardar Cambios</button>
                    <button type="button" class="cancel-btn" onclick="closeEditModal()">Cancelar</button>
                </div>
            </form>

            <!-- Formulario de datos de padres -->
            <form id="editParentsForm" class="edit-form tab-content">
                <div class="parents-edit-container">
                    <div class="parent-edit-section">
                        <h3>Datos del Padre</h3>
                        <div class="form-group">
                            <label for="editPadreNombre">Nombre Completo:</label>
                            <input type="text" id="editPadreNombre" name="padre_nombre">
                        </div>
                        <div class="form-group">
                            <label for="editPadreEdad">Edad:</label>
                            <input type="number" id="editPadreEdad" name="padre_edad" min="1" max="120">
                        </div>
                        <div class="form-group">
                            <label for="editPadreOcupacion">Ocupación:</label>
                            <input type="text" id="editPadreOcupacion" name="padre_ocupacion">
                        </div>
                        <div class="form-group">
                            <label for="editPadreLugarNacimiento">Lugar de Nacimiento:</label>
                            <input type="text" id="editPadreLugarNacimiento" name="padre_lugar_nacimiento">
                        </div>
                        <div class="form-group">
                            <label for="editPadreNumero">Número de Teléfono:</label>
                            <input type="tel" id="editPadreNumero" name="padre_numero">
                        </div>
                    </div>

                    <div class="parent-edit-section">
                        <h3>Datos de la Madre</h3>
                        <div class="form-group">
                            <label for="editMadreNombre">Nombre Completo:</label>
                            <input type="text" id="editMadreNombre" name="madre_nombre">
                        </div>
                        <div class="form-group">
                            <label for="editMadreEdad">Edad:</label>
                            <input type="number" id="editMadreEdad" name="madre_edad" min="1" max="120">
                        </div>
                        <div class="form-group">
                            <label for="editMadreOcupacion">Ocupación:</label>
                            <input type="text" id="editMadreOcupacion" name="madre_ocupacion">
                        </div>
                        <div class="form-group">
                            <label for="editMadreLugarNacimiento">Lugar de Nacimiento:</label>
                            <input type="text" id="editMadreLugarNacimiento" name="madre_lugar_nacimiento">
                        </div>
                        <div class="form-group">
                            <label for="editMadreNumero">Número de Teléfono:</label>
                            <input type="tel" id="editMadreNumero" name="madre_numero">
                        </div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Guardar Cambios</button>
                    <button type="button" class="cancel-btn" onclick="closeEditModal()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Cargar datos actuales en el formulario
    loadCurrentDataIntoForm();
    loadCurrentParentsDataIntoForm();

    // Configurar eventos de envío
    document
        .getElementById("editForm")
        .addEventListener("submit", handleEditSubmit);
    document
        .getElementById("editParentsForm")
        .addEventListener("submit", handleParentsEditSubmit);

    // Mostrar modal
    modal.style.display = "flex";
}

// Cargar datos actuales en el formulario de edición
function loadCurrentDataIntoForm() {
    // Obtener datos actuales de la UI
    const dataItems = document.querySelectorAll("#personal-data .data-item");

    dataItems.forEach((item) => {
        const label = item.querySelector("h3").textContent.toLowerCase();
        const value = item.querySelector("p").textContent;

        switch (label) {
            case "nombre":
                document.getElementById("editNombre").value =
                    value !== "Tu Nombre Completo" ? value : "";
                break;
            case "fecha de nacimiento":
                if (value !== "DD/MM/AAAA") {
                    // Convertir DD/MM/AAAA a AAAA-MM-DD para el input date
                    const parts = value.split("/");
                    if (parts.length === 3) {
                        document.getElementById(
                            "editFechaNacimiento"
                        ).value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }
                break;
            case "edad":
                const edad = value.replace(" años", "");
                document.getElementById("editEdad").value =
                    edad !== "Tu edad" ? edad : "";
                break;
            case "lugar de nacimiento":
                document.getElementById("editLugarNacimiento").value =
                    value !== "Tu lugar de nacimiento" ? value : "";
                break;
            case "ocupación":
                document.getElementById("editOcupacion").value =
                    value !== "Tu ocupación" ? value : "";
                break;
            case "escuela":
                document.getElementById("editEscuela").value =
                    value !== "Tu escuela o institución" ? value : "";
                break;
            case "email":
                document.getElementById("editEmail").value =
                    value !== "tu@email.com" ? value : "";
                break;
            case "numero":
                document.getElementById("editNumero").value =
                    value !== "Tu número de teléfono" ? value : "";
                break;
            case "dirección":
                document.getElementById("editDireccion").value =
                    value !== "Tu dirección completa" ? value : "";
                break;
        }
    });
}

// Función para cambiar entre pestañas del modal
function switchTab(tabName) {
    // Remover clase active de todos los botones y contenidos
    document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
    document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

    // Activar el botón y contenido correspondiente
    event.target.classList.add("active");
    if (tabName === "personal") {
        document.getElementById("editForm").classList.add("active");
    } else if (tabName === "parents") {
        document.getElementById("editParentsForm").classList.add("active");
    }
}

// Cargar datos actuales de padres en el formulario de edición
function loadCurrentParentsDataIntoForm() {
    try {
        // Obtener datos del padre
        const padreSection = document.querySelector(
            ".parent-section:first-child .data-grid"
        );
        if (padreSection) {
            const padreData = extractParentData(padreSection);
            document.getElementById("editPadreNombre").value =
                padreData.nombre !== "Nombre del padre" ? padreData.nombre : "";
            document.getElementById("editPadreEdad").value =
                padreData.edad !== "Edad" ? padreData.edad : "";
            document.getElementById("editPadreOcupacion").value =
                padreData.ocupacion !== "Ocupación" ? padreData.ocupacion : "";
            document.getElementById("editPadreLugarNacimiento").value =
                padreData.lugar_nacimiento !== "Lugar de nacimiento"
                    ? padreData.lugar_nacimiento
                    : "";
            document.getElementById("editPadreNumero").value =
                padreData.numero !== "Número de teléfono"
                    ? padreData.numero
                    : "";
        }

        // Obtener datos de la madre
        const madreSection = document.querySelector(
            ".parent-section:last-child .data-grid"
        );
        if (madreSection) {
            const madreData = extractParentData(madreSection);
            document.getElementById("editMadreNombre").value =
                madreData.nombre !== "Nombre de la madre"
                    ? madreData.nombre
                    : "";
            document.getElementById("editMadreEdad").value =
                madreData.edad !== "Edad" ? madreData.edad : "";
            document.getElementById("editMadreOcupacion").value =
                madreData.ocupacion !== "Ocupación" ? madreData.ocupacion : "";
            document.getElementById("editMadreLugarNacimiento").value =
                madreData.lugar_nacimiento !== "Lugar de nacimiento"
                    ? madreData.lugar_nacimiento
                    : "";
            document.getElementById("editMadreNumero").value =
                madreData.numero !== "Número de teléfono"
                    ? madreData.numero
                    : "";
        }
    } catch (error) {
        console.log("Error cargando datos de padres:", error);
    }
}

// Extraer datos de una sección de padre/madre
function extractParentData(section) {
    const data = {};
    const dataItems = section.querySelectorAll(".data-item");

    dataItems.forEach((item) => {
        const label = item.querySelector("h3").textContent.toLowerCase();
        const value = item.querySelector("p").textContent;

        switch (label) {
            case "nombre":
                data.nombre = value;
                break;
            case "edad":
                data.edad = value;
                break;
            case "ocupación":
                data.ocupacion = value;
                break;
            case "lugar de nacimiento":
                data.lugar_nacimiento = value;
                break;
            case "numero":
                data.numero = value;
                break;
        }
    });

    return data;
}

// Manejar envío del formulario de edición de padres
async function handleParentsEditSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector(".save-btn");
    const formData = new FormData(form);
    const data = {};

    // Convertir FormData a objeto
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";
    submitBtn.classList.add("loading");

    try {
        // En modo GitHub Pages, guardar localmente
        if (isGitHubPagesMode) {
            localStorage.setItem("parents_data_local", JSON.stringify(data));
            updateParentsDataUI(data);
            showMessage("✅ Datos de padres guardados exitosamente", "success");

            // Descargar archivo automáticamente
            const currentUser = localStorage.getItem("current_user");
            setTimeout(() => {
                downloadUserDataTXT(currentUser);
            }, 1000);

            closeEditModal();

            // Refrescar listeners de teléfonos
            setTimeout(() => {
                addPhoneClickListeners();
            }, 100);
            return;
        }

        // Modo servidor normal
        const response = await fetch(`${API_BASE}/parents-data`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const updatedData = await response.json();
            updateParentsDataUI(updatedData);
            showMessage(
                "✅ Datos de padres actualizados exitosamente",
                "success"
            );
            closeEditModal();

            // Refrescar listeners de teléfonos
            setTimeout(() => {
                addPhoneClickListeners();
            }, 100);
        } else {
            const error = await response.json();
            showMessage(
                "❌ " + (error.error || "Error al actualizar datos de padres"),
                "error"
            );
        }
    } catch (error) {
        console.error("Error:", error);
        // Fallback a modo local si falla la conexión
        localStorage.setItem("parents_data_local", JSON.stringify(data));
        updateParentsDataUI(data);
        showMessage(
            "✅ Datos de padres guardados localmente (sin conexión)",
            "success"
        );
        closeEditModal();

        // Refrescar listeners de teléfonos
        setTimeout(() => {
            addPhoneClickListeners();
        }, 100);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Cambios";
        submitBtn.classList.remove("loading");
    }
}

// Manejar envío del formulario de edición
async function handleEditSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector(".save-btn");
    const formData = new FormData(form);
    const data = {};

    // Convertir FormData a objeto
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";
    submitBtn.classList.add("loading");

    try {
        // En modo GitHub Pages, guardar localmente
        if (isGitHubPagesMode) {
            localStorage.setItem("personal_data_local", JSON.stringify(data));
            updatePersonalDataUI(data);
            showMessage(
                "✅ Datos personales guardados exitosamente",
                "success"
            );

            // Descargar archivo automáticamente
            const currentUser = localStorage.getItem("current_user");
            setTimeout(() => {
                downloadUserDataTXT(currentUser);
            }, 1000);

            closeEditModal();
            return;
        }

        // Modo servidor normal
        const response = await fetch(`${API_BASE}/personal-data`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const updatedData = await response.json();
            updatePersonalDataUI(updatedData);
            showMessage(
                "✅ Datos personales actualizados exitosamente",
                "success"
            );
            closeEditModal();
        } else {
            const error = await response.json();
            showMessage(
                "❌ " + (error.error || "Error al actualizar datos"),
                "error"
            );
        }
    } catch (error) {
        console.error("Error:", error);
        // Fallback a modo local si falla la conexión
        localStorage.setItem("personal_data_local", JSON.stringify(data));
        updatePersonalDataUI(data);
        showMessage("✅ Datos guardados localmente (sin conexión)", "success");
        closeEditModal();
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Cambios";
        submitBtn.classList.remove("loading");
    }
}

// Cerrar modal de edición
function closeEditModal() {
    const modal = document.getElementById("editModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Función para mostrar mensajes
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

// Función para verificar token y obtener datos del usuario
async function verifyTokenAndLoadUser() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/verify-token`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            updateUserMenu(data.user.username);
            return data.user;
        } else {
            // Token inválido
            localStorage.removeItem("token");
            authToken = null;
            window.location.href = "index.html";
        }
    } catch (error) {
        console.log("Error verificando token:", error);
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
