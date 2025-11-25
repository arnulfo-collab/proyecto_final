/*
 * historial.js
 * Carga el historial de préstamos del usuario (alumno/maestro)
 * o historial global si el usuario es encargado.
 */

document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
});

console.log("historial.js cargado");

// =============================================================
// FUNCIÓN PRINCIPAL: Cargar historial según el tipo de usuario
// =============================================================
async function cargarHistorial() {
    console.log("Cargando historial...");
    
    const tbody = document.querySelector("#tablaHistorial tbody");
    if (!tbody) return;

    const id_usuario = localStorage.getItem("id_usuario");
    if (!id_usuario) {
        tbody.innerHTML = '<tr><td colspan="5">Error de sesión</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5">🔄 Cargando...</td></tr>';

    try {
        const response = await fetch(`php/historial.php?id_usuario=${id_usuario}`);
        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay historial</td></tr>';
            return;
        }

        data.forEach(registro => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${registro.id_prestamo}</td>
                <td>${registro.laboratorio}</td>
                <td>${new Date(registro.fecha_prestamo).toLocaleString('es-ES')}</td>
                <td><span class="estado-${registro.estado}">${registro.estado.toUpperCase()}</span></td>
                <td>${new Date(registro.fecha_solicitud).toLocaleString('es-ES')}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar historial</td></tr>';
    }
}

// ===========================================
// FUNCIÓN: Escapar HTML para seguridad
// ===========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
