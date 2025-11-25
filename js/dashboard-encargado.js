// Lógica específica del dashboard del encargado

console.log("dashboard-encargado.js cargado");

// Variables globales para datos del servidor
let laboratoriosData = [];
let usuariosData = [];
let prestamosData = [];

// Inicialización del dashboard
document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard del encargado - DOM cargado");
    setTimeout(() => inicializarDashboard(), 200);
});

function inicializarDashboard() {
    console.log("Inicializando dashboard del encargado...");
    
    const verificarSecciones = () => {
        const secciones = document.querySelectorAll(".seccion");
        const estadisticasSeccion = document.getElementById('estadisticas');
        
        console.log("Secciones encontradas:", secciones.length);
        console.log("Seccion estadisticas existe:", !!estadisticasSeccion);
        
        if (secciones.length > 0 && estadisticasSeccion) {
            console.log("Secciones disponibles, cargando estadisticas...");
            mostrarSeccion('estadisticas');
            return true;
        }
        return false;
    };
    
    if (!verificarSecciones()) {
        setTimeout(() => verificarSecciones(), 500);
    }
}

function mostrarSeccion(seccion) {
    console.log('[DASHBOARD] Mostrando seccion:', seccion);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
    });

    // Mostrar la sección solicitada
    const seccionElement = document.getElementById(seccion);
    if (seccionElement) {
        seccionElement.style.display = 'block';
        console.log('[DASHBOARD] Seccion mostrada:', seccion);
    } else {
        console.error('[DASHBOARD] No se encontro la seccion:', seccion);
        return;
    }

    // Cargar contenido específico según la sección
    switch(seccion) {
        case 'estadisticas':
            cargarEstadisticas();
            break;
            
        case 'usuarios':
            console.log('[DASHBOARD] Cargando usuarios...');
            if (typeof cargarUsuarios === 'function') {
                cargarUsuarios();
            }
            break;
            
        case 'laboratorios':
            console.log('[DASHBOARD] Cargando laboratorios...');
            if (typeof recargarTablaLaboratorios === 'function') {
                recargarTablaLaboratorios();
            }
            break;
            
        case 'solicitudes':
            console.log('[DASHBOARD] Cargando solicitudes...');
            if (typeof cargarPrestamosEncargado === 'function') {
                cargarPrestamosEncargado();
            }
            break;
            
        case 'mantenimiento':
            console.log('[DASHBOARD] Iniciando seccion mantenimiento');
            
            if (typeof cargarMantenimientos === 'function') {
                cargarMantenimientos();
            }
            
            setTimeout(() => {
                if (typeof cargarLaboratoriosParaMantenimiento === 'function') {
                    cargarLaboratoriosParaMantenimiento();
                }
            }, 300);
            break;
    }
}

/**
 * Cargar estadísticas desde el servidor
 */
async function cargarEstadisticas() {
    console.log("Cargando estadisticas desde el servidor...");
    
    try {
        // Cargar datos reales del servidor
        await Promise.all([
            cargarLaboratoriosDelServidor(),
            cargarUsuariosDelServidor(),
            cargarPrestamosDelServidor()
        ]);
        
        // Actualizar números con datos reales
        actualizarNumeros();
        
        // Generar gráficas
        if (typeof Chart !== 'undefined') {
            setTimeout(generarGraficas, 300);
        }
        
    } catch (error) {
        console.error("Error cargando estadisticas:", error);
    }
}

/**
 * Cargar laboratorios del servidor
 */
async function cargarLaboratoriosDelServidor() {
    try {
        const response = await fetch('php/laboratorios_api.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            laboratoriosData = data;
            console.log("[DASHBOARD] Laboratorios cargados:", laboratoriosData.length);
        }
    } catch (error) {
        console.error("Error cargando laboratorios:", error);
        laboratoriosData = [];
    }
}

/**
 * Cargar usuarios del servidor
 */
async function cargarUsuariosDelServidor() {
    try {
        const response = await fetch('php/usuarios_obtener.php');
        const data = await response.json();
        
        // Corregido: verificar tanto "ok" como "status"
        if (data.usuarios && Array.isArray(data.usuarios)) {
            usuariosData = data.usuarios;
            console.log("[DASHBOARD] Usuarios cargados:", usuariosData.length);
        } else if (Array.isArray(data)) {
            usuariosData = data;
            console.log("[DASHBOARD] Usuarios cargados:", usuariosData.length);
        } else {
            console.warn("[DASHBOARD] No se encontraron usuarios en la respuesta:", data);
            usuariosData = [];
        }
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        usuariosData = [];
    }
}

/**
 * Cargar préstamos del servidor
 */
async function cargarPrestamosDelServidor() {
    try {
        const response = await fetch('php/prestamos_encargado.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
            prestamosData = data;
            console.log("[DASHBOARD] Prestamos cargados:", prestamosData.length);
        } else if (data.prestamos && Array.isArray(data.prestamos)) {
            prestamosData = data.prestamos;
            console.log("[DASHBOARD] Prestamos cargados:", prestamosData.length);
        } else {
            console.warn("[DASHBOARD] No se encontraron prestamos en la respuesta:", data);
            prestamosData = [];
        }
    } catch (error) {
        console.error("Error cargando prestamos:", error);
        prestamosData = [];
    }
}

/**
 * Actualizar números en las tarjetas
 */
function actualizarNumeros() {
    // Total laboratorios
    const totalLabs = document.getElementById('total-laboratorios');
    if (totalLabs) {
        totalLabs.textContent = laboratoriosData.length || 0;
    }
    
    // Total usuarios
    const totalUsuarios = document.getElementById('total-usuarios');
    if (totalUsuarios) {
        totalUsuarios.textContent = usuariosData.length || 0;
    }
    
    // Préstamos del mes actual
    const prestamosMes = document.getElementById('prestamos-mes');
    if (prestamosMes) {
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        
        const prestamosEsteMes = prestamosData.filter(p => {
            const fecha = new Date(p.fecha_prestamo || p.fecha_solicitud);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
        });
        
        prestamosMes.textContent = prestamosEsteMes.length || 0;
    }
    
    // Laboratorios disponibles
    const labsDisponibles = document.getElementById('labs-disponibles');
    if (labsDisponibles) {
        const disponibles = laboratoriosData.filter(l => l.estado === 'disponible');
        labsDisponibles.textContent = disponibles.length || 0;
    }
    
    console.log("[DASHBOARD] Numeros actualizados");
}

/**
 * Generar gráficas con datos reales
 */
function generarGraficas() {
    console.log("Generando graficas con datos reales...");
    
    // Destruir gráficas existentes antes de crear nuevas
    const canvasIds = [
        'grafica-laboratorios-estados',
        'grafica-prestamos-mes', 
        'grafica-usuarios-rol',
        'grafica-labs-populares'
    ];
    
    canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }
    });
    
    generarGraficaEstadosLabs();
    generarGraficaPrestamosMes();
    generarGraficaUsuariosRol();
    generarGraficaLabsPopulares();
}

/**
 * Gráfica de estados de laboratorios
 */
function generarGraficaEstadosLabs() {
    const ctx = document.getElementById('grafica-laboratorios-estados');
    if (!ctx) return;
    
    const estados = { disponible: 0, ocupado: 0, mantenimiento: 0 };
    
    laboratoriosData.forEach(lab => {
        if (estados.hasOwnProperty(lab.estado)) {
            estados[lab.estado]++;
        }
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Disponible', 'Ocupado', 'Mantenimiento'],
            datasets: [{
                data: [estados.disponible, estados.ocupado, estados.mantenimiento],
                backgroundColor: ['#28a745', '#007bff', '#ffc107']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

/**
 * Gráfica de préstamos por mes
 */
function generarGraficaPrestamosMes() {
    const ctx = document.getElementById('grafica-prestamos-mes');
    if (!ctx) return;
    
    // Contar préstamos por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const conteoMeses = new Array(12).fill(0);
    
    prestamosData.forEach(p => {
        const fecha = new Date(p.fecha_prestamo || p.fecha_solicitud);
        if (!isNaN(fecha.getTime())) {
            conteoMeses[fecha.getMonth()]++;
        }
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Prestamos',
                data: conteoMeses,
                borderColor: '#155724',
                backgroundColor: 'rgba(21, 87, 36, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

/**
 * Gráfica de usuarios por rol
 */
function generarGraficaUsuariosRol() {
    const ctx = document.getElementById('grafica-usuarios-rol');
    if (!ctx) return;
    
    const roles = { alumno: 0, maestro: 0, encargado: 0 };
    
    usuariosData.forEach(user => {
        if (roles.hasOwnProperty(user.rol)) {
            roles[user.rol]++;
        }
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Alumnos', 'Maestros', 'Encargados'],
            datasets: [{
                data: [roles.alumno, roles.maestro, roles.encargado],
                backgroundColor: ['#17a2b8', '#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

/**
 * Gráfica de laboratorios más populares
 */
function generarGraficaLabsPopulares() {
    const ctx = document.getElementById('grafica-labs-populares');
    if (!ctx) return;
    
    // Contar préstamos por laboratorio usando el nombre
    const conteoPorLab = {};
    
    prestamosData.forEach(p => {
        const labNombre = p.laboratorio || 'Desconocido';
        conteoPorLab[labNombre] = (conteoPorLab[labNombre] || 0) + 1;
    });
    
    // Convertir a array y ordenar por uso
    const labsConUso = Object.entries(conteoPorLab)
        .map(([nombre, usos]) => ({ nombre, usos }))
        .sort((a, b) => b.usos - a.usos)
        .slice(0, 5);
    
    // Si no hay datos, mostrar laboratorios sin uso
    if (labsConUso.length === 0) {
        laboratoriosData.slice(0, 5).forEach(lab => {
            labsConUso.push({ nombre: lab.nombre, usos: 0 });
        });
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labsConUso.map(l => l.nombre.length > 15 ? l.nombre.substring(0, 15) + '...' : l.nombre),
            datasets: [{
                label: 'Prestamos',
                data: labsConUso.map(l => l.usos),
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: { x: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

// Gestión de laboratorios
function mostrarFormLaboratorio() {
    const container = document.getElementById('formLaboratorioContainer');
    if (container) container.style.display = 'block';
}

function cancelarFormLaboratorio() {
    const container = document.getElementById('formLaboratorioContainer');
    const form = document.getElementById('formLaboratorio');
    if (container) container.style.display = 'none';
    if (form) form.reset();
}

console.log("Dashboard del encargado inicializado correctamente");

// Widget de ubicación
document.addEventListener('DOMContentLoaded', function() {
    const locationWidget = document.querySelector('.location-time-widget');
    if (locationWidget) {
        console.log('Widget de ubicacion detectado');
    }
});

// ===== ACTUALIZACIÓN AUTOMÁTICA (cada 30 segundos) =====
setInterval(function() {
    const seccionVisible = document.querySelector('.seccion:not([style*="display: none"])');
    if (!seccionVisible) return;
    
    const id = seccionVisible.id;
    
    switch(id) {
        case 'estadisticas':
            if (typeof cargarEstadisticas === 'function') cargarEstadisticas();
            break;
        case 'solicitudes':
            if (typeof cargarSolicitudesEncargado === 'function') cargarSolicitudesEncargado();
            break;
        case 'laboratorios':
            if (typeof recargarTablaLaboratorios === 'function') recargarTablaLaboratorios();
            break;
        case 'mantenimiento':
            if (typeof cargarMantenimientos === 'function') cargarMantenimientos();
            break;
        case 'usuarios':
            if (typeof cargarUsuarios === 'function') cargarUsuarios();
            break;
    }
}, 30000);