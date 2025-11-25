<?php
// filepath: c:\xampp\htdocs\proyecto_final\laboratorios_simple.php

session_start();

// Si es una petición AJAX, devolver JSON
if (isset($_GET['ajax']) || isset($_POST['ajax'])) {
    header('Content-Type: application/json');
    
    try {
        $conexion = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
        
        if ($conexion->connect_error) {
            echo json_encode(['error' => 'Error de conexión']);
            exit;
        }
        
        // LISTAR laboratorios
        if ($_GET['accion'] === 'listar') {
            $sql = "SELECT * FROM laboratorios ORDER BY nombre";
            $resultado = $conexion->query($sql);
            $laboratorios = [];
            
            while ($row = $resultado->fetch_assoc()) {
                $laboratorios[] = $row;
            }
            
            echo json_encode($laboratorios);
            exit;
        }
        
        // CAMBIAR ESTADO
        if ($_POST['accion'] === 'cambiar_estado') {
            $id = $_POST['id'];
            $estado = $_POST['estado'];
            
            $sql = "UPDATE laboratorios SET estado = ? WHERE id_laboratorio = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param('si', $estado, $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'mensaje' => 'Estado actualizado']);
            } else {
                echo json_encode(['error' => 'Error al actualizar']);
            }
            exit;
        }
        
        // GUARDAR (crear o editar)
        if ($_POST['accion'] === 'guardar') {
            $id = $_POST['id'] ?? null;
            $nombre = $_POST['nombre'];
            $ubicacion = $_POST['ubicacion'];
            $capacidad = $_POST['capacidad'];
            $estado = $_POST['estado'];
            
            if ($id) {
                // Actualizar
                $sql = "UPDATE laboratorios SET nombre=?, ubicacion=?, capacidad=?, estado=? WHERE id_laboratorio=?";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param('ssisi', $nombre, $ubicacion, $capacidad, $estado, $id);
            } else {
                // Crear
                $sql = "INSERT INTO laboratorios (nombre, ubicacion, capacidad, estado) VALUES (?, ?, ?, ?)";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param('ssis', $nombre, $ubicacion, $capacidad, $estado);
            }
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'mensaje' => 'Guardado correctamente']);
            } else {
                echo json_encode(['error' => 'Error al guardar']);
            }
            exit;
        }
        
        // ELIMINAR
        if ($_POST['accion'] === 'eliminar') {
            $id = $_POST['id'];
            
            $sql = "DELETE FROM laboratorios WHERE id_laboratorio = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'mensaje' => 'Eliminado correctamente']);
            } else {
                echo json_encode(['error' => 'Error al eliminar']);
            }
            exit;
        }
        
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// Si no es AJAX, mostrar la página HTML
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Laboratorios - Simple</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background: #007bff; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        .btn { padding: 6px 12px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-azul { background: #007bff; color: white; }
        .btn-verde { background: #28a745; color: white; }
        .btn-amarillo { background: #ffc107; color: #212529; }
        .btn-rojo { background: #dc3545; color: white; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; z-index: 1000; }
        .modal-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; }
        .estado-disponible { background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
        .estado-mantenimiento { background: #ffc107; color: #212529; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
        .estado-fuera_servicio { background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔬 Gestión de Laboratorios</h1>
        
        <button class="btn btn-verde" onclick="nuevoLaboratorio()">➕ Nuevo Laboratorio</button>
        
        <table id="tablaLaboratorios">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Ubicación</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tbody-labs">
                <tr><td colspan="6" style="text-align: center;">🔄 Cargando...</td></tr>
            </tbody>
        </table>
    </div>

    <!-- Modal para editar/crear -->
    <div id="modalLab" class="modal">
        <div class="modal-content">
            <h3 id="modal-titulo">Nuevo Laboratorio</h3>
            <form id="formLab">
                <input type="hidden" id="lab_id" name="id">
                
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" id="lab_nombre" name="nombre" required>
                </div>
                
                <div class="form-group">
                    <label>Ubicación:</label>
                    <input type="text" id="lab_ubicacion" name="ubicacion" required>
                </div>
                
                <div class="form-group">
                    <label>Capacidad:</label>
                    <input type="number" id="lab_capacidad" name="capacidad" min="1" required>
                </div>
                
                <div class="form-group">
                    <label>Estado:</label>
                    <select id="lab_estado" name="estado">
                        <option value="disponible">Disponible</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="fuera_servicio">Fuera de Servicio</option>
                    </select>
                </div>
                
                <div style="text-align: center;">
                    <button type="submit" class="btn btn-verde">💾 Guardar</button>
                    <button type="button" class="btn btn-rojo" onclick="cerrarModal()">❌ Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Cargar laboratorios al inicio
        document.addEventListener('DOMContentLoaded', cargarLaboratorios);

        async function cargarLaboratorios() {
            try {
                const response = await fetch('?ajax=1&accion=listar');
                const data = await response.json();
                
                const tbody = document.getElementById('tbody-labs');
                tbody.innerHTML = '';
                
                if (data.error) {
                    tbody.innerHTML = `<tr><td colspan="6" style="color: red;">❌ ${data.error}</td></tr>`;
                    return;
                }
                
                if (data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">📝 No hay laboratorios</td></tr>';
                    return;
                }
                
                data.forEach(lab => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${lab.id_laboratorio}</td>
                        <td><strong>${lab.nombre}</strong></td>
                        <td>${lab.ubicacion}</td>
                        <td>${lab.capacidad}</td>
                        <td><span class="estado-${lab.estado}">${lab.estado.toUpperCase()}</span></td>
                        <td>
                            <select onchange="cambiarEstado(${lab.id_laboratorio}, this.value)" style="margin-right: 5px;">
                                <option value="">Cambiar estado...</option>
                                <option value="disponible" ${lab.estado === 'disponible' ? 'disabled' : ''}>Disponible</option>
                                <option value="mantenimiento" ${lab.estado === 'mantenimiento' ? 'disabled' : ''}>Mantenimiento</option>
                                <option value="fuera_servicio" ${lab.estado === 'fuera_servicio' ? 'disabled' : ''}>Fuera de Servicio</option>
                            </select>
                            <button class="btn btn-amarillo" onclick="editarLab(${lab.id_laboratorio}, '${lab.nombre}', '${lab.ubicacion}', ${lab.capacidad}, '${lab.estado}')">✏️</button>
                            <button class="btn btn-rojo" onclick="eliminarLab(${lab.id_laboratorio})">🗑️</button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });
                
            } catch (error) {
                document.getElementById('tbody-labs').innerHTML = 
                    `<tr><td colspan="6" style="color: red;">❌ Error: ${error.message}</td></tr>`;
            }
        }

        function nuevoLaboratorio() {
            document.getElementById('modal-titulo').textContent = 'Nuevo Laboratorio';
            document.getElementById('formLab').reset();
            document.getElementById('lab_id').value = '';
            document.getElementById('modalLab').style.display = 'block';
        }

        function editarLab(id, nombre, ubicacion, capacidad, estado) {
            document.getElementById('modal-titulo').textContent = 'Editar Laboratorio';
            document.getElementById('lab_id').value = id;
            document.getElementById('lab_nombre').value = nombre;
            document.getElementById('lab_ubicacion').value = ubicacion;
            document.getElementById('lab_capacidad').value = capacidad;
            document.getElementById('lab_estado').value = estado;
            document.getElementById('modalLab').style.display = 'block';
        }

        function cerrarModal() {
            document.getElementById('modalLab').style.display = 'none';
        }

        async function cambiarEstado(id, nuevoEstado) {
            if (!nuevoEstado) return;
            
            try {
                const formData = new FormData();
                formData.append('ajax', '1');
                formData.append('accion', 'cambiar_estado');
                formData.append('id', id);
                formData.append('estado', nuevoEstado);
                
                const response = await fetch('', {method: 'POST', body: formData});
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ ' + data.mensaje);
                    cargarLaboratorios();
                } else {
                    alert('❌ ' + data.error);
                }
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        }

        async function eliminarLab(id) {
            if (!confirm('¿Eliminar este laboratorio?')) return;
            
            try {
                const formData = new FormData();
                formData.append('ajax', '1');
                formData.append('accion', 'eliminar');
                formData.append('id', id);
                
                const response = await fetch('', {method: 'POST', body: formData});
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ ' + data.mensaje);
                    cargarLaboratorios();
                } else {
                    alert('❌ ' + data.error);
                }
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        }

        // Enviar formulario
        document.getElementById('formLab').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = new FormData(e.target);
                formData.append('ajax', '1');
                formData.append('accion', 'guardar');
                
                const response = await fetch('', {method: 'POST', body: formData});
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ ' + data.mensaje);
                    cerrarModal();
                    cargarLaboratorios();
                } else {
                    alert('❌ ' + data.error);
                }
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        });

        // Cerrar modal con clic fuera
        window.onclick = function(event) {
            if (event.target === document.getElementById('modalLab')) {
                cerrarModal();
            }
        }
    </script>
</body>
</html>