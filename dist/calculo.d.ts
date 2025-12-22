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
export declare function calcularReservaAirbnb(input: CalculoInput): CalculoOutput;
//# sourceMappingURL=calculo.d.ts.map