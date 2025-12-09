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
/**
 * AVISO IMPORTANTE:
 * Esta función realiza cálculos aproximados con fines informativos
 * basados en los valores ingresados.
 * NO constituye asesoría fiscal, contable ni legal.
 * Para determinar tus obligaciones fiscales reales,
 * consulta a un Contador Público Certificado.
 */
export declare function calcularReservaAirbnb(input: CalculoInput): CalculoOutput;
//# sourceMappingURL=calculo.d.ts.map