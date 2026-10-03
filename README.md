# Boda de Josué & Mónica

Aplicación web interactiva para capturar, organizar y visualizar recuerdos (fotos y videos) en una línea de tiempo y un muro de dedicatorias para la boda de Josué & Mónica.

Este proyecto es un sistema elegante y personalizado, diseñado con un hermoso tema de **girasoles** y una interfaz moderna estilo *glassmorphism*.

## Características Principales

*   **Línea de Tiempo Interactiva:** Visualiza los eventos de la boda cronológicamente.
*   **Gestión de Recuerdos:** Los invitados pueden subir fotos y videos a los eventos.
*   **Galería Inmersiva 3D:** Visualiza el contenido multimedia en una galería y un cubo interactivo 3D.
*   **Muro de Dedicatorias:** Espacio especial para que los invitados dejen sus mensajes y buenos deseos.
*   **Modo Administrador:** Panel de control protegido para gestionar la personalización global (música, fotos de perfil, fondo) y recuerdos.

## Tecnologías Utilizadas

*   **Frontend:** React 19, Vite, CSS Vanilla (Glassmorphism UI)
*   **Iconos:** Lucide React
*   **Backend & Base de Datos:** Supabase (PostgreSQL)
*   **Almacenamiento (Storage):** Supabase Storage para archivos multimedia.

## Estructura de la Base de Datos (Supabase)

El proyecto utiliza las siguientes tablas:

*   **Tablas:**
    *   wedding_wishes: Almacena los mensajes del muro de dedicatorias.
    *   wedding_media: Almacena las fotos y videos.
    *   wedding_settings: Configuraciones globales de la app (música de fondo).
*   **Storage (Bucket):**
    *   wedding_media_bucket: Bucket público para almacenar las imágenes, videos y música.

## Configuración y Despliegue Local

### 1. Variables de Entorno

Crea un archivo .env en la raíz del proyecto y agrega tus credenciales de Supabase:

`env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
`

### 2. Instalación de Dependencias

Ejecuta en la terminal:
`ash
npm install
`

### 3. Ejecutar el Servidor de Desarrollo

Inicia la aplicación localmente:
`ash
npm run dev
`

---
*Desarrollado y personalizado para la boda de Josué & Mónica.*
