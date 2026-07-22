// Constantes y configuración global del sistema
const APP = {
    nombre:         'Sistema Genérico',
    version:        '2.0.0',
    baseUrl:        'http://localhost:8080/NRC30713/Proyecto_pw/',
    api:            'http://localhost:8080/NRC30713/Proyecto_pw/servidor/',

    // Claves de almacenamiento en sessionStorage
    keys: {
        token:      'pw_token',
        usuario:    'pw_usuario',
        permisos:   'pw_permisos',
        menuData:   'pw_menu',
        frase:      'pw_frase',
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
    base:            '/NRC30713/Proyecto_pw/',
    login:           '/NRC30713/Proyecto_pw/paginas/auth/frmLogin.html',
    dashboard:       '/NRC30713/Proyecto_pw/paginas/dashboard/index.html',
    dashboardInicio: '/NRC30713/Proyecto_pw/paginas/dashboard/inicio.html',
    usuarios:        '/NRC30713/Proyecto_pw/paginas/usuarios/index.html',
    usuariosCrear:   '/NRC30713/Proyecto_pw/paginas/usuarios/frmCrear.html',
    usuariosEditar:  '/NRC30713/Proyecto_pw/paginas/usuarios/frmEditar.html',
    roles:           '/NRC30713/Proyecto_pw/paginas/roles/index.html',
    rolesCrear:      '/NRC30713/Proyecto_pw/paginas/roles/frmCrear.html',
    permisos:        '/NRC30713/Proyecto_pw/paginas/permisos/index.html',
    menu:            '/NRC30713/Proyecto_pw/paginas/menu/index.html',
    cambiarPassword: '/NRC30713/Proyecto_pw/paginas/perfil/frmCambiarPassword.html',
};

// Endpoints PHP (solo operaciones de BD)
const API = {
    dashboard: {
        estadisticas:   APP.api + 'dashboard/estadisticas.php',
        accesos:        APP.api + 'dashboard/accesos.php',
        accesosGuardar: APP.api + 'dashboard/accesos_guardar.php',
        frase:          APP.api + 'dashboard/frase.php',
    },
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
        listar:   APP.api + 'roles/listar.php',
        crear:    APP.api + 'roles/crear.php',
        editar:   APP.api + 'roles/editar.php',
        eliminar: APP.api + 'roles/eliminar.php',
    },
    permisos: {
        listar:  APP.api + 'permisos/listar.php',
        asignar: APP.api + 'permisos/asignar.php',
        frames:  APP.api + 'permisos/frames.php',
    },
    menu: {
        listar:         APP.api + 'menu/listar.php',
        miMenu:         APP.api + 'menu/mi_menu.php',
        organizar:      APP.api + 'menu/organizar.php',
        superCrear:     APP.api + 'menu/super_crear.php',
        superRenombrar: APP.api + 'menu/super_renombrar.php',
        superEliminar:  APP.api + 'menu/super_eliminar.php',
        configListar:   APP.api + 'menu/config_listar.php',
        configEstado:   APP.api + 'menu/config_estado.php',
        configCrear:    APP.api + 'menu/config_crear.php',
        configEditar:   APP.api + 'menu/config_editar.php',
        configEliminar: APP.api + 'menu/config_eliminar.php',
    },
    movimientos: {
        listar: APP.api + 'movimientos/listar.php',
    },
    inventario: {
        listar:   APP.api + 'inventario/listar.php',
        crear:    APP.api + 'inventario/crear.php',
        editar:   APP.api + 'inventario/editar.php',
        estado:   APP.api + 'inventario/estado.php',
        eliminar: APP.api + 'inventario/eliminar.php',
    },
    clientes: {
        listar:   APP.api + 'clientes/listar.php',
        crear:    APP.api + 'clientes/crear.php',
        editar:   APP.api + 'clientes/editar.php',
        estado:   APP.api + 'clientes/estado.php',
        eliminar: APP.api + 'clientes/eliminar.php',
    },
    perfil: {
        cambiarPassword: APP.api + 'perfil/cambiar_password.php',
        ver:             APP.api + 'perfil/ver.php',
    },
    frame2: {
        facturasListar:  APP.api + 'facturacion/facturas_listar.php',
        facturasCrear:   APP.api + 'facturacion/facturas_crear.php',
        facturasObtener: APP.api + 'facturacion/facturas_obtener.php',
        facturasPdf:     APP.api + 'facturacion/facturas_pdf.php',
        emisorObtener:   APP.api + 'facturacion/emisor_obtener.php',
        emisorGuardar:   APP.api + 'facturacion/emisor_guardar.php',
    },
};
