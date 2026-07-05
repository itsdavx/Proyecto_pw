// Constantes y configuración global del sistema
const APP = {
    nombre:         'Sistema Empresarial',
    version:        '1.0.0',
    baseUrl:        'http://localhost:8080/NRC30713-Web/Proyecto_pw/',
    api:            'http://localhost:8080/NRC30713-Web/Proyecto_pw/servidor/',

    // Claves de almacenamiento en sessionStorage
    keys: {
        token:      'pw_token',
        usuario:    'pw_usuario',
        permisos:   'pw_permisos',
        menuData:   'pw_menu',
    },

    // Seguridad
    maxIntentos:    5,
    bloqueoMs:      15 * 60 * 1000,    // 15 minutos en ms
    sessionMs:      60 * 60 * 1000,    // 60 minutos en ms
    captchaExpMs:   5  * 60 * 1000,    // 5  minutos en ms

    // Política de contraseña
    passMinLength:  8,
};

// Rutas relativas a cada página HTML
const RUTAS = {
    login:           '/NRC30713-Web/Proyecto_pw/paginas/auth/frmLogin.html',
    dashboard:       '/NRC30713-Web/Proyecto_pw/paginas/dashboard/index.html',
    usuarios:        '/NRC30713-Web/Proyecto_pw/paginas/usuarios/index.html',
    usuariosCrear:   '/NRC30713-Web/Proyecto_pw/paginas/usuarios/frmCrear.html',
    usuariosEditar:  '/NRC30713-Web/Proyecto_pw/paginas/usuarios/frmEditar.html',
    roles:           '/NRC30713-Web/Proyecto_pw/paginas/roles/index.html',
    rolesCrear:      '/NRC30713-Web/Proyecto_pw/paginas/roles/frmCrear.html',
    permisos:        '/NRC30713-Web/Proyecto_pw/paginas/permisos/index.html',
    menu:            '/NRC30713-Web/Proyecto_pw/paginas/menu/index.html',
    menuCrear:       '/NRC30713-Web/Proyecto_pw/paginas/menu/frmCrear.html',
    opciones:        '/NRC30713-Web/Proyecto_pw/paginas/opciones/index.html',
    cambiarPassword: '/NRC30713-Web/Proyecto_pw/paginas/perfil/frmCambiarPassword.html',
};

// Endpoints PHP (solo operaciones de BD)
const API = {
    auth: {
        login:           APP.api + 'auth/login.php',
        logout:          APP.api + 'auth/logout.php',
        verificarSesion: APP.api + 'auth/verificar_sesion.php',
    },
    usuarios: {
        listar:  APP.api + 'usuarios/listar.php',
        crear:   APP.api + 'usuarios/crear.php',
        editar:  APP.api + 'usuarios/editar.php',
        estado:  APP.api + 'usuarios/estado.php',
    },
    roles: {
        listar:  APP.api + 'roles/listar.php',
        crear:   APP.api + 'roles/crear.php',
        editar:  APP.api + 'roles/editar.php',
    },
    permisos: {
        listar:  APP.api + 'permisos/listar.php',
        asignar: APP.api + 'permisos/asignar.php',
    },
    menu: {
        listar:   APP.api + 'menu/listar.php',
        crear:    APP.api + 'menu/crear.php',
        editar:   APP.api + 'menu/editar.php',
        eliminar: APP.api + 'menu/eliminar.php',
    },
    opciones: {
        listar:   APP.api + 'opciones/listar.php',
        crear:    APP.api + 'opciones/crear.php',
        eliminar: APP.api + 'opciones/eliminar.php',
    },
    perfil: {
        cambiarPassword: APP.api + 'perfil/cambiar_password.php',
    },
};
