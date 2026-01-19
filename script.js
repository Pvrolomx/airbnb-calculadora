console.log("Frontend cargado correctamente");

// --- Botón CALCULAR (ya existente en tu UI) ---
const btnCalcular = document.getElementById("btn-calcular");
if (btnCalcular) {
  btnCalcular.addEventListener("click", async () => {
    const payload = recopilarFormulario();

    try {
      const res = await fetch("/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        mostrarResultado(data.resultado);
      } else {
        alert(data.error || "Error en el cálculo");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el servidor.");
    }
  });
}

// --- Botón COMPRAR REPORTE PDF (Stripe) ---
const btnComprar = document.getElementById("btn-comprar");
if (btnComprar) {
  btnComprar.addEventListener("click", async () => {
    const payload = recopilarFormulario();

    try {
      const res = await fetch("/crear-sesion-reporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        // Redirige al checkout de Stripe
        window.location.href = data.url;
      } else {
        alert("Error al iniciar pago: " + data.error);
      }

    } catch (e) {
      console.error(e);
      alert("Error de red o servidor.");
    }
  });
}

// --- Función para tomar datos del formulario ---
function recopilarFormulario() {
  return {
    tarifa_noche: Number(document.getElementById("tarifa_noche").value),
    noches: Number(document.getElementById("noches").value),
    tarifa_limpieza: Number(document.getElementById("tarifa_limpieza").value),
    regimen_fiscal: document.getElementById("regimen_fiscal").value,
    gasto_limpieza_real: Number(document.getElementById("gasto_limpieza_real").value),
    gasto_consumibles: Number(document.getElementById("gasto_consumibles").value),
    gasto_comisiones_otras: Number(document.getElementById("gasto_comisiones_otras").value),
  };
}

// --- Función para mostrar resultados en pantalla ---
function mostrarResultado(result) {
  const out = document.getElementById("resultado");
  if (!out) return;

  out.innerHTML = `
    <h3>Resultados estimados</h3>
    <p><strong>Ganancia neta:</strong> ${result.ganancia_neta_reserva} MXN</p>
    <p><strong>Base impuestos:</strong> ${result.base_impuestos} MXN</p>
  `;
}
