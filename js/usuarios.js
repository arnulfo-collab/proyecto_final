// ===========================================
// usuarios.js - Gestión de usuarios v8
// ===========================================
console.log("✅ [USUARIOS v8] Cargando...");

/**
 * Cargar usuarios en la tabla
 */
window.cargarUsuarios = async function() {
    console.log("👥 [USUARIOS] Cargando lista...");
    
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">🔄 Cargando...</td></tr>';

    try {
        const response = await fetch("php/usuarios_obtener.php");
        const data = await response.json();
        
        tbody.innerHTML = "";
        const usuarios = data.usuarios || [];
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px;">📭 No hay usuarios</td></tr>';
            return;
        }

        usuarios.forEach(u => {
            let badge = '';
            if (u.rol === 'alumno') badge = '<span style="background:#17a2b8;color:white;padding:5px 10px;border-radius:12px;font-size:11px;">🎓 ALUMNO</span>';
            else if (u.rol === 'maestro') badge = '<span style="background:#28a745;color:white;padding:5px 10px;border-radius:12px;font-size:11px;">👨‍🏫 MAESTRO</span>';
            else if (u.rol === 'encargado') badge = '<span style="background:#dc3545;color:white;padding:5px 10px;border-radius:12px;font-size:11px;">👤 ENCARGADO</span>';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.correo}</td>
                <td style="text-align:center;">${badge}</td>
                <td>${u.fecha_registro || 'N/A'}</td>
                <td style="text-align:center;">
                    <button onclick="editarUsuario(${u.id_usuario})" style="padding:6px 12px;background:#ffc107;color:black;border:none;border-radius:4px;cursor:pointer;margin-right:5px;">✏️ Editar</button>
                    <button onclick="eliminarUsuario(${u.id_usuario})" style="padding:6px 12px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">🗑️ Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ [USUARIOS] ${usuarios.length} cargados`);
    } catch (error) {
        console.error("❌ [USUARIOS] Error:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">❌ Error al cargar</td></tr>';
    }
};

/**
 * Abrir modal nuevo usuario
 */
window.agregarNuevoUsuario = function() {
    console.log("➕ [USUARIOS v8] Abriendo modal nuevo usuario");
    cerrarModalUsuario();
    
    const html = `
    <div id="modalUsuario" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;">
        <div style="background:white;padding:30px;border-radius:15px;width:90%;max-width:450px;">
            <h3 style="margin-bottom:20px;text-align:center;">➕ Nuevo Usuario</h3>
            
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:bold;">Nombre: *</label>
                <input type="text" id="usr_nombre" placeholder="Juan Pérez" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:bold;">Correo: *</label>
                <input type="email" id="usr_correo" placeholder="correo@uabc.edu.mx" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:bold;">Contraseña: *</label>
                <input type="password" id="usr_password" placeholder="Mínimo 6 caracteres" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
            </div>
            
            <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:5px;font-weight:bold;">Rol: *</label>
                <select id="usr_rol" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
                    <option value="">Seleccionar...</option>
                    <option value="alumno">🎓 Alumno</option>
                    <option value="maestro">👨‍🏫 Maestro</option>
                    <option value="encargado">👤 Encargado</option>
                </select>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button onclick="guardarUsuarioNuevo()" style="flex:1;padding:14px;background:linear-gradient(135deg,#11998e,#38ef7d);color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">💾 Guardar</button>
                <button onclick="cerrarModalUsuario()" style="flex:1;padding:14px;background:#6c757d;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">❌ Cancelar</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('usr_nombre').focus();
};

/**
 * Guardar usuario nuevo
 */
window.guardarUsuarioNuevo = async function() {
    const nombre = document.getElementById('usr_nombre').value.trim();
    const correo = document.getElementById('usr_correo').value.trim();
    const password = document.getElementById('usr_password').value;
    const rol = document.getElementById('usr_rol').value;

    console.log("💾 [USUARIOS v8] Guardando:", { nombre, correo, rol, passLen: password.length });

    if (!nombre) { alert("❌ Ingresa el nombre"); return; }
    if (!correo) { alert("❌ Ingresa el correo"); return; }
    if (!password) { alert("❌ Ingresa la contraseña"); return; }
    if (password.length < 6) { alert("❌ La contraseña debe tener al menos 6 caracteres"); return; }
    if (!rol) { alert("❌ Selecciona un rol"); return; }

    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('correo', correo);
    fd.append('password', password);
    fd.append('rol', rol);

    try {
        const res = await fetch("php/usuarios_registrar.php", { method: "POST", body: fd });
        const txt = await res.text();
        console.log("📄 [USUARIOS] Response:", txt);
        
        const data = JSON.parse(txt);
        
        if (data.ok) {
            alert("✅ Usuario registrado");
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert("❌ " + (data.error || "Error desconocido"));
        }
    } catch (e) {
        console.error("❌ Error:", e);
        alert("❌ Error de conexión");
    }
};

/**
 * Editar usuario
 */
window.editarUsuario = async function(id) {
    console.log("✏️ [USUARIOS] Editando ID:", id);
    
    try {
        const res = await fetch("php/usuarios_obtener.php");
        const data = await res.json();
        const u = (data.usuarios || []).find(x => x.id_usuario == id);
        
        if (!u) { alert("❌ Usuario no encontrado"); return; }
        
        cerrarModalUsuario();
        
        const html = `
        <div id="modalUsuario" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;">
            <div style="background:white;padding:30px;border-radius:15px;width:90%;max-width:450px;">
                <h3 style="margin-bottom:20px;text-align:center;">✏️ Editar Usuario</h3>
                <input type="hidden" id="usr_id" value="${id}">
                
                <div style="margin-bottom:15px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">Nombre: *</label>
                    <input type="text" id="usr_nombre" value="${u.nombre}" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">Correo: *</label>
                    <input type="email" id="usr_correo" value="${u.correo}" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">Nueva Contraseña: (vacío = no cambiar)</label>
                    <input type="password" id="usr_password" placeholder="Dejar vacío si no cambia" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">Rol: *</label>
                    <select id="usr_rol" style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;box-sizing:border-box;">
                        <option value="alumno" ${u.rol==='alumno'?'selected':''}>🎓 Alumno</option>
                        <option value="maestro" ${u.rol==='maestro'?'selected':''}>👨‍🏫 Maestro</option>
                        <option value="encargado" ${u.rol==='encargado'?'selected':''}>👤 Encargado</option>
                    </select>
                </div>
                
                <div style="display:flex;gap:10px;">
                    <button onclick="actualizarUsuario()" style="flex:1;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">💾 Actualizar</button>
                    <button onclick="cerrarModalUsuario()" style="flex:1;padding:14px;background:#6c757d;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">❌ Cancelar</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (e) {
        console.error("❌ Error:", e);
        alert("❌ Error al cargar usuario");
    }
};

/**
 * Actualizar usuario
 */
window.actualizarUsuario = async function() {
    const id = document.getElementById('usr_id').value;
    const nombre = document.getElementById('usr_nombre').value.trim();
    const correo = document.getElementById('usr_correo').value.trim();
    const password = document.getElementById('usr_password').value;
    const rol = document.getElementById('usr_rol').value;

    if (!nombre) { alert("❌ Ingresa el nombre"); return; }
    if (!correo) { alert("❌ Ingresa el correo"); return; }
    if (!rol) { alert("❌ Selecciona un rol"); return; }

    const fd = new FormData();
    fd.append('id_usuario', id);
    fd.append('nombre', nombre);
    fd.append('correo', correo);
    fd.append('password', password);
    fd.append('rol', rol);

    try {
        const res = await fetch("php/usuarios_actualizar.php", { method: "POST", body: fd });
        const txt = await res.text();
        const data = JSON.parse(txt);
        
        if (data.ok) {
            alert("✅ Usuario actualizado");
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            alert("❌ " + (data.error || "Error"));
        }
    } catch (e) {
        console.error("❌ Error:", e);
        alert("❌ Error de conexión");
    }
};

/**
 * Eliminar usuario
 */
window.eliminarUsuario = async function(id) {
    if (!confirm("¿Eliminar este usuario?")) return;

    const fd = new FormData();
    fd.append('id_usuario', id);

    try {
        const res = await fetch("php/usuarios_eliminar.php", { method: "POST", body: fd });
        const txt = await res.text();
        const data = JSON.parse(txt);
        
        if (data.ok) {
            alert("✅ Usuario eliminado");
            cargarUsuarios();
        } else {
            alert("❌ " + (data.error || "Error"));
        }
    } catch (e) {
        console.error("❌ Error:", e);
        alert("❌ Error de conexión");
    }
};

/**
 * Cerrar modal
 */
window.cerrarModalUsuario = function() {
    const m = document.getElementById('modalUsuario');
    if (m) m.remove();
};

console.log("✅ [USUARIOS v8] Sistema cargado completamente");