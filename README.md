# Sistema Genérico

Sistema web de administración con control de acceso basado en roles (RBAC) granular, menús personalizables por usuario y arquitectura de página única (shell con marco interno). Construido sin frameworks: JavaScript vanilla en el cliente y PHP con PDO en el servidor.

## Descripción

El sistema resuelve la administración de acceso a pantallas y operaciones dentro de una aplicación multiusuario: qué rol puede ver cada módulo (Frame) y qué acciones internas puede ejecutar dentro de él (crear, editar, eliminar, etc.), configurable desde la interfaz sin modificar código.

Cada usuario, además, organiza libremente su propio menú de navegación (agrupaciones propias y orden mediante arrastrar y soltar), y el Administrador controla por separado la disponibilidad global de cada opción del sistema, independientemente de los permisos por rol.

## Características principales

- Inicio de sesión con captcha propio (generado en canvas) y bloqueo temporal tras intentos fallidos.
- Sesiones con token de expiración, únicas por usuario, verificadas en cada operación.
- Cambio de contraseña obligatorio en el primer acceso, con política de seguridad e indicador de fortaleza.
- RBAC granular: cada acción de cada módulo (por ejemplo, editar usuario, desactivar usuario, cambiar rol) es un permiso independiente, configurable por rol.
- Navegación sin recargas: la estructura general (menú lateral y barra superior) se carga una sola vez; cada módulo se muestra en un marco interno.
- Menú personalizable por usuario: creación de agrupaciones propias, reordenamiento y reagrupado mediante arrastrar y soltar; persistencia individual por usuario.
- Configuración global de disponibilidad de módulos, independiente de los permisos por rol.
- Dashboard con contenido diferenciado por rol: estadísticas del sistema para el Administrador, frase motivadora aleatoria para el resto.
- Accesos rápidos del Dashboard configurables de forma individual, sin afectar los permisos del usuario.
- Gestión de Usuarios (crear, editar, activar/desactivar, filtros combinables por rol y estado) y de Roles (crear, editar, eliminar con validación de dependencias).
- Confirmación reforzada para eliminaciones permanentes: exige escribir el nombre exacto del elemento antes de habilitar el botón de eliminar.
- Numeración visual consecutiva (columna N°) en las tablas administrativas, independiente del identificador real de la base de datos.
- Módulo de ejemplo (Frame 1) con un CRUD de tareas cuyos botones se habilitan según los permisos del rol, más cuatro Frames de demostración.

## Tecnologías utilizadas

- HTML5 y CSS3, sin frameworks de estilos.
- JavaScript sin librerías ni frameworks (vanilla).
- PHP 7.3 o superior, con PDO y sentencias preparadas.
- MySQL 8.0 o MariaDB.
- Comunicación cliente-servidor mediante `fetch` y JSON.
- Contraseñas cifradas con bcrypt.
- Servidor de referencia: Apache (entorno de desarrollo probado con AppServ).

## Requisitos

- Servidor Apache con soporte para PHP 7.3 o superior.
- Extensión PDO de PHP habilitada.
- MySQL 8.0 o MariaDB.
- Navegador con soporte de JavaScript moderno, `sessionStorage` e `iframe`.

## Instalación

1. Clonar el repositorio dentro del directorio servido por Apache, respetando la ruta `NRC30713-Web/Proyecto_pw`, ya que las rutas internas del sistema están ancladas a ese prefijo.
2. Crear una base de datos llamada `proyecto_pw` y crear en ella las tablas descritas en la sección Base de Datos (el repositorio no incluye actualmente un archivo de exportación; debe generarse desde el entorno de desarrollo o crearse manualmente según esa estructura).
3. Configurar las credenciales de conexión en `servidor/config.php` (host, puerto, nombre de base de datos, usuario y contraseña).
4. Si el servidor Apache no usa el puerto 8080, ajustar `baseUrl` y `api` en `scripts/config.js`.
5. Crear manualmente el primer usuario Administrador directamente en la tabla `pw_user` (con contraseña cifrada con bcrypt) y su rol correspondiente en `roles`, ya que el sistema no ofrece registro público de cuentas.
6. Acceder a la aplicación desde el navegador en la ruta correspondiente al proyecto e iniciar sesión con esa cuenta.

## Estructura general del proyecto

```
Proyecto_pw/
├── index.html              Redirección inicial al login
├── LICENSE
├── estilos/                Hojas de estilo (base, login, shell, componentes)
├── imagenes/                Recursos gráficos
├── paginas/
│   ├── auth/                Inicio de sesión
│   ├── dashboard/           Shell de navegación e inicio
│   ├── usuarios/            Listado y formularios de usuarios
│   ├── roles/               Listado y formulario de roles
│   ├── permisos/            Matriz de permisos por rol
│   ├── menu/                Organizador personal y configuración global de menús
│   ├── perfil/              Ver perfil y cambiar contraseña
│   └── frames/              Frames de ejemplo (1 a 5)
├── scripts/                 Lógica del cliente: núcleo compartido y un controlador por módulo
├── servidor/                Endpoints PHP (uno por operación) organizados por módulo
│   └── config.php           Conexión a la base de datos, sesión y autorización
└── documentacion/           Especificación de requerimientos (IEEE 830) y diagrama de casos de uso
```

## Base de datos

Motor: MySQL 8.0, compatible con MariaDB. La base de datos `proyecto_pw` está compuesta por once tablas:

| Tabla | Propósito |
|---|---|
| `pw_user` | Cuentas de usuario: credenciales, datos personales, rol, estado y marca de primer acceso. |
| `roles` | Roles del sistema (nombre único, descripción, estado). |
| `permisos_rol` | Permisos otorgados a cada rol, como pares módulo-acción independientes. |
| `menu` | Opciones de menú globales (ItemMenu): nombre, ícono, página que abren, módulo asociado y disponibilidad. |
| `menu_super_usuario` | Agrupaciones personales (SuperMenus) creadas por cada usuario, con su orden y protección contra eliminación cuando corresponde. |
| `menu_orden_usuario` | Organización personal del menú: posición de cada opción y agrupación a la que pertenece, por usuario. |
| `accesos_ocultos_usuario` | Accesos rápidos que cada usuario decidió ocultar de su Dashboard. |
| `sesiones` | Sesiones activas: token, usuario, origen y expiración. |
| `login_intentos` | Registro de intentos fallidos de acceso, para el bloqueo temporal. |
| `frases` | Frases motivadoras mostradas en el Dashboard, con autor y estado. |
| `tareas` | Tareas del módulo de ejemplo (Frame 1), con su creador. |

Las relaciones cuentan con claves foráneas con reglas de borrado explícitas: al eliminar un usuario o un rol se limpian en cascada (o se bloquea la operación, según el caso) sus datos asociados, sin dejar registros huérfanos.

## Módulos principales

- **Inicio de sesión**: autenticación con captcha, bloqueo por intentos fallidos y cambio de contraseña obligatorio en el primer acceso.
- **Dashboard**: saludo contextual, accesos rápidos configurables y contenido diferenciado por rol (estadísticas o frase motivadora).
- **Usuarios**: listado con búsqueda y filtros combinables por rol y estado; creación, edición, activación y desactivación de cuentas.
- **Roles**: listado, creación, edición y eliminación de roles, con verificación de usuarios y permisos asociados antes de eliminar.
- **Permisos**: matriz de acceso a cada Frame y de sus acciones internas, configurable de forma independiente por rol.
- **Configurar Menús**: disponibilidad global de cada opción del sistema, además de su creación, edición y eliminación.
- **Menú**: organización personal del menú de cada usuario mediante agrupaciones propias y arrastrar y soltar.
- **Mi Perfil**: consulta de los datos propios y cambio de contraseña.
- **Frame 1 (Tareas)**: CRUD de ejemplo con permisos independientes por operación.
- **Frames 2 a 5**: pantallas de demostración del control de acceso por rol.

## Sistema de permisos (RBAC)

El control de acceso se resuelve en cuatro niveles complementarios:

1. **Rol**: cada usuario pertenece a un rol. El rol Administrador posee todos los permisos de forma implícita y no se configura.
2. **Permisos granulares**: por cada rol distinto del Administrador, se define el acceso a cada Frame y, de forma completamente independiente, cada una de sus acciones internas. Ninguna acción representa más de una operación; por ejemplo, en el módulo Usuarios, editar datos, desactivar una cuenta y cambiar el rol son tres permisos separados. El servidor valida cada operación contra su acción específica, sin depender de la interfaz.
3. **Configurar Menús**: control global, independiente del rol, sobre si una opción del sistema está disponible. Una opción deshabilitada desaparece para todos los usuarios y no puede abrirse por ningún medio hasta reactivarla.
4. **Menú personal**: sobre las opciones que los tres niveles anteriores permiten, cada usuario decide cómo organizarlas visualmente (agrupaciones y orden), sin afectar a los demás usuarios.

El catálogo de módulos y sus acciones se mantiene en un registro central del servidor, de modo que agregar un módulo nuevo solo requiere registrarlo ahí: la matriz de permisos y la configuración de menús lo incorporan automáticamente.

## Documentación disponible

El proyecto incluye documentación técnica en la carpeta `documentacion/`:

- Especificación de Requerimientos de Software bajo el estándar IEEE 830, en un proyecto LaTeX modular (archivo principal `main.tex`), con requerimientos funcionales y no funcionales, casos de uso, reglas de negocio y anexos técnicos.
- Diagrama de casos de uso en formato `.drawio`, importable directamente en draw.io (diagrams.net).

## Autor

David Alejandro Bonilla Caiza
Ingeniería de Software
Universidad de las Fuerzas Armadas ESPE
