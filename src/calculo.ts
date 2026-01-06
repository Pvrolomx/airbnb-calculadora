// src/calculo.ts

/**
 * Calcula una estimación informativa de la ganancia neta por reserva de Airbnb.
 * Incluye retenciones de IVA e ISR que hace la plataforma en México.
 */

export type Plataforma = "AIRBNB" | "AIRBNB_SIMPLIFIED" | "VRBO" | "BOOKING" | "OTRA";

const COMISIONES_PLATAFORMA: Record<Plataforma, number> = {
  AIRBNB: 0.03,             // 3% split-fee
  AIRBNB_SIMPLIFIED: 0.155, // 15.5% host-only fee
  VRBO: 0.08,               // 8%
  BOOKING: 0.15,            // 15%
  OTRA: 0.00,               // 0% reserva directa
};

// Retenciones que hace Airbnb en México para hosts con RFC
const RETENCION_IVA = 0.08;  // 8% del ingreso bruto
const RETENCION_ISR = 0.04;  // 4% del ingreso bruto

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
  retencion_iva: number;         // NUEVO
  retencion_isr: number;         // NUEVO
  total_retenciones: number;     // NUEVO
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

  if (numeros.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
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
    throw new Error("Valores inválidos: todos los montos deben ser >= 0 y noches >= 1.");
  }

  const regimenesValidos: CalculoInput["regimen_fiscal"][] = [
    "SIN_RFC",
    "RESICO",
    "ACTIVIDAD_EMPRESARIAL",
  ];

  if (!regimenesValidos.includes(regimen_fiscal)) {
    throw new Error(`Régimen fiscal inválido: "${regimen_fiscal}".`);
  }

  // 1. Ingreso bruto
  const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;
  
  // 2. Comisión plataforma
  const comision_airbnb_reserva = ingreso_bruto_reserva * tasa_comision_plataforma;
  
  // 3. Retenciones (solo aplican si tiene RFC registrado con la plataforma)
  // SIN_RFC: Airbnb retiene 20% provisional (se maneja diferente)
  // RESICO/ACTIVIDAD_EMPRESARIAL: Airbnb retiene IVA 8% + ISR 4%
  let retencion_iva = 0;
  let retencion_isr = 0;
  
  if (regimen_fiscal !== "SIN_RFC" && 
      (plataformaSeleccionada === "AIRBNB" || plataformaSeleccionada === "AIRBNB_SIMPLIFIED")) {
    retencion_iva = ingreso_bruto_reserva * RETENCION_IVA;
    retencion_isr = ingreso_bruto_reserva * RETENCION_ISR;
  }
  
  const total_retenciones = comision_airbnb_reserva + retencion_iva + retencion_isr;
  
  // 4. Ingreso neto (lo que realmente recibes)
  const ingreso_neto_airbnb = ingreso_bruto_reserva - total_retenciones;
  
  // 5. Gastos operativos
  const gastos_reserva = gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;

  // 6. Impuestos adicionales (después de retenciones)
  // La retención ISR es un pago a cuenta, así que hay que restar del impuesto final
  let tasa_impuesto = 0;
  if (regimen_fiscal === "SIN_RFC") tasa_impuesto = 0.20; // 20% provisional
  if (regimen_fiscal === "RESICO") tasa_impuesto = 0.025; // 2.5% sobre ingresos (ya pagado 4%)
  if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL") tasa_impuesto = 0.30; // 30% aproximado

  let base_impuestos = ingreso_bruto_reserva - gastos_reserva;
  if (base_impuestos < 0) base_impuestos = 0;

  // Calcular impuesto bruto y restar retención ya hecha
  let impuesto_bruto = base_impuestos * tasa_impuesto;
  let impuestos_estimados_reserva = impuesto_bruto - retencion_isr;
  if (impuestos_estimados_reserva < 0) impuestos_estimados_reserva = 0;
  impuestos_estimados_reserva = round2(impuestos_estimados_reserva);

  // 7. Ganancia neta = lo recibido - gastos - impuestos adicionales
  const ganancia_neta_reserva = round2(ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva);

  return {
    ingreso_bruto_reserva: round2(ingreso_bruto_reserva),
    comision_airbnb_reserva: round2(comision_airbnb_reserva),
    retencion_iva: round2(retencion_iva),
    retencion_isr: round2(retencion_isr),
    total_retenciones: round2(total_retenciones),
    ingreso_neto_airbnb: round2(ingreso_neto_airbnb),
    gastos_reserva: round2(gastos_reserva),
    base_impuestos: round2(base_impuestos),
    impuestos_estimados_reserva,
    ganancia_neta_reserva,
  };
}
