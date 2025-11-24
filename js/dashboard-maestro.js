// Lógica específica del dashboard del maestro

document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard del maestro iniciado");
    mostrarSeccion('solicitar');
    configurarFormulario();
});

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
        switch(nombre) {
            case 'solicitar':
                if (typeof cargarLaboratorios === 'function') {
                    cargarLaboratorios();
                }
                break;
            case 'misPrestamos':
                if (typeof cargarPrestamos === 'function') {
                    cargarPrestamos();
                }
                break;
            case 'historial':
                if (typeof cargarHistorial === 'function') {
                    cargarHistorial();
                }
                break;
        }
    } else {
        console.error("Sección no encontrada:", nombre);
    }
}

function configurarFormulario() {
    const form = document.getElementById('formPrestamo');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Configurar tipo de grupo si existe
    const tipoGrupo = document.getElementById('tipoGrupo');
    if (tipoGrupo) {
        tipoGrupo.addEventListener('change', manejarTipoGrupo);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log("Enviando formulario de préstamo...");
    
    const formData = new FormData(e.target);
    
    // Validaciones básicas
    if (!formData.get('laboratorio')) {
        mostrarMensaje('Por favor selecciona un laboratorio', 'error');
        return;
    }
    
    if (!formData.get('fechaPrestamo')) {
        mostrarMensaje('Por favor selecciona fecha y hora', 'error');
        return;
    }
    
    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(formData.get('fechaPrestamo'));
    const ahora = new Date();
    
    if (fechaSeleccionada <= ahora) {
        mostrarMensaje('La fecha debe ser en el futuro', 'error');
        return;
    }
    
    try {
        // Deshabilitar botón de envío
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const textoOriginal = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        const response = await fetch('php/prestamos.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        console.log("Response:", text);
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            throw new Error('Respuesta del servidor inválida');
        }
        
        if (result.status === 'ok') {
            mostrarMensaje('Solicitud enviada correctamente', 'success');
            e.target.reset();
            resetearCamposDinamicos();
        } else {
            mostrarMensaje('Error: ' + (result.mensaje || 'Error desconocido'), 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Solicitud';
    }
}

function manejarTipoGrupo() {
    const tipo = document.getElementById('tipoGrupo').value;
    const grupoGrupal = document.getElementById('grupoGrupal');
    const grupoIndividual = document.getElementById('grupoIndividual');
    
    if (grupoGrupal) {
        grupoGrupal.style.display = tipo === 'grupal' ? 'block' : 'none';
    }
    
    if (grupoIndividual) {
        grupoIndividual.style.display = tipo === 'individual' ? 'block' : 'none';
    }
    
    // Configurar campos requeridos
    configurarCamposRequeridos(tipo);
}

function configurarCamposRequeridos(tipo) {
    const camposGrupales = ['nombreGrupo', 'descripcionGrupo'];
    const camposIndividuales = ['alumnoEspecifico', 'motivoIndividual'];
    
    camposGrupales.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.required = tipo === 'grupal';
    });
    
    camposIndividuales.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.required = tipo === 'individual';
    });
}

function resetearCamposDinamicos() {
    const grupoGrupal = document.getElementById('grupoGrupal');
    const grupoIndividual = document.getElementById('grupoIndividual');
    const resultados = document.getElementById('resultadosAlumnos');
    const idAlumno = document.getElementById('idAlumnoSeleccionado');
    
    if (grupoGrupal) grupoGrupal.style.display = 'none';
    if (grupoIndividual) grupoIndividual.style.display = 'none';
    if (resultados) resultados.style.display = 'none';
    if (idAlumno) idAlumno.value = '';
}

// Búsqueda de alumnos (si existe el campo)
let timeoutBusqueda;
function buscarAlumno() {
    clearTimeout(timeoutBusqueda);
    
    timeoutBusqueda = setTimeout(async () => {
        const texto = document.getElementById('alumnoEspecifico')?.value;
        const resultados = document.getElementById('resultadosAlumnos');
        
        if (!texto || texto.length < 2) {
            if (resultados) resultados.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`php/buscar_alumnos.php?q=${encodeURIComponent(texto)}`);
            const data = await response.json();
            
            if (data.status === 'ok' && data.alumnos.length > 0) {
                mostrarResultadosAlumnos(data.alumnos);
            } else {
                if (resultados) {
                    resultados.innerHTML = '<div class="resultado-alumno">No se encontraron alumnos</div>';
                    resultados.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error buscando alumnos:', error);
            if (resultados) resultados.style.display = 'none';
        }
    }, 300);
}

function mostrarResultadosAlumnos(alumnos) {
    const resultados = document.getElementById('resultadosAlumnos');
    if (!resultados) return;
    
    resultados.innerHTML = alumnos.map(alumno => `
        <div class="resultado-alumno" onclick="seleccionarAlumno(${alumno.id_usuario}, '${escapeHtml(alumno.nombre)}', '${escapeHtml(alumno.correo)}')">
            <div class="alumno-nombre">${escapeHtml(alumno.nombre)}</div>
            <div class="alumno-correo">${escapeHtml(alumno.correo)}</div>
        </div>
    `).join('');
    
    resultados.style.display = 'block';
}

function seleccionarAlumno(id, nombre, correo) {
    const campoAlumno = document.getElementById('alumnoEspecifico');
    const campoId = document.getElementById('idAlumnoSeleccionado');
    const resultados = document.getElementById('resultadosAlumnos');
    
    if (campoAlumno) campoAlumno.value = `${nombre} (${correo})`;
    if (campoId) campoId.value = id;
    if (resultados) resultados.style.display = 'none';
}

// Funciones auxiliares
function mostrarMensaje(mensaje, tipo = 'info') {
    // Por ahora usar alert, pero se puede mejorar con toast notifications
    alert(mensaje);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log("Dashboard del maestro inicializado");