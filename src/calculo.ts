/**
 * Calcula una ESTIMACIÓN INFORMATIVA de los resultados económicos
 * de una reserva de Airbnb.
 *
 * 👉 Importante:
 * - Los resultados son aproximados.
 * - NO consideran todos los posibles factores fiscales, personales o contables.
 * - NO sustituyen la asesoría de un Contador Público Certificado.
 *
 * Esta función se diseñó solo con fines informativos y de planeación operativa.
 * NO constituye asesoría fiscal, contable ni legal.
 */

export interface CalculoInput {
  tarifa_noche: number;
  noches: number;
  tarifa_limpieza: number;
  regimen_fiscal: "SIN_RFC" | "RESICO" | "ACTIVIDAD_EMPRESARIAL";
  gasto_limpieza_real: number;
  gasto_consumibles: number;
  gasto_comisiones_otras: number;
}

export interface CalculoOutput {
  ingreso_bruto_reserva: number;
  comision_airbnb_reserva: number;
  ingreso_neto_airbnb: number;
  gastos_reserva: number;
  base_impuestos: number;
  impuestos_estimados_reserva: number;
  ganancia_neta_reserva: number;
}

export function calcularReservaAirbnb(input: CalculoInput): CalculoOutput {
  const {
    tarifa_noche,
    noches,
    tarifa_limpieza,
    regimen_fiscal,
    gasto_limpieza_real,
    gasto_consumibles,
    gasto_comisiones_otras,
  } = input;

  // --- Validaciones de tipo y rango (hardening) ---

  const numericValues: Record<string, number> = {
    tarifa_noche,
    noches,
    tarifa_limpieza,
    gasto_limpieza_real,
    gasto_consumibles,
    gasto_comisiones_otras,
  };

  for (const [key, value] of Object.entries(numericValues)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`El campo "${key}" debe ser un número finito.`);
    }

    if (key === "noches") {
      if (value < 1) {
        throw new Error("El número de noches debe ser al menos 1.");
      }
    } else {
      if (value < 0) {
        throw new Error(`El campo "${key}" no puede ser negativo.`);
      }
    }
  }

  const regimenesValidos: CalculoInput["regimen_fiscal"][] = [
    "SIN_RFC",
    "RESICO",
    "ACTIVIDAD_EMPRESARIAL",
  ];

  if (!regimenesValidos.includes(regimen_fiscal)) {
    throw new Error(
      `Régimen fiscal inválido: "${regimen_fiscal}". ` +
        `Valores permitidos: SIN_RFC, RESICO, ACTIVIDAD_EMPRESARIAL.`
    );
  }

  // --- Cálculos principales (lógica original, sin cambios) ---

  const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;
  const comision_airbnb_reserva = ingreso_bruto_reserva * 0.03;
  const ingreso_neto_airbnb = ingreso_bruto_reserva - comision_airbnb_reserva;
  const gastos_reserva =
    gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;

  let tasa_impuesto = 0;
  if (regimen_fiscal === "SIN_RFC") tasa_impuesto = 0.25;
  if (regimen_fiscal === "RESICO") tasa_impuesto = 0.025;
  if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL") tasa_impuesto = 0.3;

  let base_impuestos = ingreso_neto_airbnb - gastos_reserva;
  if (base_impuestos < 0) base_impuestos = 0;

  // Impuestos: primero calculamos y redondeamos a 2 decimales
  const impuestos_estimados_sin_redondear = base_impuestos * tasa_impuesto;
  const impuestos_estimados_reserva = Math.round(
    impuestos_estimados_sin_redondear * 100
  ) / 100;

  // La ganancia neta se calcula usando el impuesto YA redondeado
  const ganancia_neta_reserva =
    ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva;

  // Utilidad general de redondeo
  function round2(num: number): number {
    return Math.round(num * 100) / 100;
  }

  return {
    ingreso_bruto_reserva: round2(ingreso_bruto_reserva),
    comision_airbnb_reserva: round2(comision_airbnb_reserva),
    ingreso_neto_airbnb: round2(ingreso_neto_airbnb),
    gastos_reserva: round2(gastos_reserva),
    base_impuestos: round2(base_impuestos),
    // aquí ya viene redondeado, pero es idempotente
    impuestos_estimados_reserva: round2(impuestos_estimados_reserva),
    ganancia_neta_reserva: round2(ganancia_neta_reserva),
  };
}
