/*
 * mantenimientos.js
 * Maneja:
 * - Cargar laboratorios para registrar mantenimiento
 * - Registrar mantenimiento
 * - Listar mantenimientos existentes
 * - Finalizar mantenimiento
 */

console.log("mantenimientos.js cargado");

document.addEventListener("DOMContentLoaded", () => {
    const formMantenimiento = document.getElementById("formMantenimiento");
    if (formMantenimiento) {
        formMantenimiento.addEventListener("submit", enviarMantenimiento);
    }
});

// =======================================
// FUNCIÓN: Cargar laboratorios para mantenimiento
// =======================================
async function cargarLaboratoriosParaMantenimiento() {
    console.log("Cargando laboratorios para mantenimiento...");
    
    const select = document.getElementById("mant_laboratorio");
    if (!select) {
        console.error("No se encontró el select de laboratorios");
        return;
    }

    try {
        // Usar parámetro para obtener TODOS los laboratorios
        const response = await fetch("php/laboratorios.php?para_mantenimiento=1");
        const data = await response.json();

        console.log("Laboratorios recibidos:", data);

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        select.innerHTML = '<option value="">Seleccionar laboratorio...</option>';
        
        const laboratorios = Array.isArray(data) ? data : [];
        
        if (laboratorios.length === 0) {
            select.innerHTML = '<option value="">No hay laboratorios disponibles</option>';
            return;
        }

        laboratorios.forEach(lab => {
            const option = document.createElement("option");
            option.value = lab.id_laboratorio;
            // Mostrar estado del laboratorio para que el encargado sepa su situación actual
            option.textContent = `${lab.nombre} - ${lab.ubicacion} (${lab.estado.toUpperCase()})`;
            select.appendChild(option);
        });

        console.log(`${laboratorios.length} laboratorios cargados para mantenimiento`);

    } catch (error) {
        console.error("Error al cargar laboratorios:", error);
        select.innerHTML = '<option value="">Error al cargar laboratorios</option>';
        alert("Error al cargar laboratorios: " + error.message);
    }
}

// =======================================
// FUNCIÓN: Enviar nuevo mantenimiento
// =======================================
async function enviarMantenimiento(e) {
    e.preventDefault();
    console.log("Enviando nuevo mantenimiento...");

    const formData = new FormData(e.target);
    
    // Validaciones básicas
    const laboratorio = formData.get("id_laboratorio");
    const tipo = formData.get("tipo");
    const descripcion = formData.get("descripcion");
    const fechaInicio = formData.get("fecha_inicio");
    const fechaFin = formData.get("fecha_fin");

    if (!laboratorio || !tipo || !descripcion || !fechaInicio || !fechaFin) {
        alert("Por favor complete todos los campos");
        return;
    }

    // Validar fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const ahora = new Date();
    
    if (inicio < ahora) {
        alert("La fecha de inicio no puede ser en el pasado");
        return;
    }
    
    if (fin <= inicio) {
        alert("La fecha de finalización debe ser posterior a la fecha de inicio");
        return;
    }

    try {
        const response = await fetch("php/mantenimiento.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.status === "ok") {
            alert("✅ Mantenimiento registrado correctamente");
            document.getElementById("formMantenimiento").reset();
            cargarMantenimientos();
        } else {
            alert("❌ Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("Error al enviar mantenimiento:", error);
        alert("❌ Error de conexión con el servidor");
    }
}

// =======================================
// FUNCIÓN: Cargar lista de mantenimientos
// =======================================
async function cargarMantenimientos() {
    console.log("Cargando lista de mantenimientos...");

    const tbody = document.querySelector("#tablaMantenimientos tbody");
    if (!tbody) {
        console.error("No se encontró la tabla de mantenimientos");
        return;
    }

    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">🔄 Cargando mantenimientos...</td></tr>';

    try {
        const response = await fetch("php/mantenimiento_listado.php");
        const data = await response.json();

        console.log("Mantenimientos recibidos:", data);

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        tbody.innerHTML = "";

        const mantenimientos = Array.isArray(data) ? data : [];
        
        if (mantenimientos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666; padding: 20px;">📝 No hay mantenimientos registrados aún</td></tr>';
            return;
        }

        mantenimientos.forEach(mant => {
            const fila = document.createElement('tr');
            
            // Determinar clase de estado
            let estadoClass = '';
            switch(mant.estado) {
                case 'en_progreso': estadoClass = 'estado-pendiente'; break;
                case 'finalizado': estadoClass = 'estado-autorizado'; break;
                case 'cancelado': estadoClass = 'estado-rechazado'; break;
                default: estadoClass = 'estado-pendiente';
            }
            
            fila.innerHTML = `
                <td>${mant.id_mantenimiento}</td>
                <td><strong>${escapeHtml(mant.laboratorio)}</strong></td>
                <td>
                    <span style="
                        background: #e9ecef; 
                        padding: 2px 8px; 
                        border-radius: 12px; 
                        font-size: 11px; 
                        color: #495057;
                    ">
                        ${escapeHtml(mant.tipo).toUpperCase()}
                    </span>
                </td>
                <td title="${escapeHtml(mant.descripcion)}">
                    ${escapeHtml(mant.descripcion).substring(0, 40)}${mant.descripcion.length > 40 ? '...' : ''}
                </td>
                <td>${new Date(mant.fecha_inicio).toLocaleString('es-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                })}</td>
                <td>${new Date(mant.fecha_fin).toLocaleString('es-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                })}</td>
                <td>
                    <span class="estado ${estadoClass}">
                        ${mant.estado.replace('_', ' ').toUpperCase()}
                    </span>
                </td>
                <td>
                    ${mant.estado === 'en_progreso' ? `
                        <button class="btn btn-verde" onclick="finalizarMantenimiento(${mant.id_mantenimiento})" title="Marcar como finalizado">
                            ✅ Finalizar
                        </button>
                    ` : '<span style="color: #6c757d; font-style: italic;">Sin acciones</span>'}
                </td>
            `;
            
            tbody.appendChild(fila);
        });

        console.log(`${mantenimientos.length} mantenimientos cargados correctamente`);

    } catch (error) {
        console.error("Error al cargar mantenimientos:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="color: red; text-align: center; padding: 20px;">
                    ❌ Error al cargar mantenimientos<br>
                    <small style="color: #666;">${error.message}</small>
                </td>
            </tr>
        `;
    }
}

// =======================================
// FUNCIÓN: Finalizar mantenimiento
// =======================================
async function finalizarMantenimiento(id_mantenimiento) {
    if (!confirm("¿Está seguro de marcar este mantenimiento como finalizado?\n\nEsto cambiará el estado del laboratorio a 'disponible'.")) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append("id_mantenimiento", id_mantenimiento);

        const response = await fetch("php/mantenimiento_finalizar.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Respuesta finalizar:", data);

        if (data.status === "ok") {
            alert("✅ Mantenimiento finalizado correctamente\n\nEl laboratorio está nuevamente disponible para préstamos.");
            cargarMantenimientos();
        } else {
            alert("❌ Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("Error al finalizar mantenimiento:", error);
        alert("❌ Error de conexión");
    }
}

// =======================================
// FUNCIÓN: Escapar HTML
// =======================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
