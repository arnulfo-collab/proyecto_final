// ===============================================
// GESTIÓN DE USUARIOS PARA ENCARGADOS
// ===============================================

/**
 * Cargar usuarios desde el servidor
 */
async function cargarUsuarios() {
    console.log("🔄 Cargando usuarios desde servidor...");
    
    try {
        const response = await fetch('php/usuarios_obtener.php');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log("📄 Response recibido:", text.substring(0, 200));
        
        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            console.error("❌ Respuesta completa:", text);
            throw new Error('El servidor no devolvió JSON válido');
        }
        
        console.log("📦 Data parseada:", data);
        
        if (data.status === 'ok') {
            mostrarUsuariosEnTabla(data.usuarios || []);
        } else {
            throw new Error(data.mensaje || 'Error desconocido del servidor');
        }
        
    } catch (error) {
        console.error("❌ Error cargando usuarios:", error);
        mostrarErrorUsuarios('Error al cargar usuarios: ' + error.message);
    }
}

/**
 * Mostrar usuarios en la tabla
 */
function mostrarUsuariosEnTabla(usuarios) {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    
    if (!tbody) {
        console.error("❌ Tabla de usuarios no encontrada");
        return;
    }
    
    console.log("👥 Mostrando", usuarios.length, "usuarios en tabla");
    
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
    
    tbody.innerHTML = usuarios.map(usuario => {
        // Color del rol
        let rolColor = '#6c757d';
        let rolTexto = usuario.rol.toUpperCase();
        
        switch(usuario.rol) {
            case 'alumno':
                rolColor = '#17a2b8';
                rolTexto = '👨‍🎓 ALUMNO';
                break;
            case 'maestro':
                rolColor = '#28a745';
                rolTexto = '👨‍🏫 MAESTRO';
                break;
            case 'encargado':
                rolColor = '#dc3545';
                rolTexto = '👨‍💼 ENCARGADO';
                break;
        }
        
        return `
            <tr>
                <td style="font-weight: bold; color: #495057; padding: 12px;">${usuario.id_usuario}</td>
                <td style="font-weight: bold; color: #212529; padding: 12px;">${usuario.nombre}</td>
                <td style="color: #6c757d; padding: 12px;">${usuario.correo}</td>
                <td style="text-align: center; padding: 12px;">
                    <span style="
                        background-color: ${rolColor}; 
                        color: white; 
                        padding: 6px 12px; 
                        border-radius: 15px; 
                        font-size: 11px; 
                        font-weight: bold;
                        letter-spacing: 0.5px;
                        display: inline-block;
                    ">
                        ${rolTexto}
                    </span>
                </td>
                <td style="color: #6c757d; text-align: center; padding: 12px;">${usuario.fecha_registro}</td>
                <td style="text-align: center; padding: 12px;">
                    <button onclick="editarUsuario(${usuario.id_usuario})" style="
                        background: #ffc107; 
                        color: #212529; 
                        border: none; 
                        padding: 6px 12px; 
                        margin-right: 5px; 
                        border-radius: 4px; 
                        cursor: pointer; 
                        font-weight: bold;
                        font-size: 12px;
                    " title="Editar usuario">
                        ✏️ Editar
                    </button>
                    <button onclick="eliminarUsuario(${usuario.id_usuario})" style="
                        background: #dc3545; 
                        color: white; 
                        border: none; 
                        padding: 6px 12px; 
                        border-radius: 4px; 
                        cursor: pointer; 
                        font-weight: bold;
                        font-size: 12px;
                    " title="Eliminar usuario">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Agregar nuevo usuario
 */
async function agregarNuevoUsuario() {
    console.log("➕ Iniciando creación de nuevo usuario...");
    
    const nombre = prompt('👤 Nombre completo del usuario:');
    if (!nombre || !nombre.trim()) {
        console.log("Nombre cancelado o vacío");
        return;
    }
    
    const correo = prompt('📧 Correo institucional (debe terminar en @uabc.edu.mx):');
    if (!correo || !correo.includes('@uabc.edu.mx')) {
        alert('❌ El correo debe ser institucional y terminar en @uabc.edu.mx');
        return;
    }
    
    const rol = prompt('🎭 Rol del usuario:\n\n• Escribe "alumno" para estudiante\n• Escribe "maestro" para profesor\n• Escribe "encargado" para administrador');
    if (!rol || !['alumno', 'maestro', 'encargado'].includes(rol.toLowerCase())) {
        alert('❌ Rol inválido. Debe escribir exactamente: alumno, maestro o encargado');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('nombre', nombre.trim());
        formData.append('correo', correo.trim().toLowerCase());
        formData.append('rol', rol.toLowerCase());
        formData.append('password', '123456'); // Contraseña por defecto
        
        const response = await fetch('php/usuarios_registrar.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        console.log("📄 Response:", text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            throw new Error('Respuesta del servidor inválida');
        }
        
        if (data.status === 'ok') {
            alert(`✅ Usuario creado exitosamente!\n\n👤 Nombre: ${nombre}\n📧 Correo: ${correo}\n🎭 Rol: ${rol}\n🔑 Contraseña inicial: 123456`);
            cargarUsuarios(); // Recargar tabla
        } else {
            alert('❌ Error: ' + (data.mensaje || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error("❌ Error creando usuario:", error);
        alert('❌ Error al crear usuario: ' + error.message);
    }
}

/**
 * Editar usuario existente
 */
async function editarUsuario(id) {
    console.log(`✏️ Editando usuario ID: ${id}`);
    
    // Primero obtener datos actuales del usuario
    try {
        const response = await fetch(`php/usuarios_obtener.php?id=${id}`);
        const data = await response.json();
        
        if (data.status !== 'ok' || !data.usuario) {
            alert('❌ Usuario no encontrado');
            return;
        }
        
        const usuario = data.usuario;
        
        const nuevoNombre = prompt(`📝 Nombre completo (actual: ${usuario.nombre}):`, usuario.nombre);
        if (nuevoNombre === null) return; // Cancelado
        
        const nuevoCorreo = prompt(`📧 Correo (actual: ${usuario.correo}):`, usuario.correo);
        if (nuevoCorreo === null) return;
        
        if (!nuevoCorreo.includes('@uabc.edu.mx')) {
            alert('❌ El correo debe ser institucional (@uabc.edu.mx)');
            return;
        }
        
        const nuevoRol = prompt(`🎭 Rol (actual: ${usuario.rol}).\nOpciones: alumno, maestro, encargado:`, usuario.rol);
        if (nuevoRol === null) return;
        
        if (!['alumno', 'maestro', 'encargado'].includes(nuevoRol.toLowerCase())) {
            alert('❌ Rol inválido. Use: alumno, maestro o encargado');
            return;
        }
        
        // Enviar actualización
        const formData = new FormData();
        formData.append('id_usuario', id);
        formData.append('nombre', nuevoNombre.trim());
        formData.append('correo', nuevoCorreo.trim().toLowerCase());
        formData.append('rol', nuevoRol.toLowerCase());
        
        const updateResponse = await fetch('php/usuarios_actualizar.php', {
            method: 'POST',
            body: formData
        });
        
        const updateData = await updateResponse.json();
        
        if (updateData.status === 'ok') {
            alert(`✅ Usuario actualizado correctamente`);
            cargarUsuarios(); // Recargar tabla
        } else {
            alert('❌ Error: ' + (updateData.mensaje || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error("❌ Error editando usuario:", error);
        alert('❌ Error al editar usuario: ' + error.message);
    }
}

/**
 * Eliminar usuario
 */
async function eliminarUsuario(id) {
    console.log(`🗑️ Intentando eliminar usuario ID: ${id}`);
    
    try {
        // Obtener información del usuario
        const response = await fetch(`php/usuarios_obtener.php?id=${id}`);
        const data = await response.json();
        
        if (data.status !== 'ok' || !data.usuario) {
            alert('❌ Usuario no encontrado');
            return;
        }
        
        const usuario = data.usuario;
        
        if (confirm(`❓ ¿Está seguro de eliminar al usuario?\n\n👤 ${usuario.nombre}\n📧 ${usuario.correo}\n🎭 ${usuario.rol}\n\n⚠️ Esta acción NO se puede deshacer.`)) {
            const formData = new FormData();
            formData.append('id_usuario', id);
            
            const deleteResponse = await fetch('php/usuarios_eliminar.php', {
                method: 'POST',
                body: formData
            });
            
            const deleteData = await deleteResponse.json();
            
            if (deleteData.status === 'ok') {
                alert(`✅ Usuario "${usuario.nombre}" eliminado correctamente`);
                cargarUsuarios(); // Recargar tabla
            } else {
                alert('❌ Error: ' + (deleteData.mensaje || 'Error desconocido'));
            }
        }
        
    } catch (error) {
        console.error("❌ Error eliminando usuario:", error);
        alert('❌ Error al eliminar usuario: ' + error.message);
    }
}

/**
 * Mostrar error en tabla de usuarios
 */
function mostrarErrorUsuarios(mensaje) {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #721c24;">
                    <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">${mensaje}</div>
                    <div style="font-size: 14px; color: #666;">
                        <button onclick="cargarUsuarios()" style="
                            background: #155724; 
                            color: white; 
                            padding: 8px 16px; 
                            border: none; 
                            border-radius: 4px; 
                            cursor: pointer;
                            margin-top: 10px;
                        ">
                            🔄 Reintentar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

console.log("✅ Sistema de usuarios cargado");