# 🚀 Deployment en Netlify

## Pasos para subir a Netlify

### Opción 1: Drag & Drop

1. Ve a [netlify.com](https://netlify.com)
2. Arrastra toda la carpeta del proyecto al área de "Deploy"
3. ¡Listo! Tu sitio estará en línea

### Opción 2: Git Deploy (Recomendado)

1. Haz push de tu código a GitHub
2. Ve a Netlify y conecta tu repositorio
3. Configura:
    - **Build command**: `echo "Static site ready"`
    - **Publish directory**: `.` (punto)
4. Deploy automático

## Características en Netlify

✅ **Funciona sin servidor**: Toda la funcionalidad está en el frontend
✅ **Datos persistentes**: Se guardan en localStorage del navegador
✅ **Autenticación local**: Sistema de usuarios usando localStorage
✅ **Edición en tiempo real**: Modificar datos personales y de padres
✅ **Responsive**: Se adapta a móvil y desktop
✅ **PWA Ready**: Funciona offline después de la primera carga

## Archivos importantes para Netlify

-   `_redirects`: Configura las redirecciones
-   `netlify.toml`: Configuración de build
-   `auth-netlify.js`: Autenticación para producción
-   `script.js`: Detecta automáticamente el entorno

## Diferencias con la versión local

| Característica | Local (con servidor) | Netlify              |
| -------------- | -------------------- | -------------------- |
| Base de datos  | SQLite               | localStorage         |
| Autenticación  | JWT + bcrypt         | Texto plano local    |
| API            | Express.js REST      | Funciones JavaScript |
| Persistencia   | Archivo .db          | Navegador            |
| Multiusuario   | ✅ Sí                | ❌ Por navegador     |

## URLs de ejemplo

-   **Netlify**: `https://tu-app.netlify.app`
-   **Custom domain**: `https://tu-dominio.com`

## Notas importantes

⚠️ **En Netlify los datos se guardan localmente en cada navegador**

-   Cada usuario verá solo sus datos
-   Los datos se mantienen entre sesiones
-   Si se borra el localStorage, se pierden los datos

🔒 **Seguridad simplificada**

-   No hay encriptación de contraseñas en Netlify
-   Solo para demos y prototipos
-   Para producción real, usar la versión con servidor

## Comandos útiles

```bash
# Para probar localmente antes de subir
npm install
node server.js

# Para ver solo el frontend
# Abrir index.html en el navegador
```

## Próximos pasos

1. Subir a Netlify
2. Configurar dominio personalizado (opcional)
3. Habilitar HTTPS (automático en Netlify)
4. Compartir tu aplicación web

¡Tu aplicación de datos personales está lista para el mundo! 🌍
