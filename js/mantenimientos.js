/*
 * mantenimientos.js
 * Maneja:
 * - Cargar laboratorios para registrar mantenimiento
 * - Registrar mantenimiento
 * - Listar mantenimientos existentes
 * - Finalizar mantenimiento
 */

// =====================================================
// mantenimientos.js - Gestión de mantenimientos v4
// =====================================================
console.log("✅ mantenimientos.js cargado");

/**
 * Cargar laboratorios en el select del formulario de mantenimiento
 */
window.cargarLaboratoriosParaMantenimiento = async function() {
    console.log("🔧 [MANTENIMIENTOS] === INICIANDO CARGA DE LABORATORIOS ===");
    
    const select = document.getElementById('mant_laboratorio');
    console.log("🔧 [MANTENIMIENTOS] Select encontrado:", select);
    
    if (!select) {
        console.error("❌ [MANTENIMIENTOS] No se encontró el select #mant_laboratorio");
        return;
    }

    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        // Usar laboratorios_api.php en lugar de laboratorios_simple.php
        const response = await fetch('php/laboratorios_api.php');
        console.log("🔧 [MANTENIMIENTOS] Response status:", response.status);
        
        const text = await response.text();
        console.log("🔧 [MANTENIMIENTOS] Response:", text.substring(0, 200));
        
        const data = JSON.parse(text);
        console.log("🔧 [MANTENIMIENTOS] Laboratorios recibidos:", data.length);

        select.innerHTML = '<option value="">Seleccionar laboratorio...</option>';
        
        if (Array.isArray(data)) {
            data.forEach(lab => {
                const option = document.createElement('option');
                option.value = lab.id_laboratorio;
                option.textContent = `${lab.nombre} - ${lab.ubicacion}`;
                select.appendChild(option);
            });
            console.log(`✅ [MANTENIMIENTOS] ${data.length} laboratorios cargados`);
        } else if (data.error) {
            console.error("❌ [MANTENIMIENTOS] Error:", data.error);
            select.innerHTML = '<option value="">Error al cargar</option>';
        }
    } catch (error) {
        console.error("❌ [MANTENIMIENTOS] Error:", error);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
};

/**
 * Cargar lista de mantenimientos
 */
window.cargarMantenimientos = async function() {
    console.log("📋 [MANTENIMIENTOS] Cargando lista...");
    
    const tbody = document.querySelector("#tablaMantenimientos tbody");
    if (!tbody) {
        console.error("❌ [MANTENIMIENTOS] No se encontró tbody de mantenimientos");
        return;
    }

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">🔄 Cargando...</td></tr>';

    try {
        const response = await fetch('php/mantenimiento_listado.php');
        const text = await response.text();
        
        console.log("📦 [MANTENIMIENTOS] Response:", text.substring(0, 300));
        
        const data = JSON.parse(text);
        console.log("📦 [MANTENIMIENTOS] Datos recibidos:", data);

        tbody.innerHTML = '';

        if (data.error) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">❌ ${data.error}</td></tr>`;
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;">📭 No hay mantenimientos registrados</td></tr>';
            return;
        }

        data.forEach(m => {
            // Badge de tipo
            let tipoBadge = '';
            switch(m.tipo) {
                case 'preventivo':
                    tipoBadge = '<span class="badge-tipo badge-preventivo">PREVENTIVO</span>';
                    break;
                case 'correctivo':
                    tipoBadge = '<span class="badge-tipo badge-correctivo">CORRECTIVO</span>';
                    break;
                case 'limpieza':
                    tipoBadge = '<span class="badge-tipo badge-limpieza">LIMPIEZA</span>';
                    break;
                case 'actualizacion':
                    tipoBadge = '<span class="badge-tipo badge-actualizacion">ACTUALIZACIÓN</span>';
                    break;
                default:
                    tipoBadge = `<span class="badge-tipo">${m.tipo}</span>`;
            }

            // Badge de estado
            let estadoBadge = '';
            switch(m.estado) {
                case 'en_progreso':
                    estadoBadge = '<span class="badge-estado badge-en-progreso">EN PROGRESO</span>';
                    break;
                case 'finalizado':
                    estadoBadge = '<span class="badge-estado badge-finalizado">FINALIZADO</span>';
                    break;
                case 'cancelado':
                    estadoBadge = '<span class="badge-estado badge-cancelado">CANCELADO</span>';
                    break;
                default:
                    estadoBadge = `<span class="badge-estado">${m.estado}</span>`;
            }

            // Acciones
            let acciones = '';
            if (m.estado === 'en_progreso') {
                acciones = `<button onclick="finalizarMantenimiento(${m.id_mantenimiento})" class="btn-finalizar">✓ Finalizar</button>`;
            } else {
                acciones = '<span class="sin-acciones">Sin acciones</span>';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.id_mantenimiento}</td>
                <td>${m.laboratorio_nombre || 'N/A'}</td>
                <td>${tipoBadge}</td>
                <td>${m.descripcion || ''}</td>
                <td>${m.fecha_inicio || ''}</td>
                <td>${m.fecha_fin || ''}</td>
                <td>${estadoBadge}</td>
                <td>${acciones}</td>
            `;
            tbody.appendChild(tr);
        });

        console.log(`✅ [MANTENIMIENTOS] ${data.length} mantenimientos cargados`);

    } catch (error) {
        console.error("❌ [MANTENIMIENTOS] Error:", error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">❌ Error: ${error.message}</td></tr>`;
    }
};

/**
 * Enviar formulario de nuevo mantenimiento
 */
window.enviarMantenimiento = async function(event) {
    if (event) event.preventDefault();
    console.log("📤 [MANTENIMIENTOS] Enviando formulario...");

    const form = document.getElementById('formMantenimiento');
    if (!form) {
        console.error("❌ [MANTENIMIENTOS] No se encontró el formulario");
        return;
    }

    const formData = new FormData(form);
    
    // Debug
    console.log("📤 [MANTENIMIENTOS] Datos del formulario:");
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
    }

    try {
        const response = await fetch('php/mantenimiento_registrar.php', {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        console.log("📄 [MANTENIMIENTOS] Response:", text);

        const data = JSON.parse(text);

        if (data.ok) {
            alert('✅ ' + (data.msg || 'Mantenimiento registrado'));
            form.reset();
            cargarMantenimientos();
            cargarLaboratoriosParaMantenimiento();
        } else {
            alert('❌ ' + (data.error || 'Error al registrar'));
        }
    } catch (error) {
        console.error("❌ [MANTENIMIENTOS] Error:", error);
        alert('❌ Error de conexión');
    }
};

/**
 * Finalizar un mantenimiento
 */
window.finalizarMantenimiento = async function(id) {
    console.log("✅ [MANTENIMIENTOS] Finalizando ID:", id);

    if (!confirm('¿Finalizar este mantenimiento?')) return;

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('php/mantenimiento_finalizar.php', {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        console.log("📄 [MANTENIMIENTOS] Response:", text);

        const data = JSON.parse(text);

        if (data.ok) {
            alert('✅ ' + (data.msg || 'Mantenimiento finalizado'));
            cargarMantenimientos();
        } else {
            alert('❌ ' + (data.error || 'Error al finalizar'));
        }
    } catch (error) {
        console.error("❌ [MANTENIMIENTOS] Error:", error);
        alert('❌ Error de conexión');
    }
};

// Registrar funciones globalmente
console.log("✅ [MANTENIMIENTOS] Todas las funciones registradas globalmente");
console.log("  ✓ cargarLaboratoriosParaMantenimiento");
console.log("  ✓ cargarMantenimientos");
console.log("  ✓ enviarMantenimiento");
console.log("  ✓ finalizarMantenimiento");

// Configurar formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ [MANTENIMIENTOS] DOM cargado");
    
    const form = document.getElementById('formMantenimiento');
    if (form) {
        form.addEventListener('submit', enviarMantenimiento);
        console.log("✅ [MANTENIMIENTOS] Formulario configurado");
    }
});
