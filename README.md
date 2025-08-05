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

### Aplicación de Datos Personales

Una aplicación web para gestionar datos personales con autenticación y base de datos.

## Características

- 🔐 Sistema de autenticación (registro/login)
- 👤 Gestión de datos personales
- 👨‍👩‍👧‍👦 Gestión de datos de padres
- 📱 Responsive design
- 📞 Copia de números de teléfono con un click
- 🎨 Interfaz moderna con animaciones

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

### Iniciar el servidor

**Opción 1 - Archivo batch (Windows):**
```bash
./start-server.bat
```

**Opción 2 - Comando directo:**
```bash
node server.js
```

El servidor estará disponible en: `http://localhost:3000`

### Usar la aplicación

1. **Primera vez:**
   - Abre `index.html` en tu navegador
   - Registra una nueva cuenta
   - Completa tus datos personales
   - ¡Listo para usar!

2. **Usuarios existentes:**
   - Inicia sesión con tu usuario y contraseña
   - Accede a tu dashboard personal
   - Edita tus datos cuando lo necesites

## Funcionalidades

### Autenticación
- Registro de nuevos usuarios
- Inicio de sesión seguro
- Tokens JWT para sesiones
- Redirección automática según estado

### Gestión de Datos
- **Datos Personales**: Nombre, fecha de nacimiento, edad, ocupación, etc.
- **Datos de Padres**: Información de padre y madre
- **Edición en tiempo real**: Modal de edición intuitivo
- **Copia rápida**: Click en números de teléfono para copiar

### Interfaz
- **Carrusel interactivo**: Navegación entre datos principales
- **Menú de usuario**: Acceso rápido a opciones
- **Transiciones suaves**: Animaciones entre secciones
- **Diseño responsive**: Funciona en móvil y desktop

## Estructura de Archivos

```
├── index.html          # Página de login/registro
├── dashboard.html      # Dashboard principal
├── auth.js            # Lógica de autenticación
├── script.js          # Lógica principal de la app
├── login.css          # Estilos para login
├── style.css          # Estilos principales
├── server.js          # Servidor Express
├── package.json       # Dependencias
├── datos.db           # Base de datos SQLite
└── start-server.bat   # Script para iniciar servidor
```

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite
- **Autenticación**: JWT + bcryptjs
- **Diseño**: CSS Grid, Flexbox, animaciones CSS

## Modo Sin Servidor

Si no quieres usar autenticación, puedes abrir `dashboard.html` directamente en el navegador para usar la aplicación en modo estático con datos de ejemplo.

## Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz tus cambios
4. Envía un pull request

## Licencia

MIT License

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
