# Celebraciones de Teresa Flores (MTFD Amor)

Aplicación web interactiva para capturar, organizar y visualizar recuerdos (fotos y videos) en una línea de tiempo para la celebración de eventos de Teresa Flores.

Este proyecto es una adaptación elegante y personalizada de un sistema de línea de tiempo de eventos, diseñado con un hermoso tema de **tulipanes púrpuras** y una interfaz moderna estilo *glassmorphism*.

## Características Principales

*   **Línea de Tiempo Interactiva:** Visualiza los eventos cronológicamente.
*   **Gestión de Recuerdos:** Sube fotos y videos a eventos específicos.
*   **Galería Inmersiva:** Visualiza el contenido multimedia de cada evento.
*   **Modo Administrador:** Panel de control protegido para gestionar eventos y recuerdos.
*   **Diseño Elegante:** Tema personalizado inspirado en tulipanes púrpuras (colores `#8B5CF6`, `#FDF9FF`), con animaciones suaves y componentes translúcidos.

## Tecnologías Utilizadas

*   **Frontend:** React 19, Vite, CSS Vanilla (Glassmorphism UI)
*   **Iconos:** Lucide React
*   **Backend & Base de Datos:** Supabase (PostgreSQL)
*   **Almacenamiento (Storage):** Supabase Storage para archivos multimedia.

## Estructura de la Base de Datos (Supabase)

El proyecto utiliza un esquema `public` con las siguientes tablas y recursos configurados con **Row Level Security (RLS)**:

*   **Tablas:**
    *   `events_mtfd`: Almacena los bloques principales (eventos).
    *   `post_mtfd`: Almacena las fotos/videos asociados a cada evento.
    *   `guest_mtfd`: Sistema de confirmación de asistencia (RSVP).
*   **Storage (Bucket):**
    *   `media_mtfd`: Bucket público para almacenar las imágenes y videos subidos.

*(Ver la carpeta `supabase/` para los scripts SQL exactos).*

## Configuración y Despliegue Local

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 2. Base de Datos

En tu panel de Supabase, ve al Editor SQL y ejecuta el script principal que se encuentra en:
`supabase/schema_mtfd.sql`
*(Esto creará las tablas, el bucket y las políticas de seguridad requeridas).*

### 3. Instalación de Dependencias

Ejecuta en la terminal:
```bash
npm install
```

### 4. Ejecutar el Servidor de Desarrollo

Inicia la aplicación localmente:
```bash
npm run dev
```

---
*Desarrollado y personalizado para la celebración de Teresa Flores.*
