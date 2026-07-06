# 🖥️ Sistema Genérico

Sistema web de administración con **control de acceso basado en roles (RBAC)**, menús personalizables por usuario y arquitectura SPA *shell + frames* — construido sin frameworks, con JavaScript puro y PHP.

![PHP](https://img.shields.io/badge/PHP-7.3%2B-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-CSS3-E34F26?logo=html5&logoColor=white)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)
![Estado](https://img.shields.io/badge/Estado-Funcional%20y%20documentado-success)

> 🎓 Proyecto académico — NRC 30713 · Programación Web

---

## 📋 Descripción

**Sistema Genérico** resuelve un problema común en aplicaciones empresariales: administrar **quién puede ver qué pantalla y ejecutar qué operación**, sin tocar código cada vez que cambian los permisos.

Es una aplicación web de tipo **SPA (Single Page Application)** donde:

- El **Administrador** configura visualmente el acceso de cada rol a cada pantalla (*Frame*) y a cada operación interna (crear, editar, eliminar).
- Cada **usuario** organiza libremente su propio menú de navegación mediante *drag & drop* y personaliza su Dashboard.
- El sistema de módulos es **extensible**: agregar un Frame nuevo solo requiere registrarlo en el catálogo central — la matriz de permisos, la configuración de menús y la navegación lo incorporan automáticamente.

---

## ✨ Características principales

- 🔐 Autenticación con **captcha propio**, bloqueo por intentos fallidos (5 intentos → 15 min) y sesiones con token de expiración única por usuario.
- 🛡️ **RBAC de dos niveles**: acceso por pantalla + permisos por operación, validados siempre en el servidor.
- 🧭 Navegación **sin recargas** (shell único con marco interno), con sección activa resaltada y *deep-linking*.
- 🗂️ **Menú 100 % personalizable por usuario**: agrupaciones propias (SuperMenus), reordenamiento y agrupado por *drag & drop*.
- ⚙️ **Configurar Menús**: el Administrador habilita/deshabilita módulos globalmente (ideal para mantenimientos).
- 📊 Dashboard diferenciado por rol: estadísticas para el Administrador, frases motivadoras para los demás.
- ⚡ **Accesos rápidos configurables** individualmente sin afectar permisos.
- 👤 Mi Perfil: consulta de datos propios y cambio de contraseña con política de seguridad e indicador de fortaleza.
- 👥 Gestión de usuarios con búsqueda en vivo y filtros combinables por rol y estado.
- 📝 CRUD de tareas de ejemplo con permisos por operación + 4 Frames de demostración.
- 🌱 **Menú inicial automático** al crear cada usuario, personalizable después y nunca sobrescrito.
- 🎨 Diseño *glassmorphism* uniforme y adaptable a móviles.

---

## 📸 Capturas de pantalla

> Las capturas se agregarán en `documentacion/img/`.

| Pantalla | Vista previa |
|---|---|
| Login | <!-- ![Login](documentacion/img/login.png) --> *pendiente* |
| Dashboard (Administrador) | <!-- ![Dashboard admin](documentacion/img/dashboard-admin.png) --> *pendiente* |
| Dashboard (Usuario) | <!-- ![Dashboard usuario](documentacion/img/dashboard-usuario.png) --> *pendiente* |
| Usuarios | <!-- ![Usuarios](documentacion/img/usuarios.png) --> *pendiente* |
| Roles | <!-- ![Roles](documentacion/img/roles.png) --> *pendiente* |
| Permisos | <!-- ![Permisos](documentacion/img/permisos.png) --> *pendiente* |
| Configurar Menús | <!-- ![Configurar Menús](documentacion/img/configurar-menus.png) --> *pendiente* |
| Menú (organizador) | <!-- ![Menú](documentacion/img/menu.png) --> *pendiente* |
| Mi Perfil | <!-- ![Mi Perfil](documentacion/img/perfil.png) --> *pendiente* |
| Frame 1 — Tareas | <!-- ![Tareas](documentacion/img/frame1.png) --> *pendiente* |

---

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 · CSS3 (glassmorphism, diseño responsive) · JavaScript **vanilla** (sin frameworks ni librerías) |
| Backend | PHP 7.3+ · PDO (sentencias preparadas) |
| Base de datos | MySQL 8.0 / MariaDB |
| Comunicación | `fetch` + JSON (un endpoint por operación) |
| Seguridad | bcrypt · tokens de sesión · captcha canvas · RBAC |
| Servidor | Apache (entorno de referencia: AppServ) |

---

## 🏗️ Arquitectura

Arquitectura cliente–servidor de tres capas con patrón **shell + frames**:

```
Navegador                          Servidor PHP                    MySQL
┌─────────────────────┐            ┌─────────────────────┐         ┌──────────┐
│ Shell (menú+topbar) │  fetch     │ Endpoint por         │  PDO   │ 11 tablas│
│  └── iframe ────────┼──────────► │ operación:           ├──────► │ con FKs  │
│       Frame actual  │   JSON     │ sesión → permiso →   │        │ íntegras │
│                     │ ◄──────────┤ consulta → respuesta │ ◄──────┤          │
└─────────────────────┘            └─────────────────────┘         └──────────┘
```

- **Vistas** (`paginas/`): una página HTML por Frame; el shell (`paginas/dashboard/index.html`) renderiza la estructura una sola vez y carga cada Frame en su marco interno.
- **Controladores del cliente** (`scripts/`): un archivo JS por módulo + núcleo compartido (configuración, sesión, navegación/guardias, utilidades, validaciones).
- **Lógica y acceso a datos** (`servidor/`): endpoints PHP que siguen el patrón `verificar sesión → verificar permiso → verificar disponibilidad del módulo → consulta PDO → respuesta JSON`.
- **Utilidades compartidas del servidor**: `config.php` (conexión y autorización), `permisos/registro.php` (catálogo central de Frames y acciones) y `menu/semilla.php` (menú inicial).

---

## 🧩 Funcionalidades

| Módulo | Descripción | Acceso |
|---|---|---|
| **Inicio de sesión** | Credenciales + captcha, bloqueo por intentos, cambio de contraseña obligatorio en primer acceso | Visitante |
| **Dashboard** | Saludo contextual, accesos rápidos, estadísticas (admin) o frase motivadora (usuarios) | Todos |
| **Usuarios** | Listado con búsqueda y filtros; crear, editar y activar/desactivar cuentas | Lectura: todos · Escritura: admin |
| **Roles** | Listado, creación y edición de roles; desactivar un rol bloquea a sus usuarios | Solo admin |
| **Permisos** | Matriz de acceso a Frames + acciones internas por Frame habilitado, por rol | Solo admin |
| **Configurar Menús** | Disponibilidad global de cada módulo del sistema | Solo admin |
| **Menú** | Organizador personal con SuperMenus y drag & drop | Todos |
| **Mi Perfil** | Ver Perfil y Cambiar Contraseña | Todos |
| **Frame 1 — Tareas** | CRUD de ejemplo con permisos por operación | Según rol |
| **Frames 2–5** | Pantallas de demostración del control de acceso | Según rol |

---

## 🛡️ Sistema RBAC

El control de acceso funciona en **cuatro piezas que se complementan**:

1. **Roles** — cada usuario pertenece a un rol (`Admin`, `Rol1`…`Rol7`). El rol **Admin posee todos los permisos de forma implícita** y no es configurable.
2. **Permisos (dos niveles)** — para cada rol, el Administrador define:
   - *Nivel 1 — Acceso a Frames*: casilla **Habilitar** por pantalla. Sin ella, el Frame no aparece en el menú ni puede abrirse por ningún medio.
   - *Nivel 2 — Acciones internas*: para cada Frame habilitado que tenga operaciones (crear/editar/eliminar), se autorizan individualmente. La interfaz oculta lo no permitido y **el servidor revalida cada operación**.
3. **Configurar Menús** — interruptor global por módulo: un módulo deshabilitado desaparece para **todos** los usuarios (incluido el admin) hasta reactivarlo, sin perder permisos ni personalizaciones.
4. **Menú personalizado** — sobre las opciones que el RBAC le concede, cada usuario organiza su menú con agrupaciones propias y orden libre (el Dashboard nunca se agrupa). La organización es individual y persiste entre sesiones.

> El flujo completo: **Configurar Menús** decide si un módulo existe → **Permisos** decide qué rol lo usa y con qué operaciones → **Menú** decide cómo lo organiza visualmente cada usuario.

---

## 🗄️ Base de datos

- **Motor:** MySQL 8.0 (compatible con MariaDB) — base de datos `proyecto_pw`, 11 tablas con claves foráneas e integridad referencial completa.

**Importar el esquema:**

1. Abrir **phpMyAdmin** → pestaña *Importar*.
2. Seleccionar el archivo `proyecto_pw.sql` y ejecutar.

**Configurar la conexión** en [`servidor/config.php`](servidor/config.php):

```php
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'proyecto_pw');
define('DB_USER',    'root');
define('DB_PASS',    'su_contraseña');
```

---

## 🚀 Instalación

Requisitos: **Apache + PHP 7.3+ + MySQL 8** (por ejemplo AppServ, XAMPP o WAMP).

```bash
# 1. Clonar el repositorio dentro del directorio web del servidor
#    (la ruta debe quedar: <htdocs>/NRC30713-Web/Proyecto_pw)
cd C:/AppServ/www/NRC30713-Web
git clone https://github.com/itsdavx/Proyecto_pw.git
```

2. **Importar la base de datos** `proyecto_pw.sql` desde phpMyAdmin (sección anterior).
3. **Configurar la conexión** en `servidor/config.php` (credenciales de MySQL) y, si el puerto de Apache no es `8080`, ajustar `baseUrl` y `api` en [`scripts/config.js`](scripts/config.js).
4. **Abrir el proyecto** en el navegador:

```
http://localhost:8080/NRC30713-Web/Proyecto_pw/
```

5. **Iniciar sesión** con la cuenta administradora (`admin`) y comenzar a crear usuarios, roles y permisos.

> ⚠️ Las rutas internas están ancladas al prefijo `/NRC30713-Web/Proyecto_pw/`, por lo que la carpeta debe conservar esa ubicación y nombre.

---

## 📁 Estructura del proyecto

```
Proyecto_pw/
├── index.html              # Redirección inicial al login
├── estilos/                # CSS: base, login, shell y componentes
├── imagenes/               # Recursos gráficos (fondo del sistema)
├── paginas/
│   ├── auth/               # Inicio de sesión
│   ├── dashboard/          # Shell de navegación + pantalla de inicio
│   ├── usuarios/           # Listado y formularios de usuarios
│   ├── roles/              # Listado y formulario de roles
│   ├── permisos/           # Matriz de permisos por rol
│   ├── menu/               # Organizador personal + configuración global
│   ├── perfil/             # Ver perfil y cambiar contraseña
│   └── frames/             # Frames de ejemplo 1–5
├── scripts/                # JS del cliente (núcleo + un controlador por módulo)
├── servidor/               # Endpoints PHP (uno por operación) + librerías
│   ├── auth/  usuarios/  roles/  permisos/  menu/  perfil/  dashboard/  tareas/
│   └── config.php          # Conexión, sesión y autorización
└── documentacion/          # IEEE 830 (LaTeX) + diagrama de casos de uso
```

---

## 📖 Manual rápido de uso

| Quiero… | Cómo |
|---|---|
| **Entrar al sistema** | Abrir la URL del proyecto, ingresar usuario, contraseña y el captcha. En el primer acceso se exige cambiar la contraseña. |
| **Crear un usuario** | *Usuarios → + Nuevo Usuario* → completar datos y rol. El usuario nace con su menú inicial y contraseña temporal. |
| **Crear un rol y darle permisos** | *Roles → + Nuevo Rol* → luego en *Permisos*, seleccionar el rol, habilitar sus Frames y marcar las operaciones permitidas → *Guardar Permisos*. |
| **Deshabilitar un módulo en mantenimiento** | *Configurar Menús* → desmarcar la casilla *Activo* del módulo → *Guardar*. Nadie podrá verlo ni abrirlo hasta reactivarlo. |
| **Organizar mi menú** | *Menú* → crear SuperMenus con *+ Nuevo SuperMenu* y arrastrar las opciones a gusto. Cada movimiento se guarda solo; *Guardar* refresca el menú lateral al instante. |
| **Personalizar mi Dashboard** | En la tarjeta *Acceso rápido* → *⚙ Personalizar* → marcar/desmarcar accesos → *Guardar*. |
| **Cambiar mi contraseña** | *Mi Perfil → Cambiar Contraseña* → ingresar la actual y la nueva (mínimo 8 caracteres, mayúscula, número y símbolo). |
| **Probar el RBAC** | Entrar con un usuario de Rol1 o Rol2 al *Frame 1 — Tareas*: los botones disponibles cambian según las operaciones autorizadas al rol. |

---

## 📚 Documentación

El proyecto incluye documentación formal completa en [`documentacion/`](documentacion/):

- 📄 **Especificación de Requerimientos de Software (IEEE 830)** — proyecto LaTeX modular listo para Overleaf (`main.tex`): 20 RF, 10 RNF, 15 casos de uso, 23 reglas de negocio y anexos técnicos (modelo de datos, matriz de permisos, catálogo de módulos).
- 📐 **Diagrama de Casos de Uso** — `diagrama-casos-de-uso.drawio`, importable directamente en [draw.io](https://app.diagrams.net).
- 📘 **README** — este documento.

---

## 👨‍💻 Autor

**David Alejandro Bonilla Caiza**
Ingeniería de Software
Universidad de las Fuerzas Armadas ESPE

---

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT** — ver el archivo [`LICENSE`](LICENSE) para más detalles.

---

## ✅ Estado del proyecto

**Completamente funcional y documentado.** Todos los módulos descritos están implementados, verificados y respaldados por la especificación IEEE 830 incluida en el repositorio.
