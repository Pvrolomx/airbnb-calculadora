// src/calculo.ts

/**
 * Calcula una estimación informativa de la ganancia neta por reserva de Airbnb.
 *
 * IMPORTANTE:
 * - Los resultados son aproximados y se basan únicamente en los datos proporcionados.
 * - No se consideran deducciones personales, situación fiscal específica
 *   ni cambios recientes en la legislación.
 * - Esta función NO constituye asesoría fiscal, contable ni legal.
 *   Consulte siempre a un Contador Público Certificado para decisiones reales.
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

// Utilidad: redondea a 2 decimales
function round2(num: number): number {
  return Math.round(num * 100) / 100;
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

  // 1) Validaciones de tipo y finitud (NaN / Infinity)
  const numeros = [
    tarifa_noche,
    noches,
    tarifa_limpieza,
    gasto_limpieza_real,
    gasto_consumibles,
    gasto_comisiones_otras,
  ];

  if (
    numeros.some(
      (v) => typeof v !== "number" || !Number.isFinite(v)
    )
  ) {
    throw new Error("Todos los valores numéricos deben ser números finitos válidos.");
  }

  // 2) Validaciones de rango básico
  if (
    tarifa_noche < 0 ||
    noches < 1 ||
    tarifa_limpieza < 0 ||
    gasto_limpieza_real < 0 ||
    gasto_consumibles < 0 ||
    gasto_comisiones_otras < 0
  ) {
    throw new Error(
      "Valores inválidos: todos los montos deben ser >= 0 y noches >= 1."
    );
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

  // 3) Cálculos intermedios (según SPEC)

  // 3.1 Ingreso bruto
  const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;

  // 3.2 Comisión Airbnb (3 %)
  const COMISION_AIRBNB = 0.03;
  const comision_airbnb_reserva = ingreso_bruto_reserva * COMISION_AIRBNB;

  // 3.3 Ingreso neto desde Airbnb
  const ingreso_neto_airbnb = ingreso_bruto_reserva - comision_airbnb_reserva;

  // 3.4 Gastos operativos de la reserva
  const gastos_reserva =
    gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;

  // 3.5 Tasa “estimada” según régimen (valores fijos del SPEC)
  let tasa_impuesto = 0;
  if (regimen_fiscal === "SIN_RFC") tasa_impuesto = 0.25;
  if (regimen_fiscal === "RESICO") tasa_impuesto = 0.025;
  if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL") tasa_impuesto = 0.3;

  // 3.6 Base para cálculo de impuestos (no puede ser negativa)
  let base_impuestos = ingreso_neto_airbnb - gastos_reserva;
  if (base_impuestos < 0) {
    base_impuestos = 0;
  }

  // 3.7 Impuestos estimados (se redondean ANTES de usar en ganancia)
  const impuestos_estimados_reserva_raw = base_impuestos * tasa_impuesto;
  const impuestos_estimados_reserva = round2(impuestos_estimados_reserva_raw);

  // 3.8 Ganancia neta final usando el impuesto YA redondeado
  const ganancia_neta_reserva_raw =
    ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva;
  const ganancia_neta_reserva = round2(ganancia_neta_reserva_raw);

  // 4) Devolvemos todo redondeado a 2 decimales
  return {
    ingreso_bruto_reserva: round2(ingreso_bruto_reserva),
    comision_airbnb_reserva: round2(comision_airbnb_reserva),
    ingreso_neto_airbnb: round2(ingreso_neto_airbnb),
    gastos_reserva: round2(gastos_reserva),
    base_impuestos: round2(base_impuestos),
    impuestos_estimados_reserva,
    ganancia_neta_reserva,
  };
}
