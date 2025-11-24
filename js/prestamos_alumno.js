// ===============================================
// SISTEMA DE PRÉSTAMOS PARA ALUMNOS (SOLO CONSULTA)
// ===============================================

/**
 * Cargar préstamos vigentes del alumno (solo autorizados y desde hoy)
 */
async function cargarPrestamosAlumno() {
    console.log("📅 Cargando préstamos vigentes del alumno...");
    
    try {
        const response = await fetch('php/prestamos_alumno.php?vigentes=1');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log("📄 Response recibido:", text.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            throw new Error('Respuesta no es JSON válido');
        }
        
        console.log("📦 Data parseada:", data);
        
        if (data.status === 'ok') {
            // Guardar todos los préstamos en variable global para búsqueda
            todosLosPrestamos = data.prestamos || [];
            mostrarPrestamosEnTabla(todosLosPrestamos);
        } else {
            throw new Error(data.mensaje || 'Error del servidor');
        }
        
    } catch (error) {
        console.error("❌ Error cargando préstamos:", error);
        mostrarErrorPrestamos('Error al cargar tus clases vigentes: ' + error.message);
    }
}

/**
 * Obtener clase CSS según el estado
 */
function obtenerClaseEstado(estado) {
    switch(estado.toLowerCase()) {
        case 'pendiente': return 'estado-pendiente';
        case 'autorizado': return 'estado-autorizado';
        case 'rechazado': return 'estado-rechazado';
        case 'activo': return 'estado-activo';
        default: return 'estado-pendiente';
    }
}

/**
 * Formatear fecha para mostrar
 */
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
        console.error("❌ Error formateando fecha:", error);
        return fechaString;
    }
}

/**
 * Capitalizar primera letra
 */
function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Mostrar error en tabla de préstamos
 */
function mostrarErrorPrestamos(mensaje) {
    const tbody = document.querySelector("#tablaPrestamos tbody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data" style="color: #721c24;">
                    <i>❌</i>
                    <div>${mensaje}</div>
                    <small>Por favor, recarga la página o contacta al administrador.</small>
                </td>
            </tr>
        `;
    }
}

console.log("✅ Sistema de préstamos para alumnos cargado (versión simplificada)");