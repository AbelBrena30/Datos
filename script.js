// Variables de autenticación y datos
const API_BASE = "http://localhost:3000/api";
let authToken = localStorage.getItem("token");
let userData = {};
let isLoadingData = false;

let currentIndex = 0;
const items = document.querySelectorAll(".carousel-item");
const indicators = document.querySelectorAll(".indicator");
const totalItems = items.length;
let autoSlideInterval;

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
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
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
    let modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }

    // Crear modal
    modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'edit-modal';
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
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
    document.getElementById('editParentsForm').addEventListener('submit', handleParentsEditSubmit);
    
    // Mostrar modal
    modal.style.display = 'flex';
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
                document.getElementById('editNombre').value = value !== "Tu Nombre Completo" ? value : "";
                break;
            case "fecha de nacimiento":
                if (value !== "DD/MM/AAAA") {
                    // Convertir DD/MM/AAAA a AAAA-MM-DD para el input date
                    const parts = value.split('/');
                    if (parts.length === 3) {
                        document.getElementById('editFechaNacimiento').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }
                break;
            case "edad":
                const edad = value.replace(" años", "");
                document.getElementById('editEdad').value = edad !== "Tu edad" ? edad : "";
                break;
            case "lugar de nacimiento":
                document.getElementById('editLugarNacimiento').value = value !== "Tu lugar de nacimiento" ? value : "";
                break;
            case "ocupación":
                document.getElementById('editOcupacion').value = value !== "Tu ocupación" ? value : "";
                break;
            case "escuela":
                document.getElementById('editEscuela').value = value !== "Tu escuela o institución" ? value : "";
                break;
            case "email":
                document.getElementById('editEmail').value = value !== "tu@email.com" ? value : "";
                break;
            case "numero":
                document.getElementById('editNumero').value = value !== "Tu número de teléfono" ? value : "";
                break;
            case "dirección":
                document.getElementById('editDireccion').value = value !== "Tu dirección completa" ? value : "";
                break;
        }
    });
}

// Función para cambiar entre pestañas del modal
function switchTab(tabName) {
    // Remover clase active de todos los botones y contenidos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar el botón y contenido correspondiente
    event.target.classList.add('active');
    if (tabName === 'personal') {
        document.getElementById('editForm').classList.add('active');
    } else if (tabName === 'parents') {
        document.getElementById('editParentsForm').classList.add('active');
    }
}

// Cargar datos actuales de padres en el formulario de edición
function loadCurrentParentsDataIntoForm() {
    try {
        // Obtener datos del padre
        const padreSection = document.querySelector(".parent-section:first-child .data-grid");
        if (padreSection) {
            const padreData = extractParentData(padreSection);
            document.getElementById('editPadreNombre').value = padreData.nombre !== "Nombre del padre" ? padreData.nombre : "";
            document.getElementById('editPadreEdad').value = padreData.edad !== "Edad" ? padreData.edad : "";
            document.getElementById('editPadreOcupacion').value = padreData.ocupacion !== "Ocupación" ? padreData.ocupacion : "";
            document.getElementById('editPadreLugarNacimiento').value = padreData.lugar_nacimiento !== "Lugar de nacimiento" ? padreData.lugar_nacimiento : "";
            document.getElementById('editPadreNumero').value = padreData.numero !== "Número de teléfono" ? padreData.numero : "";
        }

        // Obtener datos de la madre
        const madreSection = document.querySelector(".parent-section:last-child .data-grid");
        if (madreSection) {
            const madreData = extractParentData(madreSection);
            document.getElementById('editMadreNombre').value = madreData.nombre !== "Nombre de la madre" ? madreData.nombre : "";
            document.getElementById('editMadreEdad').value = madreData.edad !== "Edad" ? madreData.edad : "";
            document.getElementById('editMadreOcupacion').value = madreData.ocupacion !== "Ocupación" ? madreData.ocupacion : "";
            document.getElementById('editMadreLugarNacimiento').value = madreData.lugar_nacimiento !== "Lugar de nacimiento" ? madreData.lugar_nacimiento : "";
            document.getElementById('editMadreNumero').value = madreData.numero !== "Número de teléfono" ? madreData.numero : "";
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
    const submitBtn = form.querySelector('.save-btn');
    const formData = new FormData(form);
    const data = {};
    
    // Convertir FormData a objeto
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    submitBtn.classList.add('loading');
    
    try {
        const response = await fetch(`${API_BASE}/parents-data`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const updatedData = await response.json();
            updateParentsDataUI(updatedData);
            showMessage("✅ Datos de padres actualizados exitosamente", "success");
            closeEditModal();
            
            // Refrescar listeners de teléfonos
            setTimeout(() => {
                addPhoneClickListeners();
            }, 100);
        } else {
            const error = await response.json();
            showMessage("❌ " + (error.error || "Error al actualizar datos de padres"), "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage("❌ Error de conexión al servidor", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';
        submitBtn.classList.remove('loading');
    }
}

// Manejar envío del formulario de edición
async function handleEditSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.save-btn');
    const formData = new FormData(form);
    const data = {};
    
    // Convertir FormData a objeto
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    submitBtn.classList.add('loading');
    
    try {
        const response = await fetch(`${API_BASE}/personal-data`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const updatedData = await response.json();
            updatePersonalDataUI(updatedData);
            showMessage("✅ Datos personales actualizados exitosamente", "success");
            closeEditModal();
        } else {
            const error = await response.json();
            showMessage("❌ " + (error.error || "Error al actualizar datos"), "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage("❌ Error de conexión al servidor", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';
        submitBtn.classList.remove('loading');
    }
}

// Cerrar modal de edición
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
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
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateUserMenu(data.user.username);
            return data.user;
        } else {
            // Token inválido
            localStorage.removeItem('token');
            authToken = null;
            window.location.href = 'index.html';
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
