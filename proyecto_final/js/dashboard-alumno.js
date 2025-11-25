// Lógica específica del dashboard del alumno

// Variable global para almacenar todos los préstamos
let todosLosPrestamos = [];

function mostrarSeccion(nombre) {
    console.log("Mostrando sección:", nombre);
    
    // Remover clase active de todos los enlaces
    document.querySelectorAll(".sidebar a").forEach(link => {
        link.classList.remove("active");
    });
    
    // Ocultar todas las secciones
    document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");
    
    // Mostrar la sección seleccionada
    const seccion = document.getElementById(nombre);
    if (seccion) {
        seccion.style.display = "block";
        
        // Agregar clase active al enlace correspondiente
        const enlaceActivo = document.querySelector(`[onclick="mostrarSeccion('${nombre}')"]`);
        if (enlaceActivo) {
            enlaceActivo.classList.add("active");
        }
        
        // Cargar datos específicos según la sección
        if (nombre === 'misPrestamos') {
            console.log("Cargando préstamos vigentes del alumno...");
            cargarPrestamosAlumno();
        }
    } else {
        console.error("Sección no encontrada:", nombre);
    }
}

/**
 * Buscar préstamos por nombre del maestro
 */
function buscarPorMaestro() {
    const termino = document.getElementById('searchMaestro').value.toLowerCase().trim();
    console.log("Buscando por maestro:", termino);
    
    if (!todosLosPrestamos || todosLosPrestamos.length === 0) {
        console.log("No hay datos para buscar");
        return;
    }
    
    let prestamosFiltrados;
    
    if (termino === '') {
        // Si no hay término, mostrar todos
        prestamosFiltrados = todosLosPrestamos;
    } else {
        // Filtrar por nombre del maestro
        prestamosFiltrados = todosLosPrestamos.filter(prestamo => 
            prestamo.nombre_maestro.toLowerCase().includes(termino)
        );
    }
    
    console.log(`Encontrados ${prestamosFiltrados.length} resultados`);
    mostrarPrestamosEnTabla(prestamosFiltrados);
}

/**
 * Limpiar búsqueda
 */
function limpiarBusqueda() {
    document.getElementById('searchMaestro').value = '';
    console.log("Limpiando búsqueda");
    
    // Mostrar todos los préstamos
    mostrarPrestamosEnTabla(todosLosPrestamos);
}

/**
 * Función para mostrar préstamos en la tabla (usada por prestamos_alumno.js)
 */
function mostrarPrestamosEnTabla(prestamos) {
    const tbody = document.querySelector("#tablaPrestamos tbody");
    
    if (!tbody) {
        console.error("Tabla de préstamos no encontrada");
        return;
    }
    
    console.log("Mostrando", prestamos.length, "préstamos en tabla");
    
    if (prestamos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    <div>No se encontraron clases vigentes.</div>
                    <small>Intenta buscar por otro maestro o verifica que tengas clases programadas.</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamos.map(prestamo => {
        const estadoClass = obtenerClaseEstado(prestamo.estado);
        const fechaFormateada = formatearFecha(prestamo.fecha_prestamo);
        
        // Determinar tipo de clase
        let tipoClase = 'Grupal';
        if (prestamo.tipo_prestamo === 'individual') {
            tipoClase = 'Individual';
        } else if (prestamo.nombre_grupo) {
            tipoClase = prestamo.nombre_grupo;
        }
        
        return `
            <tr>
                <td>${prestamo.id_prestamo}</td>
                <td><strong>${prestamo.nombre_laboratorio}</strong><br>
                    <small>${prestamo.ubicacion || 'Ubicación no especificada'}</small></td>
                <td>${prestamo.nombre_maestro}</td>
                <td>${fechaFormateada}</td>
                <td><span class="estado ${estadoClass}">${capitalizar(prestamo.estado)}</span></td>
                <td>${tipoClase}</td>
            </tr>
        `;
    }).join('');
}

// Funciones auxiliares
function obtenerClaseEstado(estado) {
    switch(estado.toLowerCase()) {
        case 'pendiente': return 'estado-pendiente';
        case 'autorizado': return 'estado-autorizado';
        case 'rechazado': return 'estado-rechazado';
        case 'activo': return 'estado-activo';
        default: return 'estado-pendiente';
    }
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'No especificada';
    
    try {
        const fecha = new Date(fechaString);
        const opciones = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
        console.error("Error formateando fecha:", error);
        return fechaString;
    }
}

function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard del alumno cargado");
    mostrarSeccion('misPrestamos');
});

console.log("Dashboard del alumno inicializado");