# Sistema de Datos Personales con Autenticación

Un sistema web completo para gestionar datos personales con autenticación de usuarios, registro y base de datos SQLite.

## 🚀 Características

-   ✅ **Autenticación completa**: Registro e inicio de sesión
-   ✅ **Base de datos SQLite**: Almacenamiento seguro de datos
-   ✅ **Gestión de datos personales**: Información personal y familiar
-   ✅ **Interfaz intuitiva**: Carrusel interactivo y navegación fluida
-   ✅ **Copiar números**: Click para copiar números de teléfono
-   ✅ **Responsive**: Adaptado para móviles y escritorio
-   ✅ **Seguridad**: Contraseñas encriptadas con bcrypt y JWT tokens

## 📋 Requisitos Previos

-   **Node.js** (versión 14 o superior)
-   **npm** (incluido con Node.js)

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

    ```bash
    cd c:\GitHub\Datos
    ```

2. **Instalar dependencias**

    ```bash
    npm install
    ```

3. **Iniciar el servidor**

    ```bash
    npm start
    ```

    O para desarrollo (con auto-recarga):

    ```bash
    npm run dev
    ```

4. **Abrir en el navegador**
    ```
    http://localhost:3000
    ```

## 📖 Uso

### Primer uso (Nuevo Usuario)

1. **Acceder a la aplicación** en `http://localhost:3000`
2. **Crear cuenta** con usuario, email y contraseña
3. **Completar datos personales** en el formulario inicial
4. **Explorar la aplicación** con tus datos cargados

### Usuario existente

1. **Iniciar sesión** con tu usuario y contraseña
2. **Ver tus datos** en el carrusel y secciones
3. **Navegar** entre datos personales y familiares
4. **Copiar números** haciendo click en los teléfonos

## 🏗️ Estructura del Proyecto

```
c:\GitHub\Datos\
├── 📄 server.js          # Servidor backend con Express
├── 📄 package.json       # Configuración de Node.js
├── 📄 login.html         # Página de autenticación
├── 📄 login.css          # Estilos de autenticación
├── 📄 auth.js            # Lógica de autenticación
├── 📄 index.html         # Aplicación principal
├── 📄 style.css          # Estilos principales
├── 📄 script.js          # Lógica de la aplicación
├── 📄 datos.db           # Base de datos SQLite (auto-generada)
└── 📁 asset/             # Recursos (imágenes)
    ├── icons8-recargar.svg
    ├── icons8-tarjeta.gif
    └── perfil.png
```

## 🗄️ Base de Datos

El sistema utiliza **SQLite** con las siguientes tablas:

### `users`

-   `id`: ID único del usuario
-   `username`: Nombre de usuario
-   `email`: Correo electrónico
-   `password`: Contraseña encriptada
-   `has_personal_data`: Indica si tiene datos completos

### `personal_data`

-   Datos personales del usuario (nombre, edad, ocupación, etc.)

### `parents_data`

-   Datos de los padres del usuario

## 🔧 API Endpoints

### Autenticación

-   `POST /api/register` - Crear nueva cuenta
-   `POST /api/login` - Iniciar sesión
-   `GET /api/verify-token` - Verificar token

### Datos

-   `GET /api/personal-data` - Obtener datos personales
-   `POST /api/personal-data` - Guardar datos personales
-   `GET /api/parents-data` - Obtener datos de padres
-   `POST /api/parents-data` - Guardar datos de padres

## 🎨 Funcionalidades de la Interfaz

### Carrusel Interactivo

-   **Navegación automática** cada 10 segundos
-   **Controles manuales** con botones y indicadores
-   **Datos dinámicos** cargados desde la base de datos

### Secciones de Datos

-   **Datos Personales**: Lista completa de información personal
-   **Datos de Padres**: Información familiar en columnas
-   **Transiciones suaves** entre secciones

### Funciones Especiales

-   **Copiar números**: Click en cualquier teléfono para copiarlo
-   **Notificaciones**: Feedback visual al copiar
-   **Menú de usuario**: Acceso a configuración y logout

## ⚡ Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor (producción)
npm start

# Iniciar con auto-recarga (desarrollo)
npm run dev
```

## 🔒 Seguridad

-   **Contraseñas encriptadas** con bcryptjs
-   **Tokens JWT** para autenticación
-   **Validación de datos** en frontend y backend
-   **Protección de rutas** con middleware de autenticación

## 📱 Responsive Design

La aplicación está optimizada para:

-   📱 **Móviles** (320px+)
-   📱 **Tablets** (768px+)
-   💻 **Desktop** (1024px+)

## 🐛 Solución de Problemas

### Error de conexión

```bash
# Verificar que el puerto 3000 esté disponible
netstat -an | findstr 3000

# Cambiar puerto si es necesario (en server.js)
const PORT = process.env.PORT || 3001;
```

### Base de datos no se crea

```bash
# Verificar permisos de escritura en la carpeta
# La base de datos datos.db se crea automáticamente
```

### Errores de dependencias

```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 👨‍💻 Autor

**Abel Nephtali Vasquez Brena**

-   Estudiante de Centro de Bachillerato Tecnológico Industrial y de Servicios No. 150
-   Email: abelbrena@gmail.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

---

¡Disfruta gestionando tus datos personales de forma segura! 🎉
