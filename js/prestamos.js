// ===========================================
// prestamos.js
// ===========================================
console.log("prestamos.js cargado");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado en prestamos.js");
    
    // Cargar lista de laboratorios cuando abre el dashboard
    cargarLaboratorios();

    // Cargar la tabla con los préstamos del usuario
    cargarPrestamos();

    // Detectar cuando el maestro envía el formulario
    document.getElementById("formPrestamo").addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Obtener datos necesarios
        const id_usuario = localStorage.getItem("id_usuario"); // quien hace la solicitud
        const id_laboratorio = document.getElementById("laboratorio").value; // lab elegido
        const fecha_prestamo = document.getElementById("fechaPrestamo").value; // fecha seleccionada

        // Crear paquete de datos para mandar al backend
        const datos = new FormData();
        datos.append("id_usuario", id_usuario);
        datos.append("id_laboratorio", id_laboratorio);
        datos.append("fecha_prestamo", fecha_prestamo);

        // Enviar la solicitud al archivo prestamos.php
        const res = await fetch("php/prestamos.php", {
            method: "POST",
            body: datos
        });

        // Convertir respuesta a JSON
        const data = await res.json();

        // Mostrar mensaje del backend
        alert(data.mensaje);

        // Si todo salió bien, recargar la tabla de préstamos
        if (data.status === "ok") {
            cargarPrestamos();
        }
    });
});

// ===========================================
// FUNCIÓN: Cargar laboratorios en <select>
// ===========================================
async function cargarLaboratorios() {
    console.log("Cargando laboratorios...");
    
    const select = document.getElementById("laboratorio");
    if (!select) return;

    try {
        const response = await fetch("php/laboratorios.php");
        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        select.innerHTML = '<option value="">Seleccionar laboratorio...</option>';
        
        data.forEach(lab => {
            const option = document.createElement("option");
            option.value = lab.id_laboratorio;
            option.textContent = `${lab.nombre} - ${lab.ubicacion} (${lab.capacidad} personas)`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar laboratorios:", error);
        alert("Error al cargar laboratorios: " + error.message);
    }
}

// ===========================================
// FUNCIÓN: Enviar solicitud de préstamo
// ===========================================
async function enviarSolicitudPrestamo(e) {
    e.preventDefault();
    
    const id_usuario = localStorage.getItem("id_usuario");
    const laboratorio = document.getElementById("laboratorio").value;
    const fechaPrestamo = document.getElementById("fechaPrestamo").value;

    if (!id_usuario) {
        alert("Error de sesión. Inicie sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }

    if (!laboratorio || !fechaPrestamo) {
        alert("Complete todos los campos");
        return;
    }

    // Verificar fecha futura
    if (new Date(fechaPrestamo) <= new Date()) {
        alert("La fecha debe ser futura");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("id_laboratorio", laboratorio);
        formData.append("fecha_prestamo", fechaPrestamo);

        const response = await fetch("php/prestamos.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.status === "ok") {
            alert("¡Solicitud enviada! Espere aprobación del encargado.");
            document.getElementById("formPrestamo").reset();
        } else {
            alert("Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión");
    }
}

// ===========================================
// FUNCIÓN: Cargar préstamos del usuario
// ===========================================
async function cargarPrestamos() {
    console.log("Cargando préstamos...");
    
    const tbody = document.querySelector("#tablaPrestamos tbody");
    if (!tbody) return;

    const id_usuario = localStorage.getItem("id_usuario");
    if (!id_usuario) {
        tbody.innerHTML = '<tr><td colspan="5">Error de sesión</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5">🔄 Cargando...</td></tr>';

    try {
        const response = await fetch(`php/prestamos.php?id_usuario=${id_usuario}`);
        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay préstamos</td></tr>';
            return;
        }

        data.forEach(prestamo => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${prestamo.id_prestamo}</td>
                <td>${prestamo.laboratorio}</td>
                <td>${new Date(prestamo.fecha_prestamo).toLocaleString('es-ES')}</td>
                <td><span class="estado-${prestamo.estado}">${prestamo.estado.toUpperCase()}</span></td>
                <td>${new Date(prestamo.fecha_solicitud).toLocaleString('es-ES')}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
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

