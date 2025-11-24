<?php
// filepath: c:\xampp\htdocs\proyecto_final\labs.php

// STEP 1: Limpiar TODO
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

// STEP 2: Si es petición AJAX, solo devolver JSON
if (isset($_POST['ajax']) || isset($_GET['ajax'])) {
    // Limpiar buffer completamente
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Headers
    header('Content-Type: application/json');
    header('Cache-Control: no-cache');
    
    // Función para enviar JSON y salir
    function enviarJSON($data) {
        echo json_encode($data);
        exit();
    }
    
    // Conexión simple
    $conn = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
    
    if ($conn->connect_error) {
        enviarJSON(['error' => 'Sin conexión a BD']);
    }
    
    $accion = $_POST['accion'] ?? $_GET['accion'] ?? '';
    
    switch ($accion) {
        case 'listar':
            $result = $conn->query("SELECT * FROM laboratorios ORDER BY nombre");
            $labs = [];
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $labs[] = $row;
                }
            }
            enviarJSON($labs);
            break;
            
        case 'estado':
            $id = $_POST['id'];
            $estado = $_POST['estado'];
            $stmt = $conn->prepare("UPDATE laboratorios SET estado = ? WHERE id_laboratorio = ?");
            $stmt->bind_param('si', $estado, $id);
            if ($stmt->execute()) {
                enviarJSON(['ok' => true, 'msg' => 'Estado actualizado']);
            } else {
                enviarJSON(['error' => 'Error al actualizar']);
            }
            break;
            
        case 'guardar':
            $id = $_POST['id'] ?? '';
            $nombre = $_POST['nombre'];
            $ubicacion = $_POST['ubicacion'];
            $capacidad = $_POST['capacidad'];
            $estado = $_POST['estado'];
            
            if (empty($id)) {
                // Crear
                $stmt = $conn->prepare("INSERT INTO laboratorios (nombre, ubicacion, capacidad, estado) VALUES (?, ?, ?, ?)");
                $stmt->bind_param('ssis', $nombre, $ubicacion, $capacidad, $estado);
            } else {
                // Actualizar
                $stmt = $conn->prepare("UPDATE laboratorios SET nombre=?, ubicacion=?, capacidad=?, estado=? WHERE id_laboratorio=?");
                $stmt->bind_param('ssisi', $nombre, $ubicacion, $capacidad, $estado, $id);
            }
            
            if ($stmt->execute()) {
                enviarJSON(['ok' => true, 'msg' => 'Guardado OK']);
            } else {
                enviarJSON(['error' => 'Error guardar']);
            }
            break;
            
        case 'eliminar':
            $id = $_POST['id'];
            $stmt = $conn->prepare("DELETE FROM laboratorios WHERE id_laboratorio = ?");
            $stmt->bind_param('i', $id);
            if ($stmt->execute()) {
                enviarJSON(['ok' => true, 'msg' => 'Eliminado OK']);
            } else {
                enviarJSON(['error' => 'Error eliminar']);
            }
            break;
            
        default:
            enviarJSON(['error' => 'Acción no válida']);
    }
}

// STEP 3: Si no es AJAX, mostrar HTML
ob_end_clean();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Labs Simple</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #4CAF50; color: white; }
        .btn { padding: 5px 10px; margin: 2px; border: none; cursor: pointer; border-radius: 3px; }
        .verde { background: #4CAF50; color: white; }
        .azul { background: #2196F3; color: white; }
        .rojo { background: #f44336; color: white; }
        .modal { display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); }
        .modal-content { background: white; margin: 15% auto; padding: 20px; width: 300px; border-radius: 5px; }
        input, select { width: 100%; padding: 5px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>🔬 Laboratorios</h1>
    
    <button class="btn verde" onclick="nuevo()">➕ Nuevo</button>
    
    <table>
        <tr>
            <th>ID</th><th>Nombre</th><th>Ubicación</th><th>Capacidad</th><th>Estado</th><th>Acciones</th>
        </tr>
        <tbody id="tabla"></tbody>
    </table>

    <!-- Modal -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <h3 id="titulo">Laboratorio</h3>
            <form id="form">
                <input type="hidden" id="id">
                <input type="text" id="nombre" placeholder="Nombre" required>
                <input type="text" id="ubicacion" placeholder="Ubicación" required>
                <input type="number" id="capacidad" placeholder="Capacidad" required>
                <select id="estado">
                    <option value="disponible">Disponible</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
                <br><br>
                <button type="submit" class="btn verde">💾 Guardar</button>
                <button type="button" class="btn rojo" onclick="cerrar()">❌ Cancelar</button>
            </form>
        </div>
    </div>

    <script>
        // Cargar laboratorios
        function cargar() {
            console.log('🔄 Cargando laboratorios...');
            
            fetch('labs.php?ajax=1&accion=listar')
                .then(response => {
                    console.log('📡 Response status:', response.status);
                    return response.text();
                })
                .then(text => {
                    console.log('📄 Response text:', text.substring(0, 100));
                    
                    // Verificar si es HTML
                    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
                        throw new Error('El servidor devolvió HTML');
                    }
                    
                    return JSON.parse(text);
                })
                .then(data => {
                    console.log('📦 Data:', data);
                    
                    let html = '';
                    
                    if (data.error) {
                        html = `<tr><td colspan="6" style="color: red;">❌ ${data.error}</td></tr>`;
                    } else if (data.length === 0) {
                        html = '<tr><td colspan="6">📝 No hay laboratorios</td></tr>';
                    } else {
                        data.forEach(lab => {
                            html += `<tr>
                                <td>${lab.id_laboratorio}</td>
                                <td><b>${lab.nombre}</b></td>
                                <td>${lab.ubicacion}</td>
                                <td>${lab.capacidad}</td>
                                <td>${lab.estado}</td>
                                <td>
                                    <select onchange="cambiarEstado(${lab.id_laboratorio}, this.value)">
                                        <option value="">Estado...</option>
                                        <option value="disponible">Disponible</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                        <option value="fuera_servicio">Fuera Servicio</option>
                                    </select>
                                    <button class="btn azul" onclick="editar(${lab.id_laboratorio}, '${lab.nombre}', '${lab.ubicacion}', ${lab.capacidad}, '${lab.estado}')">✏️</button>
                                    <button class="btn rojo" onclick="eliminar(${lab.id_laboratorio})">🗑️</button>
                                </td>
                            </tr>`;
                        });
                    }
                    
                    document.getElementById('tabla').innerHTML = html;
                    console.log('✅ Tabla actualizada');
                })
                .catch(error => {
                    console.error('❌ Error:', error);
                    document.getElementById('tabla').innerHTML = 
                        `<tr><td colspan="6" style="color: red;">❌ ${error.message}</td></tr>`;
                });
        }

        function nuevo() {
            document.getElementById('titulo').textContent = 'Nuevo Laboratorio';
            document.getElementById('form').reset();
            document.getElementById('id').value = '';
            document.getElementById('modal').style.display = 'block';
        }

        function editar(id, nombre, ubicacion, capacidad, estado) {
            document.getElementById('titulo').textContent = 'Editar Laboratorio';
            document.getElementById('id').value = id;
            document.getElementById('nombre').value = nombre;
            document.getElementById('ubicacion').value = ubicacion;
            document.getElementById('capacidad').value = capacidad;
            document.getElementById('estado').value = estado;
            document.getElementById('modal').style.display = 'block';
        }

        function cerrar() {
            document.getElementById('modal').style.display = 'none';
        }

        function cambiarEstado(id, estado) {
            if (!estado) return;
            
            const form = new FormData();
            form.append('ajax', '1');
            form.append('accion', 'estado');
            form.append('id', id);
            form.append('estado', estado);
            
            fetch('labs.php', { method: 'POST', body: form })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {
                        alert('✅ ' + data.msg);
                        cargar();
                    } else {
                        alert('❌ ' + data.error);
                    }
                })
                .catch(e => alert('❌ ' + e.message));
        }

        function eliminar(id) {
            if (!confirm('¿Eliminar?')) return;
            
            const form = new FormData();
            form.append('ajax', '1');
            form.append('accion', 'eliminar');
            form.append('id', id);
            
            fetch('labs.php', { method: 'POST', body: form })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {
                        alert('✅ ' + data.msg);
                        cargar();
                    } else {
                        alert('❌ ' + data.error);
                    }
                })
                .catch(e => alert('❌ ' + e.message));
        }

        // Envío de formulario
        document.getElementById('form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = new FormData();
            form.append('ajax', '1');
            form.append('accion', 'guardar');
            form.append('id', document.getElementById('id').value);
            form.append('nombre', document.getElementById('nombre').value);
            form.append('ubicacion', document.getElementById('ubicacion').value);
            form.append('capacidad', document.getElementById('capacidad').value);
            form.append('estado', document.getElementById('estado').value);
            
            fetch('labs.php', { method: 'POST', body: form })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {
                        alert('✅ ' + data.msg);
                        cerrar();
                        cargar();
                    } else {
                        alert('❌ ' + data.error);
                    }
                })
                .catch(e => alert('❌ ' + e.message));
        });

        // Cargar al inicio
        cargar();
    </script>
</body>
</html>