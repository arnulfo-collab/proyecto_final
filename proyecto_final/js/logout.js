// logout.js
// Maneja el cierre de sesión: llama a php/logout.php y limpia localStorage

document.getElementById("logout").addEventListener("click", async () => {
  try {
    // Llamada al backend para destruir la sesión PHP
    const res = await fetch("php/logout.php");
    const data = await res.json();

    if (data.status === "ok") {
      // Limpiar los datos guardados en el navegador (id y rol)
      localStorage.removeItem("id_usuario");
      localStorage.removeItem("rol");
      // Redirigir al login
      window.location.href = "index.html";
    } else {
      alert("No se pudo cerrar sesión correctamente.");
    }
  } catch (e) {
    alert("Error en la conexión con el servidor.");
  }
});
