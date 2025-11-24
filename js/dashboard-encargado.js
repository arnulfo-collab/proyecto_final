// Lógica específica del dashboard del encargado

// Variables globales para datos locales del dashboard (nombres únicos para evitar conflictos)
let laboratoriosLocal = [
    {id_laboratorio: 1, nombre: "Lab Computación A", ubicacion: "Edificio A - Piso 1", capacidad: 30, estado: "disponible"},
    {id_laboratorio: 2, nombre: "Lab Computación B", ubicacion: "Edificio A - Piso 2", capacidad: 25, estado: "disponible"}, 
    {id_laboratorio: 3, nombre: "Lab Química", ubicacion: "Edificio B - Piso 1", capacidad: 20, estado: "mantenimiento"},
    {id_laboratorio: 4, nombre: "Lab Física", ubicacion: "Edificio B - Piso 2", capacidad: 22, estado: "disponible"},
    {id_laboratorio: 5, nombre: "Lab Biología", ubicacion: "Edificio C - Piso 1", capacidad: 18, estado: "disponible"}
];

let usuariosLocal = [
    {id: 1, nombre: "Juan Pérez", correo: "juan@uabc.mx", rol: "alumno"},
    {id: 2, nombre: "María García", correo: "maria@uabc.mx", rol: "maestro"},
    {id: 3, nombre: "Pedro López", correo: "pedro@uabc.mx", rol: "alumno"},
    {id: 4, nombre: "Ana Rodríguez", correo: "ana@uabc.mx", rol: "maestro"},
    {id: 5, nombre: "Admin Sistema", correo: "admin@uabc.mx", rol: "encargado"},
    {id: 6, nombre: "Carlos Mendez", correo: "carlos@uabc.mx", rol: "encargado"}
];

// Inicialización del dashboard
document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard del encargado - DOM cargado");
    
    // Esperar un poco más para que otros scripts se carguen
    setTimeout(() => {
        inicializarDashboard();
    }, 200);
});

function inicializarDashboard() {
    console.log("Inicializando dashboard del encargado...");
    
    // Verificar que existan las secciones
    const verificarSecciones = () => {
        const secciones = document.querySelectorAll(".seccion");
        const estadisticasSeccion = document.getElementById('estadisticas');
        
        console.log("Secciones encontradas:", secciones.length);
        console.log("Sección estadísticas existe:", !!estadisticasSeccion);
        
        if (secciones.length > 0 && estadisticasSeccion) {
            console.log("Secciones disponibles, cargando estadísticas...");
            mostrarSeccion('estadisticas');
            return true;
        } else {
            console.log("Secciones aún no disponibles");
            return false;
        }
    };
    
    // Intentar cargar con reintentos
    if (!verificarSecciones()) {
        setTimeout(() => {
            if (!verificarSecciones()) {
                console.error("Error: No se encontraron las secciones del dashboard");
            }
        }, 500);
    }
}

function mostrarSeccion(nombre) {
    console.log(`Mostrando sección: ${nombre}`);
    
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll(".seccion");
    if (secciones.length === 0) {
        console.error("No se encontraron secciones");
        return;
    }
    
    secciones.forEach(seccion => {
        seccion.style.display = "none";
    });
    
    // Mostrar la sección seleccionada
    const seccionSeleccionada = document.getElementById(nombre);
    if (!seccionSeleccionada) {
        console.error(`Sección "${nombre}" no encontrada`);
        return;
    }
    
    seccionSeleccionada.style.display = "block";
    
    // Actualizar navegación
    document.querySelectorAll(".sidebar a").forEach(link => {
        link.classList.remove("active");
    });
    
    const botonActivo = document.querySelector(`[onclick="mostrarSeccion('${nombre}')"]`);
    if (botonActivo) {
        botonActivo.classList.add("active");
    }
    
    // Cargar contenido específico
    switch(nombre) {
        case 'estadisticas':
            cargarEstadisticas();
            break;
        case 'laboratorios':
            cargarLaboratoriosGestion();
            break;
        case 'solicitudes':
            if (typeof cargarPrestamosEncargado === 'function') {
                cargarPrestamosEncargado();
            }
            break;
        case 'usuarios':
            if (typeof cargarUsuarios === 'function') {
                cargarUsuarios();
            }
            break;
        case 'mantenimiento':
            if (typeof cargarMantenimientos === 'function') {
                cargarMantenimientos();
            }
            if (typeof cargarLaboratoriosParaMantenimiento === 'function') {
                cargarLaboratoriosParaMantenimiento();
            }
            break;
    }
}

function cargarEstadisticas() {
    console.log("Cargando estadísticas...");
    
    // Verificar Chart.js
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no disponible");
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                console.log("Chart.js ahora disponible, reintentando...");
                cargarEstadisticas();
            }
        }, 1000);
        return;
    }
    
    // Actualizar números
    actualizarNumeros();
    
    // Generar gráficas con delay
    setTimeout(generarGraficas, 300);
}

function actualizarNumeros() {
    const elementos = {
        'total-laboratorios': laboratoriosLocal.length,
        'total-usuarios': usuariosLocal.length,
        'prestamos-mes': 15,
        'labs-disponibles': laboratoriosLocal.filter(l => l.estado === 'disponible').length
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            console.log(`${id}: ${valor}`);
        } else {
            console.warn(`Elemento ${id} no encontrado`);
        }
    });
}

function generarGraficas() {
    console.log("Generando gráficas...");
    
    const graficas = [
        { id: 'grafica-laboratorios-estados', func: generarGraficaEstadosLabs },
        { id: 'grafica-prestamos-mes', func: generarGraficaPrestamosMes },
        { id: 'grafica-usuarios-rol', func: generarGraficaUsuariosRol },
        { id: 'grafica-labs-populares', func: generarGraficaLabsPopulares }
    ];
    
    graficas.forEach(({ id, func }) => {
        const canvas = document.getElementById(id);
        if (canvas) {
            console.log(`Generando gráfica: ${id}`);
            try {
                func();
            } catch (error) {
                console.error(`Error en gráfica ${id}:`, error);
            }
        } else {
            console.error(`Canvas ${id} no encontrado`);
        }
    });
}

function generarGraficaEstadosLabs() {
    const ctx = document.getElementById('grafica-laboratorios-estados');
    if (!ctx) return;
    
    const estados = { disponible: 0, mantenimiento: 0, fuera_servicio: 0 };
    laboratoriosLocal.forEach(lab => {
        estados[lab.estado] = (estados[lab.estado] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Disponible', 'Mantenimiento', 'Fuera de Servicio'],
            datasets: [{
                data: [estados.disponible, estados.mantenimiento, estados.fuera_servicio],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function generarGraficaPrestamosMes() {
    const ctx = document.getElementById('grafica-prestamos-mes');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Préstamos',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#155724',
                backgroundColor: 'rgba(21, 87, 36, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function generarGraficaUsuariosRol() {
    const ctx = document.getElementById('grafica-usuarios-rol');
    if (!ctx) return;
    
    const roles = { alumno: 0, maestro: 0, encargado: 0 };
    usuariosLocal.forEach(user => {
        roles[user.rol] = (roles[user.rol] || 0) + 1;
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

function generarGraficaLabsPopulares() {
    const ctx = document.getElementById('grafica-labs-populares');
    if (!ctx) return;
    
    const nombres = laboratoriosLocal.slice(0, 4).map(lab => lab.nombre);
    const usos = [25, 19, 15, 8];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombres,
            datasets: [{
                label: 'Usos este mes',
                data: usos,
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
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

function cargarLaboratoriosGestion() {
    console.log("Cargando gestión de laboratorios...");
    
    const tbody = document.querySelector("#tablaLaboratorios tbody");
    if (!tbody) {
        console.error("Tabla de laboratorios no encontrada");
        return;
    }
    
    tbody.innerHTML = "";
    
    if (laboratoriosLocal.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="font-size: 18px; font-weight: bold;">No hay laboratorios registrados</div>
                    <div style="font-size: 14px; color: #999;">Use el botón "Nuevo Laboratorio" para crear uno</div>
                </td>
            </tr>
        `;
        return;
    }
    
    laboratoriosLocal.forEach(lab => {
        const estadoColors = {
            'disponible': '#28a745',
            'mantenimiento': '#ffc107',
            'fuera_servicio': '#dc3545'
        };
        
        const estadoTextos = {
            'disponible': 'DISPONIBLE',
            'mantenimiento': 'MANTENIMIENTO',
            'fuera_servicio': 'FUERA DE SERVICIO'
        };
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td style="font-weight: bold;">${lab.id_laboratorio}</td>
            <td style="font-weight: bold;">${lab.nombre}</td>
            <td>${lab.ubicacion}</td>
            <td style="text-align: center;">${lab.capacidad}</td>
            <td style="text-align: center;">
                <span style="
                    background-color: ${estadoColors[lab.estado]}; 
                    color: white; 
                    padding: 6px 12px; 
                    border-radius: 15px; 
                    font-size: 11px; 
                    font-weight: bold;
                ">
                    ${estadoTextos[lab.estado]}
                </span>
            </td>
            <td style="text-align: center;">
                <select onchange="cambiarEstadoLab(${lab.id_laboratorio}, this.value)" style="margin-right: 5px; padding: 4px;">
                    <option value="">Cambiar estado...</option>
                    <option value="disponible" ${lab.estado === 'disponible' ? 'disabled' : ''}>Disponible</option>
                    <option value="mantenimiento" ${lab.estado === 'mantenimiento' ? 'disabled' : ''}>Mantenimiento</option>
                    <option value="fuera_servicio" ${lab.estado === 'fuera_servicio' ? 'disabled' : ''}>Fuera de Servicio</option>
                </select>
                <button class="btn btn-amarillo" onclick="editarLaboratorio(${lab.id_laboratorio})" style="margin-right: 5px;">
                    Editar
                </button>
                <button class="btn btn-rojo" onclick="eliminarLaboratorio(${lab.id_laboratorio})">
                    Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    console.log(`${laboratoriosLocal.length} laboratorios cargados`);
}

function cambiarEstadoLab(id, nuevoEstado) {
    if (!nuevoEstado) return;
    
    const lab = laboratoriosLocal.find(l => l.id_laboratorio === id);
    if (lab) {
        lab.estado = nuevoEstado;
        alert(`Estado del laboratorio "${lab.nombre}" cambiado a: ${nuevoEstado.toUpperCase()}`);
        cargarLaboratoriosGestion();
        
        // Actualizar estadísticas si estamos en esa vista
        const seccionEstadisticas = document.getElementById('estadisticas');
        if (seccionEstadisticas && seccionEstadisticas.style.display !== 'none') {
            actualizarNumeros();
            setTimeout(generarGraficas, 100);
        }
    }
}

function editarLaboratorio(id) {
    const lab = laboratoriosLocal.find(l => l.id_laboratorio === id);
    if (!lab) return alert('Laboratorio no encontrado');
    
    const nuevoNombre = prompt('Nombre:', lab.nombre);
    if (nuevoNombre === null) return;
    
    const nuevaUbicacion = prompt('Ubicación:', lab.ubicacion);
    if (nuevaUbicacion === null) return;
    
    const nuevaCapacidad = prompt('Capacidad:', lab.capacidad);
    if (nuevaCapacidad === null) return;
    
    if (nuevoNombre.trim() && nuevaUbicacion.trim() && nuevaCapacidad > 0) {
        lab.nombre = nuevoNombre.trim();
        lab.ubicacion = nuevaUbicacion.trim();
        lab.capacidad = parseInt(nuevaCapacidad);
        
        alert(`Laboratorio "${lab.nombre}" actualizado correctamente`);
        cargarLaboratoriosGestion();
    } else {
        alert('Datos inválidos');
    }
}

function eliminarLaboratorio(id) {
    const lab = laboratoriosLocal.find(l => l.id_laboratorio === id);
    if (!lab) return alert('Laboratorio no encontrado');
    
    if (confirm(`¿Eliminar el laboratorio "${lab.nombre}"?`)) {
        laboratoriosLocal = laboratoriosLocal.filter(l => l.id_laboratorio !== id);
        alert(`Laboratorio "${lab.nombre}" eliminado`);
        cargarLaboratoriosGestion();
        
        // Actualizar estadísticas
        const seccionEstadisticas = document.getElementById('estadisticas');
        if (seccionEstadisticas && seccionEstadisticas.style.display !== 'none') {
            actualizarNumeros();
            setTimeout(generarGraficas, 100);
        }
    }
}

function agregarNuevoUsuario() {
    console.log("Agregando nuevo usuario...");
    if (typeof mostrarFormularioNuevoUsuario === 'function') {
        mostrarFormularioNuevoUsuario();
    } else {
        alert('Función de agregar usuario no disponible');
    }
}

console.log("Dashboard del encargado inicializado correctamente");