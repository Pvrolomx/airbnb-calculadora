"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularReservaAirbnb = calcularReservaAirbnb;
/**
 * AVISO IMPORTANTE:
 * Esta función realiza cálculos aproximados con fines informativos
 * basados en los valores ingresados.
 * NO constituye asesoría fiscal, contable ni legal.
 * Para determinar tus obligaciones fiscales reales,
 * consulta a un Contador Público Certificado.
 */
function calcularReservaAirbnb(input) {
    const { tarifa_noche, noches, tarifa_limpieza, regimen_fiscal, gasto_limpieza_real, gasto_consumibles, gasto_comisiones_otras, } = input;
    // helper de redondeo
    function round2(num) {
        return Math.round(num * 100) / 100;
    }
    // Validaciones mínimas
    if (tarifa_noche < 0 ||
        noches < 1 ||
        tarifa_limpieza < 0 ||
        gasto_limpieza_real < 0 ||
        gasto_consumibles < 0 ||
        gasto_comisiones_otras < 0) {
        throw new Error("Valores inválidos: todos los números deben ser >= 0 y noches >= 1.");
    }
    if (!["SIN_RFC", "RESICO", "ACTIVIDAD_EMPRESARIAL"].includes(regimen_fiscal)) {
        throw new Error("Regimen fiscal inválido.");
    }
    // Validación adicional: evitar valores no finitos (NaN, Infinity)
    const allInputs = [
        tarifa_noche,
        noches,
        tarifa_limpieza,
        gasto_limpieza_real,
        gasto_consumibles,
        gasto_comisiones_otras,
    ];
    if (allInputs.some((v) => !Number.isFinite(v))) {
        throw new Error("Todos los valores deben ser números finitos válidos.");
    }
    // 1) Cálculos intermedios
    const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;
    const comision_airbnb_reserva = ingreso_bruto_reserva * 0.03;
    const ingreso_neto_airbnb = ingreso_bruto_reserva - comision_airbnb_reserva;
    const gastos_reserva = gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;
    // 2) Impuestos estimados
    let tasa_impuesto = 0;
    if (regimen_fiscal === "SIN_RFC")
        tasa_impuesto = 0.25;
    if (regimen_fiscal === "RESICO")
        tasa_impuesto = 0.025;
    if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL")
        tasa_impuesto = 0.3;
    let base_impuestos = ingreso_neto_airbnb - gastos_reserva;
    if (base_impuestos < 0)
        base_impuestos = 0;
    const impuestos_estimados_reserva = round2(base_impuestos * tasa_impuesto);
    // 3) Ganancia neta final usando el impuesto ya redondeado
    const ganancia_neta_reserva = round2(ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva);
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
//# sourceMappingURL=calculo.js.map