// =======================================
// FUNCIONES PRINCIPALES DEL DASHBOARD
// =======================================

/**
 * Mostrar sección específica del dashboard
 */
function mostrarSeccion(nombre) {
    console.log("Mostrando sección:", nombre);
    
    // Ocultar todas las secciones
    document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");
    
    // Mostrar la sección seleccionada
    const seccion = document.getElementById(nombre);
    if (seccion) {
        seccion.style.display = "block";
        
        // Cargar datos específicos según la sección
        switch(nombre) {
            case 'solicitudes':
                if (typeof cargarPrestamosEncargado === 'function') {
                    cargarPrestamosEncargado();
                }
                break;
                
            case 'laboratorios':
                if (typeof cargarLaboratoriosGestion === 'function') {
                    cargarLaboratoriosGestion();
                }
                break;
                
            case 'mantenimiento':
                console.log("Cargando datos de mantenimiento...");
                if (typeof cargarMantenimientos === 'function') {
                    cargarMantenimientos();
                }
                if (typeof cargarLaboratoriosParaMantenimiento === 'function') {
                    cargarLaboratoriosParaMantenimiento();
                }
                break;
                
            case 'usuarios':
                if (typeof cargarUsuarios === 'function') {
                    cargarUsuarios();
                }
                break;
        }
    } else {
        console.error("Sección no encontrada:", nombre);
    }
}

/**
 * Funciones para formularios de laboratorios
 */
function mostrarFormLaboratorio() {
    const form = document.getElementById('formLaboratorioContainer');
    if (form) {
        form.style.display = 'block';
    }
}

function cancelarFormLaboratorio() {
    const form = document.getElementById('formLaboratorioContainer');
    if (form) {
        form.style.display = 'none';
    }
    const formElement = document.getElementById('formLaboratorio');
    if (formElement) {
        formElement.reset();
    }
}

console.log("✅ Funciones principales del dashboard cargadas");