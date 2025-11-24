// =====================================================
// encargado.js
// Carga todos los préstamos y permite aprobar/rechazar.
// =====================================================

console.log("encargado.js cargado");

// =======================================
// FUNCIÓN: Cargar préstamos para encargado
// =======================================
async function cargarPrestamosEncargado() {
    console.log("Cargando préstamos para encargado...");
    
    const tbody = document.querySelector("#tablaEncargado tbody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7">🔄 Cargando...</td></tr>';

    try {
        const response = await fetch("php/prestamos_encargado.php");
        const data = await response.json();

        if (data.status === "error") {
            tbody.innerHTML = `<tr><td colspan="7">❌ ${data.mensaje}</td></tr>`;
            return;
        }

        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay solicitudes</td></tr>';
            return;
        }

        data.forEach(prestamo => {
            const fila = document.createElement('tr');
            if (prestamo.estado === 'pendiente') {
                fila.style.backgroundColor = '#fff3cd';
            }
            
            fila.innerHTML = `
                <td>${prestamo.id_prestamo}</td>
                <td>${prestamo.usuario}</td>
                <td>${prestamo.correo}</td>
                <td>${prestamo.laboratorio}</td>
                <td>${new Date(prestamo.fecha_prestamo).toLocaleString('es-ES')}</td>
                <td><span class="estado-${prestamo.estado}">${prestamo.estado.toUpperCase()}</span></td>
                <td>
                    ${prestamo.estado === 'pendiente' ? `
                        <button class="btn btn-verde" onclick="actualizarPrestamo(${prestamo.id_prestamo}, 'aprobar')">✅ Aprobar</button>
                        <button class="btn btn-rojo" onclick="actualizarPrestamo(${prestamo.id_prestamo}, 'rechazar')">❌ Rechazar</button>
                    ` : 'Sin acciones'}
                </td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="7">❌ Error de conexión</td></tr>';
    }
}

async function actualizarPrestamo(id_prestamo, accion) {
    if (!confirm(`¿${accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} este préstamo?`)) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append("accion", accion);
        formData.append("id_prestamo", id_prestamo);

        const response = await fetch("php/prestamos.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.status === "ok") {
            alert(data.mensaje);
            cargarPrestamosEncargado();
        } else {
            alert("Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión");
    }
}

// =======================================
// FUNCIÓN: Cargar laboratorios para gestión
// =======================================
async function cargarLaboratoriosGestion() {
    console.log("🔄 Cargando laboratorios para gestión...");
    
    const tbody = document.querySelector("#tablaLaboratorios tbody");
    if (!tbody) {
        console.error("❌ No se encontró #tablaLaboratorios tbody");
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🔄 Cargando laboratorios...</td></tr>';

    try {
        // Probar primero con laboratorios.php existente
        let url = "php/laboratorios.php?para_mantenimiento=1";
        
        console.log("📡 Intentando cargar desde:", url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        console.log("📊 Response status:", response.status);
        
        if (response.status === 404) {
            console.log("❌ 404 - Probando ruta alternativa...");
            // Probar ruta alternativa
            url = "php/laboratorios_gestion.php";
            const response2 = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin'
            });
            
            if (response2.status === 404) {
                throw new Error("No se encontraron los archivos PHP necesarios");
            }
            
            response = response2;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log("📄 Response preview:", text.substring(0, 200));
        
        if (text.trim().startsWith('<')) {
            throw new Error("El servidor devolvió HTML en lugar de JSON");
        }
        
        const data = JSON.parse(text);
        console.log("📦 Data:", data);

        if (data.status === "error") {
            throw new Error(data.mensaje);
        }

        tbody.innerHTML = "";

        const laboratorios = Array.isArray(data) ? data : [];
        console.log(`📋 ${laboratorios.length} laboratorios encontrados`);
        
        if (laboratorios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: #666;">
                        <div style="font-size: 48px; margin-bottom: 15px;">🔬</div>
                        <div style="font-size: 16px; margin-bottom: 10px;">No hay laboratorios registrados</div>
                        <div style="font-size: 14px; color: #888;">Use el botón "➕ Nuevo Laboratorio" para crear uno</div>
                    </td>
                </tr>
            `;
            return;
        }

        laboratorios.forEach((lab) => {
            const fila = document.createElement('tr');
            
            // Color del estado
            let estadoColor = '#6c757d';
            let estadoTexto = lab.estado.toUpperCase();
            
            switch(lab.estado) {
                case 'disponible': 
                    estadoColor = '#28a745'; 
                    estadoTexto = 'DISPONIBLE';
                    break;
                case 'mantenimiento': 
                    estadoColor = '#ffc107'; 
                    estadoTexto = 'MANTENIMIENTO';
                    break;
                case 'fuera_servicio': 
                    estadoColor = '#dc3545'; 
                    estadoTexto = 'FUERA DE SERVICIO';
                    break;
            }
            
            fila.innerHTML = `
                <td style="font-weight: bold; color: #495057;">${lab.id_laboratorio}</td>
                <td style="font-weight: bold;">${escapeHtml(lab.nombre)}</td>
                <td style="color: #6c757d;">${escapeHtml(lab.ubicacion)}</td>
                <td style="text-align: center; font-weight: bold;">${lab.capacidad}</td>
                <td style="text-align: center;">
                    <span style="
                        background-color: ${estadoColor}; 
                        color: white; 
                        padding: 6px 12px; 
                        border-radius: 15px; 
                        font-size: 11px; 
                        font-weight: bold;
                        letter-spacing: 0.5px;
                    ">
                        ${estadoTexto}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-amarillo" onclick="editarLaboratorio(${lab.id_laboratorio}, '${escapeHtml(lab.nombre)}', '${escapeHtml(lab.ubicacion)}', ${lab.capacidad}, '${lab.estado}')" style="margin-right: 5px;" title="Editar laboratorio">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-rojo" onclick="eliminarLaboratorio(${lab.id_laboratorio}, '${escapeHtml(lab.nombre)}')" title="Eliminar laboratorio">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        console.log(`✅ ${laboratorios.length} laboratorios cargados correctamente`);

    } catch (error) {
        console.error("❌ Error:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <div style="color: red; font-size: 18px; margin-bottom: 10px;">❌ Error al cargar laboratorios</div>
                    <div style="color: #666; margin-bottom: 15px;">${error.message}</div>
                    <button onclick="cargarLaboratoriosGestion()" style="
                        background: #007bff; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        🔄 Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

// =======================================
// FUNCIÓN: Guardar laboratorio (nuevo o editar)
// =======================================
async function guardarLaboratorio(e) {
    e.preventDefault();
    console.log("💾 Guardando laboratorio...");

    const formData = new FormData(e.target);
    
    // Validaciones básicas
    const nombre = formData.get("nombre");
    const ubicacion = formData.get("ubicacion");
    const capacidad = formData.get("capacidad");

    if (!nombre || !ubicacion || !capacidad || capacidad <= 0) {
        alert("Por favor complete todos los campos correctamente");
        return;
    }

    try {
        const response = await fetch("php/laboratorios_gestion.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("📦 Respuesta:", data);

        if (data.status === "ok") {
            alert("✅ " + data.mensaje);
            cancelarFormLaboratorio();
            cargarLaboratoriosGestion();
        } else {
            alert("❌ Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error de conexión: " + error.message);
    }
}

// =======================================
// FUNCIÓN: Editar laboratorio
// =======================================
function editarLaboratorio(id, nombre, ubicacion, capacidad, estado) {
    console.log("✏️ Editando laboratorio:", id);
    
    // Mostrar formulario
    document.getElementById('formLaboratorioContainer').style.display = 'block';
    
    // Llenar campos
    document.getElementById('lab_id_laboratorio').value = id;
    document.getElementById('lab_nombre').value = nombre;
    document.getElementById('lab_ubicacion').value = ubicacion;
    document.getElementById('lab_capacidad').value = capacidad;
    document.getElementById('lab_estado').value = estado;
    
    // Cambiar título
    document.querySelector('#formLaboratorioContainer h4').textContent = 'Editar Laboratorio';
    
    // Scroll al formulario
    document.getElementById('formLaboratorioContainer').scrollIntoView({behavior: 'smooth'});
}

// =======================================
// FUNCIÓN: Eliminar laboratorio
// =======================================
async function eliminarLaboratorio(id, nombre) {
    if (!confirm(`¿Está seguro de eliminar el laboratorio "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch("php/laboratorios_gestion.php", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_laboratorio=${id}`
        });

        const data = await response.json();

        if (data.status === "ok") {
            alert("✅ " + data.mensaje);
            cargarLaboratoriosGestion();
        } else {
            alert("❌ Error: " + data.mensaje);
        }

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error de conexión");
    }
}

// =======================================
// FUNCIÓN: Cancelar formulario
// =======================================
function cancelarFormLaboratorio() {
    document.getElementById('formLaboratorioContainer').style.display = 'none';
    document.getElementById('formLaboratorio').reset();
    document.getElementById('lab_id_laboratorio').value = '';
    document.querySelector('#formLaboratorioContainer h4').textContent = 'Nuevo Laboratorio';
}

// =======================================
// FUNCIÓN: Mostrar formulario nuevo
// =======================================
function mostrarFormLaboratorio() {
    cancelarFormLaboratorio(); // Limpiar primero
    document.getElementById('formLaboratorioContainer').style.display = 'block';
    document.getElementById('lab_nombre').focus();
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

// =======================================
// CONFIGURAR EVENTOS
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    // Configurar formulario de laboratorio
    const formLaboratorio = document.getElementById("formLaboratorio");
    if (formLaboratorio) {
        formLaboratorio.addEventListener("submit", guardarLaboratorio);
        console.log("✅ Formulario de laboratorio configurado");
    }
});

// =======================================
// GESTIÓN DE USUARIOS
// =======================================

async function cargarUsuarios() {
    console.log("🔄 Cargando usuarios...");
    
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) {
        console.error("❌ No se encontró #tablaUsuarios tbody");
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🔄 Cargando usuarios...</td></tr>';

    try {
        const response = await fetch("php/usuarios_obtener.php");
        
        console.log("📡 Response status:", response.status);
        console.log("📡 Response headers:", response.headers.get('content-type'));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log("📄 Response text (primeros 300 chars):", text.substring(0, 300));
        
        // Verificar si es HTML
        if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html>')) {
            console.error("❌ El servidor devolvió HTML:", text);
            throw new Error("El servidor devolvió HTML en lugar de JSON. Revisa el archivo PHP.");
        }
        
        // Verificar si está vacío
        if (!text.trim()) {
            throw new Error("El servidor devolvió una respuesta vacía");
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            console.error("❌ Texto que intentamos parsear:", text);
            throw new Error("El servidor no devolvió JSON válido: " + parseError.message);
        }
        
        console.log("📦 Usuarios data parseada:", data);

        if (data.status === "error") {
            throw new Error(data.mensaje || "Error desconocido del servidor");
        }

        if (data.status !== "ok") {
            throw new Error("Respuesta del servidor inválida");
        }

        tbody.innerHTML = "";

        const usuarios = data.usuarios || [];
        console.log(`📋 Procesando ${usuarios.length} usuarios`);
        
        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 20px;">👥</div>
                        <div style="font-size: 18px; margin-bottom: 10px; font-weight: bold;">No hay usuarios registrados</div>
                        <div style="font-size: 14px; color: #999;">Use el botón "➕ Nuevo Usuario" para crear uno</div>
                    </td>
                </tr>
            `;
            return;
        }

        usuarios.forEach((usuario) => {
            const fila = document.createElement('tr');
            
            // Color del rol
            let rolColor = '#6c757d';
            let rolTexto = usuario.rol.toUpperCase();
            
            switch(usuario.rol) {
                case 'alumno':
                    rolColor = '#17a2b8';
                    rolTexto = '🎓 ALUMNO';
                    break;
                case 'maestro':
                    rolColor = '#28a745';
                    rolTexto = '👨‍🏫 MAESTRO';
                    break;
                case 'encargado':
                    rolColor = '#dc3545';
                    rolTexto = '👑 ENCARGADO';
                    break;
            }
            
            fila.innerHTML = `
                <td style="font-weight: bold; color: #495057;">${usuario.id_usuario}</td>
                <td style="font-weight: bold; color: #212529;">${escapeHtml(usuario.nombre)}</td>
                <td style="color: #6c757d;">${escapeHtml(usuario.correo)}</td>
                <td style="text-align: center;">
                    <span style="
                        background-color: ${rolColor}; 
                        color: white; 
                        padding: 6px 12px; 
                        border-radius: 15px; 
                        font-size: 11px; 
                        font-weight: bold;
                        letter-spacing: 0.5px;
                    ">
                        ${rolTexto}
                    </span>
                </td>
                <td style="color: #6c757d; text-align: center;">${usuario.fecha_registro || 'N/A'}</td>
                <td style="text-align: center;">
                    <button class="btn btn-amarillo" onclick="editarUsuario(${usuario.id_usuario})" style="margin-right: 5px;" title="Editar usuario">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-rojo" onclick="eliminarUsuario(${usuario.id_usuario})" title="Eliminar usuario">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            
            tbody.appendChild(fila);
        });

        console.log(`✅ ${usuarios.length} usuarios cargados correctamente`);

    } catch (error) {
        console.error("❌ Error completo:", error);
        
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: #dc3545; font-size: 24px; margin-bottom: 15px;">❌</div>
                    <div style="color: #dc3545; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                        Error al cargar usuarios
                    </div>
                    <div style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        ${error.message}
                    </div>
                    <div style="color: #888; font-size: 12px; margin-bottom: 20px;">
                        Verifica que el archivo php/usuarios_obtener.php existe y funciona correctamente.
                    </div>
                    <button onclick="cargarUsuarios()" style="
                        background: #007bff; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        🔄 Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

// Función para mostrar gestión de usuarios
function mostrarGestionUsuarios() {
    console.log("Mostrando gestión de usuarios");
    
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.style.display = 'none';
    });
    
    // Mostrar la sección de gestión de usuarios
    const seccion = document.getElementById('gestion-usuarios');
    if (seccion) {
        seccion.style.display = 'block';
        cargarUsuarios();
    } else {
        console.error("❌ No se encontró la sección de gestión de usuarios");
    }
}

// Función para agregar nuevo usuario
function agregarNuevoUsuario() {
    mostrarFormularioUsuario(null);
}

// Función para editar usuario
async function editarUsuario(id_usuario) {
    console.log(`✏️ Editando usuario ${id_usuario}`);
    
    try {
        const response = await fetch(`php/usuarios_obtener.php?id=${id_usuario}`);
        const text = await response.text();
        
        if (text.includes('<html>')) {
            throw new Error('Error del servidor');
        }
        
        const result = JSON.parse(text);
        
        if (result.status !== 'ok') {
            throw new Error(result.mensaje);
        }
        
        mostrarFormularioUsuario(result.usuario);
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar datos del usuario: ' + error.message);
    }
}

// Función para mostrar formulario de usuario
function mostrarFormularioUsuario(usuario) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
        align-items: center; justify-content: center; overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; margin: 20px;">
            <h3 style="margin-bottom: 20px; color: #495057;">
                ${usuario ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
            </h3>
            <form id="formEditarUsuario">
                <input type="hidden" name="id_usuario" value="${usuario?.id_usuario || ''}">
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre completo:</label>
                    <input type="text" name="nombre" value="${usuario?.nombre || ''}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" 
                           placeholder="Ej: Juan Pérez García" required>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Correo institucional:</label>
                    <input type="email" name="correo" value="${usuario?.correo || ''}" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" 
                           placeholder="usuario@uabc.edu.mx" pattern=".*@uabc\\.edu\\.mx" required>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Rol:</label>
                    <select name="rol" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                        <option value="">Seleccione un rol...</option>
                        <option value="alumno" ${usuario?.rol === 'alumno' ? 'selected' : ''}>🎓 Alumno</option>
                        <option value="maestro" ${usuario?.rol === 'maestro' ? 'selected' : ''}>👨‍🏫 Maestro</option>
                        <option value="encargado" ${usuario?.rol === 'encargado' ? 'selected' : ''}>👑 Encargado</option>
                    </select>
                </div>
                
                ${!usuario ? `
                <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
                    <small style="color: #1976d2;">
                        📝 <strong>Nota:</strong> La contraseña inicial será <code>123456</code>. 
                        El usuario podrá cambiarla después del primer ingreso.
                    </small>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <button type="submit" style="
                        background: #28a745; color: white; padding: 12px 24px; 
                        border: none; border-radius: 5px; margin-right: 10px; cursor: pointer; font-weight: bold;
                    ">💾 Guardar</button>
                    <button type="button" onclick="cerrarModalUsuario()" style="
                        background: #6c757d; color: white; padding: 12px 24px; 
                        border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
                    ">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.modalUsuarioActual = modal;
    
    // Configurar evento del formulario
    document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarUsuario(e.target);
    });
}

// Función para cerrar modal de usuario
function cerrarModalUsuario() {
    if (window.modalUsuarioActual) {
        document.body.removeChild(window.modalUsuarioActual);
        window.modalUsuarioActual = null;
    }
}

// Función para guardar usuario
async function guardarUsuario(form) {
    try {
        const formData = new FormData(form);
        const isEditing = formData.get('id_usuario') !== '';
        
        const endpoint = isEditing ? 'php/usuarios_actualizar.php' : 'php/usuarios_registrar.php';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        
        if (text.includes('<html>')) {
            throw new Error('Error del servidor');
        }
        
        const data = JSON.parse(text);
        
        if (data.status === 'ok') {
            alert('✅ ' + data.mensaje);
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert('❌ Error: ' + data.mensaje);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar usuario: ' + error.message);
    }
}

// Función para eliminar usuario
async function eliminarUsuario(id_usuario) {
    if (!confirm('¿Está seguro de eliminar este usuario?\n\nEsta acción eliminará también todos sus préstamos y no se puede deshacer.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id_usuario', id_usuario);
        
        const response = await fetch('php/usuarios_eliminar.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        const data = JSON.parse(text);
        
        if (data.status === 'ok') {
            alert('✅ ' + data.mensaje);
            cargarUsuarios();
        } else {
            alert('❌ Error: ' + data.mensaje);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar usuario: ' + error.message);
    }
}
