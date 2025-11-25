// main.js - maneja el formulario de login y llama a php/login.php
console.log("main.js cargado");

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM cargado, iniciando configuración");
    
    const loginForm = document.getElementById("loginForm");
    const msgDiv = document.getElementById("msg");

    // Verificar que los elementos existen
    if (!loginForm || !msgDiv) {
        console.error("Elementos del formulario no encontrados");
        return;
    }

    console.log("Elementos encontrados, configurando evento submit");

    loginForm.addEventListener("submit", async function(e) {
        console.log("Formulario enviado");
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        msgDiv.style.display = "none";

        try {
            console.log("Enviando petición de login...");
            
            const response = await fetch("php/login.php", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log("Datos de respuesta:", data);

            if (data.status === "ok") {
                console.log("Login exitoso, guardando datos y redirigiendo...");
                
                // Guardar datos en localStorage
                localStorage.setItem("id_usuario", data.id_usuario);
                localStorage.setItem("nombre", data.nombre);
                localStorage.setItem("rol", data.rol);

                // Redirigir según el rol
                switch (data.rol) {
                    case "encargado":
                        window.location.href = "dashboard_encargado.html";
                        break;
                    case "maestro":
                        window.location.href = "dashboard_maestro.html";
                        break;
                    case "alumno":
                        window.location.href = "dashboard_alumno.html";
                        break;
                    default:
                        throw new Error("Rol no válido");
                }
            } else {
                mostrarError(data.mensaje);
            }

        } catch (error) {
            console.error("Error:", error);
            mostrarError("Error de conexión con el servidor");
        }
    });

    function mostrarError(mensaje) {
        console.log("Mostrando error:", mensaje);
        msgDiv.textContent = mensaje;
        msgDiv.style.display = "block";
    }

    console.log("Configuración completada");
});
