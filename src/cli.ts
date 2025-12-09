import { calcularReservaAirbnb, CalculoInput, CalculoOutput } from "./calculo";

// Obtener argumentos desde la terminal
const args = process.argv.slice(2);

if (args.length < 7) {
  console.error(
    "Uso: node dist/cli.js tarifa_noche noches tarifa_limpieza regimen_fiscal gasto_limpieza_real gasto_consumibles gasto_comisiones_otras"
  );
  process.exit(1);
}

const [
  tarifa_noche_str,
  noches_str,
  tarifa_limpieza_str,
  regimen_fiscal_str,
  gasto_limpieza_real_str,
  gasto_consumibles_str,
  gasto_comisiones_otras_str,
] = args;

const input: CalculoInput = {
  tarifa_noche: Number(tarifa_noche_str),
  noches: Number(noches_str),
  tarifa_limpieza: Number(tarifa_limpieza_str),
  regimen_fiscal: regimen_fiscal_str as CalculoInput["regimen_fiscal"],
  gasto_limpieza_real: Number(gasto_limpieza_real_str),
  gasto_consumibles: Number(gasto_consumibles_str),
  gasto_comisiones_otras: Number(gasto_comisiones_otras_str),
};

try {
  const output: CalculoOutput = calcularReservaAirbnb(input);

  console.log("=== Resultado de la Reserva Airbnb ===");
  console.log(`Ingreso bruto reserva: ${output.ingreso_bruto_reserva}`);
  console.log(`Comisión Airbnb reserva: ${output.comision_airbnb_reserva}`);
  console.log(`Ingreso neto Airbnb: ${output.ingreso_neto_airbnb}`);
  console.log(`Gastos reserva: ${output.gastos_reserva}`);
  console.log(`Base impuestos: ${output.base_impuestos}`);
  console.log(`Impuestos estimados reserva: ${output.impuestos_estimados_reserva}`);
  console.log(`Ganancia neta reserva: ${output.ganancia_neta_reserva}`);
} catch (error: any) {
  console.error("Error al calcular la reserva:", error.message);
  process.exit(1);
}
