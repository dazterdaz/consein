# Sistema de Referidos - Documentación Completa

## Descripción General

Sistema web completo para gestionar un programa de referidos entre socios comerciales y artistas (tatuadores). Permite a socios registrarse, generar cupones de descuento, y recibir comisiones por referidos. Incluye panel administrativo completo con dashboard, gestión de socios, artistas, cupones y pagos.

---

## Prompt Original del Proyecto

```
Necesito un sistema web de referidos con las siguientes características:

ESTRUCTURA GENERAL:
- Landing page atractiva con información del programa
- Sitio completamente responsivo (mobile, tablet, desktop)
- Tema moderno y profesional
- Navbar y footer en todas las páginas

FUNCIONALIDADES PÚBLICAS:
1. Landing Page
   - Hero section con información del programa
   - Carrusel de artistas disponibles
   - Sección de beneficios para socios
   - CTA para registrarse como socio
   - Formulario de contacto

2. Registro de Socios
   - Formulario con campos: nombre local, dirección, contacto, WhatsApp, Instagram
   - Datos bancarios: titular cuenta, RUT, banco, tipo cuenta, número cuenta
   - Generar código único de 6 caracteres y PIN de 4 dígitos
   - Validaciones de entrada
   - Mostrar credenciales generadas

3. Portal de Socio
   - Login con código y PIN
   - Dashboard de socio
   - Ver cupones descargados (tabla con código, artista, estado)
   - Ver pagos recibidos
   - Descargar comprobante de estado

4. Página de Cupón Público
   - Mostrar cupón con código QR
   - Información del descuento
   - Información del socio

PANEL ADMINISTRATIVO:
1. Dashboard Admin
   - Estadísticas generales (socios activos, cupones generados, pagos pendientes)
   - Gráficos de actividad
   - Últimas transacciones

2. Gestión de Socios
   - Tabla de socios registrados
   - Filtros: activos, inactivos, aprobados, pendientes
   - Editar datos de socio
   - Activar/desactivar socio
   - Ver cupones del socio
   - Ver pagos del socio

3. Gestión de Artistas
   - Crear/editar/eliminar artistas
   - Upload de imagen
   - Activar/desactivar

4. Gestión de Cupones
   - Tabla de cupones
   - Filtros por socio, artista, estado
   - Ver detalles del cupón
   - Cambiar estado

5. Gestión de Pagos
   - Tabla de pagos pendientes y realizados
   - Crear nuevo pago
   - Registrar comprobante
   - Calcular automáticamente comisión

6. Configuración
   - Nombre de la empresa
   - Logo/imagen
   - Porcentaje de comisión
   - Textos del footer
   - Plantillas de email

TECNOLOGÍA:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Base de datos: Supabase PostgreSQL
- Autenticación: Login simple para admin
- Almacenamiento: Supabase Storage para imágenes

DISEÑO:
- Colores profesionales (azul, gris neutro)
- Tipografía clara y legible
- Espaciado consistente
- Animaciones suaves
- Iconos de Lucide React
```

---

## Estructura del Proyecto

```
proyecto/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── Sidebar.tsx - Navegación del panel admin
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx - Rutas protegidas para admin
│   │   ├── layout/
│   │   │   ├── Navbar.tsx - Barra de navegación
│   │   │   └── Footer.tsx - Pie de página
│   │   └── ui/
│   │       ├── CuponGenerator.tsx - Generador de cupones con QR
│   │       ├── PartnerCarousel.tsx - Carrusel de artistas
│   │       └── QRGenerator.tsx - Componente para QR
│   ├── contexts/
│   │   ├── AuthContext.tsx - Gestión de autenticación
│   │   └── ConfigContext.tsx - Gestión de configuración global
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Artistas.tsx - Gestión de artistas
│   │   │   ├── Configuracion.tsx - Configuración del sistema
│   │   │   ├── Cupones.tsx - Gestión de cupones
│   │   │   ├── Dashboard.tsx - Dashboard principal
│   │   │   ├── Pagos.tsx - Gestión de pagos
│   │   │   └── Socios.tsx - Gestión de socios
│   │   ├── auth/
│   │   │   └── Login.tsx - Página de login del admin
│   │   └── public/
│   │       ├── CuponPage.tsx - Página pública del cupón
│   │       ├── LandingPage.tsx - Página de inicio
│   │       ├── PortalSocio.tsx - Portal del socio
│   │       └── RegistroSocio.tsx - Formulario de registro
│   ├── lib/
│   │   ├── database.ts - Funciones de base de datos
│   │   ├── database.types.ts - Tipos generados de Supabase
│   │   ├── supabase.ts - Cliente de Supabase
│   │   ├── email.ts - Funciones de email
│   │   └── utils.ts - Utilidades
│   ├── layouts/
│   │   └── AdminLayout.tsx - Layout del panel admin
│   ├── App.tsx - Componente principal con rutas
│   ├── main.tsx - Punto de entrada
│   └── index.css - Estilos Tailwind
├── supabase/
│   └── migrations/
│       └── [archivos de migración SQL]
├── scripts/
│   └── migrate.ts - Script para ejecutar migraciones
├── package.json
├── tailwind.config.js - Configuración de Tailwind
├── tsconfig.json - Configuración de TypeScript
├── vite.config.ts - Configuración de Vite
└── .env - Variables de entorno

```

---

## Base de Datos - Esquema

### Tabla: socios
Almacena información de los socios comerciales del programa.

```sql
CREATE TABLE socios (
  id uuid PRIMARY KEY,
  nombre_local text NOT NULL,
  direccion text NOT NULL,
  nombre_contacto text NOT NULL,
  whatsapp text NOT NULL,
  instagram text NOT NULL,
  titular_cuenta text NOT NULL,
  rut text NOT NULL,
  banco text NOT NULL,
  tipo_cuenta text NOT NULL,
  numero_cuenta text NOT NULL,
  email text NOT NULL UNIQUE,
  codigo text NOT NULL UNIQUE,  -- 6 caracteres alfanuméricos
  pin text NOT NULL,            -- PIN para login
  logo_url text,
  link text,
  activo boolean DEFAULT false,
  aprobado boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Campos principales:**
- `codigo`: Identificador único que genera el sistema (ej: ABC123)
- `pin`: Contraseña corta para acceso al portal del socio
- `activo`: Si el socio puede operar
- `aprobado`: Si fue aprobado por administrador

---

### Tabla: artistas
Artistas disponibles en el programa (tatuadores).

```sql
CREATE TABLE artistas (
  id uuid PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  url_imagen text,
  activo boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
);
```

---

### Tabla: cupones
Cupones generados por socios para ser usados por clientes.

```sql
CREATE TABLE cupones (
  id uuid PRIMARY KEY,
  codigo text NOT NULL UNIQUE,
  socio_id uuid NOT NULL REFERENCES socios(id),
  artista_id uuid NOT NULL REFERENCES artistas(id),
  descuento numeric(5,2) NOT NULL,
  cantidad_usos integer DEFAULT 0,
  fecha_descarga timestamptz,
  fecha_uso timestamptz,
  activo boolean DEFAULT true,
  created_at timestamptz
);
```

---

### Tabla: pagos
Registro de pagos realizados a socios.

```sql
CREATE TABLE pagos (
  id uuid PRIMARY KEY,
  socio_id uuid NOT NULL REFERENCES socios(id),
  monto numeric(12,2) NOT NULL,
  comision_porcentaje numeric(5,2) NOT NULL,
  razon text,
  fecha_pago timestamptz,
  estado text DEFAULT 'pendiente',  -- pendiente, pagado, rechazado
  created_at timestamptz,
  updated_at timestamptz
);
```

---

### Tabla: configuracion
Almacena la configuración del sistema como clave-valor.

```sql
CREATE TABLE configuracion (
  id uuid PRIMARY KEY,
  clave text NOT NULL UNIQUE,
  valor text NOT NULL,
  tipo text DEFAULT 'string',      -- string, number, boolean
  descripcion text,
  updated_at timestamptz
);
```

**Configuraciones predeterminadas:**
- `porcentaje_comision`: 10
- `nombre_empresa`: Sistema de Referidos
- `email_contacto`: contacto@empresa.com

---

### Tabla: email_templates
Plantillas de correo para diferentes eventos.

```sql
CREATE TABLE email_templates (
  id uuid PRIMARY KEY,
  tipo text NOT NULL UNIQUE,       -- registro, aprobacion, activacion
  asunto text NOT NULL,
  contenido text NOT NULL,         -- HTML
  activo boolean DEFAULT true,
  variables text,                  -- Variables reemplazables
  created_at timestamptz,
  updated_at timestamptz
);
```

---

### Tabla: email_config
Configuración SMTP para envío de emails.

```sql
CREATE TABLE email_config (
  id uuid PRIMARY KEY,
  host text NOT NULL,
  puerto integer NOT NULL,
  usuario text NOT NULL,
  contrasena text NOT NULL,
  email_remitente text NOT NULL,
  nombre_remitente text NOT NULL,
  activo boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);
```

---

## Seguridad - Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

- **socios**: Solo usuarios autenticados pueden ver socios activos y aprobados
- **artistas**: Todos pueden ver artistas activos (lectura pública)
- **cupones**: Todos pueden ver cupones activos (lectura pública)
- **pagos, configuracion, email_templates, email_config**: Lectura pública para uso general

---

## Autenticación

### Admin
- **Usuario:** Demian
- **Contraseña:** Llamasami152616
- El sistema almacena credenciales como fallback si la tabla `usuarios` no existe
- Al iniciar sesión, se guarda el usuario en localStorage

### Socios
- Usan **código** (6 caracteres) y **PIN** (4 dígitos)
- Se validan contra la tabla `socios`
- El socio debe estar `activo` y `aprobado`

---

## Flujo de Funcionalidades

### 1. Registro de Socio
1. Usuario accede a `/registro-socio`
2. Completa formulario con datos personales y bancarios
3. Sistema genera:
   - **Código único**: 6 caracteres alfanuméricos (ej: ABC123)
   - **PIN**: 4 dígitos aleatorios
4. Datos se guardan con `aprobado = false` y `activo = false`
5. Admin debe aprobar en panel administrativo

### 2. Login de Socio
1. Socio accede a `/portal-socio`
2. Ingresa código + PIN
3. Si es válido y está aprobado/activo, accede a su dashboard
4. Ve sus cupones y pagos

### 3. Descarga de Cupón
1. Socio genera cupón seleccionando artista
2. Sistema crea cupón con código único
3. Genera código QR
4. Socio puede descargar como imagen

### 4. Página Pública del Cupón
1. Acceso por URL: `/cupon/:codigo`
2. Muestra información del cupón
3. Código QR escaneble
4. Información del socio y artista

### 5. Aprobación en Admin
1. Admin ve solicitudes pendientes en `/admin/socios`
2. Revisa datos del socio
3. Aprueba y activa la cuenta
4. Socio puede iniciar sesión

---

## Componentes Principales

### AuthContext.tsx
Gestiona estado de autenticación global.

**Métodos:**
- `login(username, password)` - Login de admin
- `loginSocio(codigo, pin)` - Login de socio
- `logout()` - Cierra sesión
- `isAdmin()` - Verifica si es admin

---

### ConfigContext.tsx
Carga configuración del sistema desde base de datos.

**Proporciona:**
- Nombre de empresa
- Logo
- Porcentaje de comisión
- Textos de footer

---

### Database Functions (database.ts)
Funciones CRUD para todas las entidades.

**Socios:**
- `getSocios(filters)` - Obtener socios
- `getSocioById(id)` - Obtener socio específico
- `createSocio(data)` - Crear socio
- `updateSocio(id, data)` - Actualizar socio
- `authenticateSocio(codigo, pin)` - Validar credenciales

**Artistas:**
- `getArtistas()` - Obtener artistas
- `createArtista(data)` - Crear artista
- `updateArtista(id, data)` - Actualizar artista
- `deleteArtista(id)` - Eliminar artista

**Cupones:**
- `getCupones()` - Obtener cupones
- `getCuponesBySocio(socioId)` - Cupones de un socio
- `createCupon(data)` - Crear cupón
- `updateCupon(id, data)` - Actualizar cupón

**Pagos:**
- `getPagos()` - Obtener pagos
- `getPagosBySocio(socioId)` - Pagos de un socio
- `createPago(data)` - Crear pago

**Utilidades:**
- `generatePartnerCode()` - Genera código único de socio
- `uploadImage(file, path)` - Sube imagen a storage
- `deleteImage(path)` - Elimina imagen

---

## Panel Administrativo (/admin)

Accesible solo para usuarios autenticados como admin.

### Dashboard
- Estadísticas: socios activos, cupones generados, pagos pendientes
- Gráficos de actividad
- Últimas transacciones
- KPIs principales

### Gestión de Socios
- Tabla de todos los socios
- Filtros: activos/inactivos, aprobados/pendientes
- Editar datos del socio
- Botones: Activar, Desactivar, Aprobar, Rechazar
- Ver cupones del socio
- Ver pagos del socio

### Gestión de Artistas
- CRUD completo
- Upload de imagen
- Botón activar/desactivar

### Gestión de Cupones
- Tabla de cupones
- Filtros por socio, artista, estado
- Ver QR
- Cambiar estado

### Gestión de Pagos
- Tabla de pagos
- Estados: pendiente, pagado, rechazado
- Crear nuevo pago
- Calcular comisión automáticamente

### Configuración
- Editar nombre de empresa
- Upload de logo
- Establecer porcentaje de comisión
- Editar textos del footer
- Gestionar plantillas de email

---

## Páginas Públicas

### Landing Page (/)
- Hero section atractivo
- Información del programa
- Carrusel de artistas
- Beneficios para socios
- CTA a registro
- Footer con información

### Registro de Socio (/registro-socio)
- Formulario completo
- Validaciones
- Genera y muestra código + PIN
- Opción de descargar datos

### Portal del Socio (/portal-socio)
- Login con código + PIN
- Dashboard personal
- Tabla de cupones
- Tabla de pagos
- Botón para generar nuevo cupón

### Página del Cupón (/cupon/:codigo)
- Información del cupón
- Código QR grande
- Información del socio
- Información del artista/descuento
- Botón compartir

---

## Tecnologías Utilizadas

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler rápido
- **Tailwind CSS** - Estilos utilitarios
- **React Router** - Enrutamiento
- **Lucide React** - Iconos
- **Chart.js** - Gráficos
- **react-qr-code** - Generador QR
- **html2canvas** - Descarga de cupones como imagen
- **react-slick** - Carruseles
- **react-toastify** - Notificaciones
- **date-fns** - Manejo de fechas

### Backend
- **Supabase** - Base de datos PostgreSQL + Auth + Storage
- **@supabase/supabase-js** - Cliente JavaScript

### Desarrollo
- **TypeScript** - Lenguaje de tipo
- **ESLint** - Linter de código
- **Tailwind CSS** - Framework de CSS
- **PostCSS** - Procesador de CSS

---

## Variables de Entorno (.env)

```env
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-clave-anonima]
```

Estas variables se cargan automáticamente desde Supabase.

---

## Cómo Funciona el Sistema

### Flujo de Registro y Aprobación
```
1. Socio se registra (aprobado=false, activo=false)
   ↓
2. Admin recibe notificación (futura implementación de email)
   ↓
3. Admin revisa datos en panel administrativo
   ↓
4. Admin aprueba (aprobado=true)
   ↓
5. Admin activa (activo=true)
   ↓
6. Socio puede iniciar sesión
```

### Flujo de Generación de Cupones
```
1. Socio inicia sesión en portal
   ↓
2. Selecciona artista para crear cupón
   ↓
3. Sistema crea cupón con:
   - Código único (UUID)
   - QR generado
   - Información del socio
   - Información del artista
   ↓
4. Socio descarga cupón como imagen (HTML2Canvas)
   ↓
5. Cupón se comparte con cliente
   ↓
6. Cliente escanea QR o accede a URL pública
```

### Flujo de Pagos
```
1. Admin revisa transacciones del socio
   ↓
2. Calcula comisión (% configurado)
   ↓
3. Crea registro de pago
   ↓
4. Socio ve pago en su portal
```

---

## Estilos y Diseño

### Tailwind CSS
Sistema de clases utilitarias para diseño responsivo.

**Colores principales:**
- Primario: Azul (según configuración de Tailwind)
- Secundario: Gris oscuro
- Acentos: Tonos verdes y rojos para estados

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Componentes UI
- Botones con estados hover y disabled
- Inputs con validación visual
- Tablas responsivas
- Modales para acciones críticas
- Toasts para notificaciones
- Carruseles para artistas

---

## Seguridad

### Medidas Implementadas
1. **Autenticación**: Login requerido para admin y socio
2. **RLS**: Datos protegidos a nivel de base de datos
3. **Validación**: Entrada validada en frontend y backend
4. **HTTPS**: Supabase proporciona conexión segura
5. **LocalStorage**: Sesión guardada en navegador
6. **CORS**: Supabase maneja automáticamente

### Consideraciones Futuras
- Hash de contraseñas (actualmente plaintext en credenciales por defecto)
- Dos factores de autenticación (2FA)
- Encriptación de datos sensibles
- Auditoría de cambios

---

## Cómo Replicar el Proyecto

### Pasos para Crear Desde Cero

1. **Crear proyecto Vite con React + TypeScript**
   ```bash
   npm create vite@latest proyecto -- --template react-ts
   cd proyecto
   npm install
   ```

2. **Instalar dependencias principales**
   ```bash
   npm install @supabase/supabase-js react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   ```

3. **Instalar dependencias opcionales**
   ```bash
   npm install lucide-react chart.js react-chartjs-2
   npm install react-qr-code html2canvas react-slick slick-carousel
   npm install react-toastify date-fns uuid
   npm install react-slick
   ```

4. **Configurar Tailwind CSS**
   - Crear `tailwind.config.js`
   - Crear `postcss.config.js`
   - Importar directives en `index.css`

5. **Configurar Supabase**
   - Crear proyecto en supabase.com
   - Crear tabla `socios` con migración
   - Crear tabla `artistas`
   - Crear tabla `cupones`
   - Crear tabla `pagos`
   - Crear tabla `configuracion`
   - Crear tabla `email_templates`
   - Crear tabla `email_config`

6. **Crear estructura de carpetas**
   - src/components/
   - src/pages/
   - src/contexts/
   - src/lib/
   - src/layouts/

7. **Implementar contextos**
   - AuthContext para autenticación
   - ConfigContext para configuración

8. **Crear páginas principales**
   - Landing page
   - Login admin
   - Admin dashboard
   - Portal de socio

9. **Implementar funciones de base de datos**
   - CRUD para socios
   - CRUD para artistas
   - CRUD para cupones
   - CRUD para pagos

10. **Añadir estilos con Tailwind**
    - Diseño responsivo
    - Componentes consistentes
    - Temas de color

---

## Problemas Comunes y Soluciones

### Las credenciales del admin no funcionan
**Solución:** Verificar que AuthContext tiene las credenciales por defecto embebidas. Si la tabla 'usuarios' no existe, debe usar las credenciales fallback.
- Usuario: Demian
- Contraseña: Llamasami152616

### Los cupones no se generan
**Solución:** Verificar que:
1. El socio está aprobado y activo
2. La tabla cupones existe
3. Hay artistas registrados en la base de datos

### Imágenes no se cargan
**Solución:** Verificar configuración de Supabase Storage:
1. Bucket 'images' debe existir
2. Políticas de acceso deben permitir lectura pública

---

## Deployment

El proyecto está configurado para Netlify:
- `netlify.toml` proporciona configuración de build
- Variables de entorno se configuran en Netlify
- Los assets estáticos se sirven desde CDN

**Comando de build:**
```bash
npm run build
```

---

## Mantenimiento

### Backups
- Supabase proporciona backups automáticos
- Exportar datos regularmente

### Monitoreo
- Revisar logs de Supabase
- Monitorear uso de storage
- Verificar RLS policies

### Actualizaciones
- Mantener librerías al día
- Verificar cambios en Supabase
- Testear cambios antes de deploy

---

## Contacto y Soporte

**Detalles del Proyecto:**
- Versión: 1.7
- Autor: Daz The Line
- Website: www.daz.cl
- Email contacto: contacto@empresa.com

---

## Licencia

Este proyecto es propietario de Daz The Line.
