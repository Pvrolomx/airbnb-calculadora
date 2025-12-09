// src/calculo.ts

/**
 * Calcula una estimación informativa de los resultados económicos
 * de una reserva de Airbnb (ingresos, gastos, base para impuestos
 * e impuestos estimados), usando reglas internas fijas.
 *
 * IMPORTANTE:
 * - Los resultados son aproximados y se basan únicamente en los datos
 *   proporcionados en la llamada.
 * - No considera deducciones personales, contexto fiscal completo
 *   ni cambios recientes en la legislación.
 *
 * @param input Datos de la reserva y gastos asociados.
 * @returns Desglose estimado de ingresos, gastos e impuestos.
 *
 * @throws Error Si los valores numéricos son negativos, no finitos
 *         (NaN / Infinity) o si el régimen fiscal no es válido.
 *
 * @disclaimer Esta función ofrece cálculos aproximados con fines
 *             informativos. No constituye asesoría fiscal, contable
 *             ni legal. Para decisiones fiscales reales, consulte
 *             siempre a un profesional certificado.
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

  // Utilidad interna para redondear a 2 decimales
  function round2(num: number): number {
    return Math.round(num * 100) / 100;
  }

  // 0) Validación de números finitos (evita NaN / Infinity)
  const valoresNumericos = [
    tarifa_noche,
    noches,
    tarifa_limpieza,
    gasto_limpieza_real,
    gasto_consumibles,
    gasto_comisiones_otras,
  ];

  if (
    valoresNumericos.some(
      (v) => typeof v !== "number" || !Number.isFinite(v)
    )
  ) {
    throw new Error(
      "Todos los valores numéricos deben ser números finitos válidos."
    );
  }

  // 1) Validaciones mínimas de rango
  if (
    tarifa_noche < 0 ||
    noches < 1 ||
    tarifa_limpieza < 0 ||
    gasto_limpieza_real < 0 ||
    gasto_consumibles < 0 ||
    gasto_comisiones_otras < 0
  ) {
    throw new Error(
      "Valores inválidos: todos los números deben ser >= 0 y noches >= 1."
    );
  }

  if (
    !["SIN_RFC", "RESICO", "ACTIVIDAD_EMPRESARIAL"].includes(regimen_fiscal)
  ) {
    throw new Error(
      `Régimen fiscal inválido: "${regimen_fiscal}". Valores permitidos: SIN_RFC, RESICO, ACTIVIDAD_EMPRESARIAL.`
    );
  }

  // 2) Cálculos intermedios (sin redondear todavía)
  const ingreso_bruto_reserva_raw = tarifa_noche * noches + tarifa_limpieza;
  const comision_airbnb_reserva_raw = ingreso_bruto_reserva_raw * 0.03;
  const ingreso_neto_airbnb_raw =
    ingreso_bruto_reserva_raw - comision_airbnb_reserva_raw;
  const gastos_reserva_raw =
    gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;

  // 3) Impuestos estimados (tasa fija según régimen simplificado)
  let tasa_impuesto = 0;
  if (regimen_fiscal === "SIN_RFC") tasa_impuesto = 0.25;
  if (regimen_fiscal === "RESICO") tasa_impuesto = 0.025;
  if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL") tasa_impuesto = 0.3;

  let base_impuestos_raw = ingreso_neto_airbnb_raw - gastos_reserva_raw;
  if (base_impuestos_raw < 0) base_impuestos_raw = 0;

  const impuestos_estimados_reserva_raw =
    base_impuestos_raw * tasa_impuesto;

  // 4) Redondear campos intermedios
  const ingreso_bruto_reserva = round2(ingreso_bruto_reserva_raw);
  const comision_airbnb_reserva = round2(comision_airbnb_reserva_raw);
  const ingreso_neto_airbnb = round2(ingreso_neto_airbnb_raw);
  const gastos_reserva = round2(gastos_reserva_raw);
  const base_impuestos = round2(base_impuestos_raw);
  const impuestos_estimados_reserva = round2(
    impuestos_estimados_reserva_raw
  );

  // 5) Ganancia neta usando los valores YA redondeados
  const ganancia_neta_reserva = round2(
    ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva
  );

  return {
    ingreso_bruto_reserva,
    comision_airbnb_reserva,
    ingreso_neto_airbnb,
    gastos_reserva,
    base_impuestos,
    impuestos_estimados_reserva,
    ganancia_neta_reserva,
  };
}
