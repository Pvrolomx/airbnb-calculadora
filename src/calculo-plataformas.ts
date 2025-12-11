// src/calculo-plataformas.ts

import { calcularReservaAirbnb, CalculoInput, CalculoOutput } from "./calculo";
import { COMISIONES_POR_PLATAFORMA, Plataforma } from "./plataformas";

export interface CalculoInputPlataforma extends CalculoInput {
  plataforma: Plataforma;
}

export function calcularReservaPlataforma(
  input: CalculoInputPlataforma
): CalculoOutput & {
  plataforma: Plataforma;
  comision_plataforma: number;
} {
  const { plataforma } = input;

  // correr cálculo original Airbnb
  const base = calcularReservaAirbnb(input);

  // obtener comisión según plataforma
  const tasa = COMISIONES_POR_PLATAFORMA[plataforma] ?? 0.03;

  // recalcular solo la parte afectada
  const ingreso_bruto = base.ingreso_bruto_reserva;
  const comision_plataforma = Number((ingreso_bruto * tasa).toFixed(2));

  const ingreso_neto = ingreso_bruto - comision_plataforma;
  const gastos = base.gastos_reserva;

  let base_impuestos = ingreso_neto - gastos;
  if (base_impuestos < 0) base_impuestos = 0;

  const impuestos_estimados_reserva = Number((base_impuestos * 0.025).toFixed(2)); // mismo 2.5%

  const ganancia_neta_reserva = Number(
    (ingreso_neto - gastos - impuestos_estimados_reserva).toFixed(2)
  );

  return {
    ...base,
    plataforma,
    comision_plataforma,
    ingreso_neto_airbnb: ingreso_neto, // por compatibilidad
    base_impuestos,
    impuestos_estimados_reserva,
    ganancia_neta_reserva,
  };
}
