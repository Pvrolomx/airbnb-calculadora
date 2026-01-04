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

export type Plataforma = "AIRBNB" | "AIRBNB_SIMPLIFIED" | "VRBO" | "BOOKING" | "OTRA";

const COMISIONES_PLATAFORMA: Record<Plataforma, number> = {
  AIRBNB: 0.03,             // 3% split-fee
  AIRBNB_SIMPLIFIED: 0.155, // 15.5% host-only fee
  VRBO: 0.08,               // 8%
  BOOKING: 0.15,            // 15%
  OTRA: 0.00,               // 0% reserva directa
};

export interface CalculoInput {
  tarifa_noche: number;
  noches: number;
  tarifa_limpieza: number;
  regimen_fiscal: "SIN_RFC" | "RESICO" | "ACTIVIDAD_EMPRESARIAL";
  gasto_limpieza_real: number;
  gasto_consumibles: number;
  gasto_comisiones_otras: number;
  plataforma?: Plataforma;
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
    plataforma,
  } = input;

  const plataformaSeleccionada: Plataforma = plataforma ?? "AIRBNB";
  const tasa_comision_plataforma = COMISIONES_PLATAFORMA[plataformaSeleccionada];

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

  const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;
  const comision_airbnb_reserva = ingreso_bruto_reserva * tasa_comision_plataforma;
  const ingreso_neto_airbnb = ingreso_bruto_reserva - comision_airbnb_reserva;
  const gastos_reserva =
    gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;

  let tasa_impuesto = 0;
  if (regimen_fiscal === "SIN_RFC") tasa_impuesto = 0.25;
  if (regimen_fiscal === "RESICO") tasa_impuesto = 0.025;
  if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL") tasa_impuesto = 0.3;

  let base_impuestos = ingreso_neto_airbnb - gastos_reserva;
  if (base_impuestos < 0) {
    base_impuestos = 0;
  }

  const impuestos_estimados_reserva_raw = base_impuestos * tasa_impuesto;
  const impuestos_estimados_reserva = round2(impuestos_estimados_reserva_raw);

  const ganancia_neta_reserva_raw =
    ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva;
  const ganancia_neta_reserva = round2(ganancia_neta_reserva_raw);

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
