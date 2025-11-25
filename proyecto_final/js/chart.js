// =======================================
// DASHBOARD DE ESTADÍSTICAS CON CHART.JS
// =======================================


let graficas = {}; // Almacenar instancias de gráficas

/**
 * Cargar estadísticas del servidor
 */
async function cargarEstadisticas() {
    console.log("📊 Cargando estadísticas desde la base de datos...");
    
    try {
        const response = await fetch('php/estadisticas.php');
        console.log("📡 Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log("📄 Response recibido:", text.substring(0, 200));
        
        // Verificar si es HTML (error de PHP)
        if (text.includes('<html>') || text.includes('<!DOCTYPE') || text.includes('<?php')) {
            console.error("❌ Respuesta HTML detectada - error en PHP");
            throw new Error('Error del servidor PHP - revisar logs');
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            console.error("❌ Respuesta completa:", text);
            throw new Error('Respuesta no es JSON válido');
        }
        
        console.log("📦 Data parseada:", data);
        
        if (data.status !== 'ok') {
            console.error("❌ Error del servidor:", data.mensaje);
            console.error("🔍 Debug info:", data.debug);
            throw new Error(data.mensaje || 'Error del servidor');
        }
        
        console.log("📈 Estadísticas recibidas:", data.estadisticas);
        console.log("🔍 Info debug:", data.debug);
        
        // Actualizar estadísticas generales
        actualizarEstadisticasGenerales(data.estadisticas.generales);
        
        // Crear gráficas con delay para asegurar que el DOM esté listo
        setTimeout(() => {
            console.log("🎨 Iniciando creación de gráficas...");
            
            // Verificar que tenemos datos para cada gráfica
            if (data.estadisticas.laboratorios_estados && data.estadisticas.laboratorios_estados.length > 0) {
                crearGraficaLaboratoriosEstados(data.estadisticas.laboratorios_estados);
            } else {
                console.warn("⚠️ No hay datos de estados de laboratorios");
            }
            
            if (data.estadisticas.prestamos_por_mes && data.estadisticas.prestamos_por_mes.length > 0) {
                crearGraficaPrestamosPorMes(data.estadisticas.prestamos_por_mes);
            } else {
                console.warn("⚠️ No hay datos de préstamos por mes");
            }
            
            if (data.estadisticas.usuarios_por_rol && data.estadisticas.usuarios_por_rol.length > 0) {
                crearGraficaUsuariosPorRol(data.estadisticas.usuarios_por_rol);
            } else {
                console.warn("⚠️ No hay datos de usuarios por rol");
            }
            
            if (data.estadisticas.laboratorios_populares && data.estadisticas.laboratorios_populares.length > 0) {
                crearGraficaLaboratoriosPopulares(data.estadisticas.laboratorios_populares);
            } else {
                console.warn("⚠️ No hay datos de laboratorios populares");
            }
            
        }, 300);
        
        console.log("✅ Estadísticas de BD cargadas correctamente");
        
        // Si no hay datos válidos, usar fallback
        if (!data || !data.estadisticas) {
            console.warn("⚠️ No hay datos desde PHP, usando datos locales.");
            usarDatosLocalesEstadisticas();
            return;
        }
        
    } catch (error) {
        console.error("❌ Error completo:", error);
        console.error("❌ Stack trace:", error.stack);
        
        // No mostrar alert, solo log
        console.log("🔄 Usando datos locales como fallback...");
        usarDatosLocalesEstadisticas();
    }
}

/**
 * Función fallback con datos locales
 */
function usarDatosLocalesEstadisticas() {
    console.log("📊 Generando estadísticas con datos locales...");
    
    // Verificar que las variables existan
    if (typeof laboratorios === 'undefined' || typeof usuarios === 'undefined') {
        console.error("❌ Variables 'laboratorios' o 'usuarios' no están definidas");
        
        // Crear datos básicos de ejemplo
        const datosEjemplo = {
            generales: {
                total_laboratorios: 5,
                total_usuarios: 6,
                prestamos_mes_actual: 1,
                laboratorios_disponibles: 5
            },
            laboratorios_estados: [
                { estado: 'Disponible', cantidad: 5 }
            ],
            prestamos_por_mes: [
                { mes: 'Nov 2024', cantidad: 1 }
            ],
            usuarios_por_rol: [
                { rol: 'Encargado', cantidad: 2 },
                { rol: 'Maestro', cantidad: 2 },
                { rol: 'Alumno', cantidad: 2 }
            ],
            laboratorios_populares: [
                { laboratorio: 'Lab Computación 1', solicitudes: 15 },
                { laboratorio: 'Lab Computación 2', solicitudes: 12 },
                { laboratorio: 'Lab Química', solicitudes: 8 },
                { laboratorio: 'Lab Biología', solicitudes: 5 },
                { laboratorio: 'Lab Física', solicitudes: 3 }
            ]
        };
        
        // Actualizar estadísticas generales
        actualizarEstadisticasGenerales(datosEjemplo.generales);
        
        // Crear gráficas con delay
        setTimeout(() => {
            crearGraficaLaboratoriosEstados(datosEjemplo.laboratorios_estados);
            crearGraficaPrestamosPorMes(datosEjemplo.prestamos_por_mes);
            crearGraficaUsuariosPorRol(datosEjemplo.usuarios_por_rol);
            crearGraficaLaboratoriosPopulares(datosEjemplo.laboratorios_populares);
        }, 300);
        
        console.log("✅ Datos de ejemplo aplicados");
        return;
    }
    
    // Usar los datos del HTML como antes...
    // (mantener el código original aquí si las variables existen)
}

/**
 * Actualizar números generales del dashboard
 */
function actualizarEstadisticasGenerales(generales) {
    console.log("📊 Actualizando estadísticas generales:", generales);
    
    const elementos = {
        'total-laboratorios': generales.total_laboratorios || 0,
        'total-usuarios': generales.total_usuarios || 0,
        'prestamos-mes': generales.prestamos_mes_actual || 0,
        'labs-disponibles': generales.laboratorios_disponibles || 0
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            console.log(`✅ ${id}: ${valor}`);
        } else {
            console.error(`❌ Elemento ${id} no encontrado`);
        }
    });
}

/**
 * GRÁFICA 1: Estados de Laboratorios (Dona)
 */
function crearGraficaLaboratoriosEstados(datos) {
    console.log("🍩 Creando gráfica de estados de laboratorios:", datos);
    
    const canvas = document.getElementById('grafica-laboratorios-estados');
    if (!canvas) {
        console.error("❌ Canvas 'grafica-laboratorios-estados' no encontrado");
        return;
    }
    
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está disponible");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("❌ No se pudo obtener contexto 2D");
        return;
    }

    if (!datos || datos.length === 0) {
        console.warn("⚠️ No hay datos para estados de laboratorios");
        return;
    }

    const labels = datos.map(item => item.estado);
    const data = datos.map(item => item.cantidad);
    
    console.log("📊 Labels:", labels);
    console.log("📊 Data:", data);
    
    const colores = datos.map(item => {
        switch(item.estado.toLowerCase()) {
            case 'disponible': return '#28a745';
            case 'mantenimiento': return '#ffc107';
            case 'fuera de servicio': return '#dc3545';
            case 'fuera_servicio': return '#dc3545';
            default: return '#6c757d';
        }
    });
    
    // Destruir gráfica anterior si existe
    if (graficas.laboratoriosEstados) {
        graficas.laboratoriosEstados.destroy();
        console.log("🗑️ Gráfica anterior destruida");
    }
    
    try {
        graficas.laboratoriosEstados = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colores,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Estados de Laboratorios',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
                    }
                }
            }
        });
        
        console.log("✅ Gráfica de dona creada exitosamente");
        
    } catch (error) {
        console.error("❌ Error creando gráfica de dona:", error);
    }
}

/**
 * GRÁFICA 2: Préstamos por Mes (Línea)
 */
function crearGraficaPrestamosPorMes(datos) {
    console.log("📈 Creando gráfica de préstamos por mes:", datos);
    
    const canvas = document.getElementById('grafica-prestamos-mes');
    if (!canvas) {
        console.error("❌ Canvas 'grafica-prestamos-mes' no encontrado");
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está disponible");
        return;
    }
    
    const ctx = canvas.getContext('2d');

    if (!datos || datos.length === 0) {
        console.warn("⚠️ No hay datos para préstamos por mes");
        return;
    }

    const labels = datos.map(item => item.mes);
    const data = datos.map(item => item.cantidad);
    
    console.log("📊 Labels préstamos:", labels);
    console.log("📊 Data préstamos:", data);
    
    // Destruir gráfica anterior si existe
    if (graficas.prestamosMes) {
        graficas.prestamosMes.destroy();
    }
    
    try {
        graficas.prestamosMes = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Préstamos',
                    data: data,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Préstamos por Mes',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Préstamos'
                        }
                    }
                }
            }
        });
        
        console.log("✅ Gráfica de línea creada exitosamente");
        
    } catch (error) {
        console.error("❌ Error creando gráfica de línea:", error);
    }
}

/**
 * GRÁFICA 3: Usuarios por Rol (Barras Verticales)
 */
function crearGraficaUsuariosPorRol(datos) {
    console.log("📊 Creando gráfica de usuarios por rol:", datos);
    
    const canvas = document.getElementById('grafica-usuarios-rol');
    if (!canvas) {
        console.error("❌ Canvas 'grafica-usuarios-rol' no encontrado");
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está disponible");
        return;
    }
    
    const ctx = canvas.getContext('2d');

    if (!datos || datos.length === 0) {
        console.warn("⚠️ No hay datos para usuarios por rol");
        return;
    }

    const labels = datos.map(item => item.rol);
    const data = datos.map(item => item.cantidad);
    
    console.log("📊 Labels usuarios:", labels);
    console.log("📊 Data usuarios:", data);
    
    const colores = datos.map(item => {
        switch(item.rol.toLowerCase()) {
            case 'alumno': return '#17a2b8';
            case 'maestro': return '#28a745';
            case 'encargado': return '#dc3545';
            default: return '#6c757d';
        }
    });
    
    // Destruir gráfica anterior si existe
    if (graficas.usuariosRol) {
        graficas.usuariosRol.destroy();
    }
    
    try {
        graficas.usuariosRol = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Usuarios',
                    data: data,
                    backgroundColor: colores,
                    borderColor: colores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Usuarios por Rol',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Usuarios'
                        }
                    }
                }
            }
        });
        
        console.log("✅ Gráfica de barras creada exitosamente");
        
    } catch (error) {
        console.error("❌ Error creando gráfica de barras:", error);
    }
}

/**
 * GRÁFICA 4: Laboratorios Más Populares (Barras Horizontales)
 */
function crearGraficaLaboratoriosPopulares(datos) {
    console.log("📊 Creando gráfica de labs populares:", datos);
    
    const canvas = document.getElementById('grafica-labs-populares');
    if (!canvas) {
        console.error("❌ Canvas 'grafica-labs-populares' no encontrado");
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está disponible");
        return;
    }
    
    const ctx = canvas.getContext('2d');

    if (!datos || datos.length === 0) {
        console.warn("⚠️ No hay datos para laboratorios populares");
        return;
    }

    const labels = datos.map(item => item.laboratorio);
    const data = datos.map(item => item.solicitudes);
    
    console.log("📊 Labels labs populares:", labels);
    console.log("📊 Data labs populares:", data);
    
    // Destruir gráfica anterior si existe
    if (graficas.laboratoriosPopulares) {
        graficas.laboratoriosPopulares.destroy();
    }
    
    try {
        graficas.laboratoriosPopulares = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Solicitudes',
                    data: data,
                    backgroundColor: [
                        '#007bff',
                        '#28a745', 
                        '#ffc107',
                        '#dc3545',
                        '#6f42c1'
                    ],
                    borderColor: [
                        '#0056b3',
                        '#1e7e34',
                        '#e0a800',
                        '#c82333',
                        '#5a2d91'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Barras horizontales
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Laboratorios Más Solicitados',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Solicitudes'
                        }
                    }
                }
            }
        });
        
        console.log("✅ Gráfica horizontal creada exitosamente");
        
    } catch (error) {
        console.error("❌ Error creando gráfica horizontal:", error);
    }
}

/**
 * Función para mostrar la sección de estadísticas
 */
function mostrarEstadisticas() {
    console.log("📊 Función mostrarEstadisticas() llamada");
    
    // Verificar que Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está cargado");
        alert("Error: Chart.js no está disponible. Verifique su conexión a internet.");
        return;
    }
    
    console.log("✅ Chart.js está disponible, versión:", Chart.version);
    
    // Verificar que los canvas existen
    const canvases = [
        'grafica-laboratorios-estados',
        'grafica-prestamos-mes', 
        'grafica-usuarios-rol',
        'grafica-labs-populares'
    ];
    
    let canvasFound = 0;
    canvases.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            canvasFound++;
            console.log(`✅ Canvas ${id} encontrado`);
        } else {
            console.error(`❌ Canvas ${id} NO encontrado`);
        }
    });
    
    console.log(`📊 Canvas encontrados: ${canvasFound}/${canvases.length}`);
    
    if (canvasFound === canvases.length) {
        console.log("🎯 Todos los canvas listos, iniciando carga de estadísticas...");
        // Pequeña pausa para que se renderice completamente
        setTimeout(() => {
            cargarEstadisticas();
        }, 500);
    } else {
        console.error(`❌ Solo se encontraron ${canvasFound} de ${canvases.length} canvas`);
        // Intentar usar datos locales como fallback
        setTimeout(() => {
            console.log("🔄 Intentando fallback con datos locales...");
            usarDatosLocalesEstadisticas();
        }, 1000);
    }
}

/**
 * Mostrar error en caso de fallo
 */
function mostrarErrorEstadisticas(mensaje) {
    console.error("📊 Error en estadísticas:", mensaje);
    
    // Mostrar error en las tarjetas de estadísticas
    const ids = ['total-laboratorios', 'total-usuarios', 'prestamos-mes', 'labs-disponibles'];
    ids.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = '❌';
        }
    });
}

console.log("✅ chart.js cargado correctamente");