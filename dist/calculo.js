"use strict";
// src/calculo.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularReservaAirbnb = calcularReservaAirbnb;
const COMISIONES_PLATAFORMA = {
    AIRBNB: 0.03, // 3% split-fee
    AIRBNB_SIMPLIFIED: 0.155, // 15.5% host-only fee
    VRBO: 0.08, // 8%
    BOOKING: 0.15, // 15%
    OTRA: 0.03, // 3% por defecto
};
function round2(num) {
    return Math.round(num * 100) / 100;
}
function calcularReservaAirbnb(input) {
    const { tarifa_noche, noches, tarifa_limpieza, regimen_fiscal, gasto_limpieza_real, gasto_consumibles, gasto_comisiones_otras, plataforma, } = input;
    const plataformaSeleccionada = plataforma !== null && plataforma !== void 0 ? plataforma : "AIRBNB";
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
    if (tarifa_noche < 0 ||
        noches < 1 ||
        tarifa_limpieza < 0 ||
        gasto_limpieza_real < 0 ||
        gasto_consumibles < 0 ||
        gasto_comisiones_otras < 0) {
        throw new Error("Valores inválidos: todos los montos deben ser >= 0 y noches >= 1.");
    }
    const regimenesValidos = [
        "SIN_RFC",
        "RESICO",
        "ACTIVIDAD_EMPRESARIAL",
    ];
    if (!regimenesValidos.includes(regimen_fiscal)) {
        throw new Error(`Régimen fiscal inválido: "${regimen_fiscal}". ` +
            `Valores permitidos: SIN_RFC, RESICO, ACTIVIDAD_EMPRESARIAL.`);
    }
    const ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza;
    const comision_airbnb_reserva = ingreso_bruto_reserva * tasa_comision_plataforma;
    const ingreso_neto_airbnb = ingreso_bruto_reserva - comision_airbnb_reserva;
    const gastos_reserva = gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras;
    let tasa_impuesto = 0;
    if (regimen_fiscal === "SIN_RFC")
        tasa_impuesto = 0.25;
    if (regimen_fiscal === "RESICO")
        tasa_impuesto = 0.025;
    if (regimen_fiscal === "ACTIVIDAD_EMPRESARIAL")
        tasa_impuesto = 0.3;
    let base_impuestos = ingreso_neto_airbnb - gastos_reserva;
    if (base_impuestos < 0) {
        base_impuestos = 0;
    }
    const impuestos_estimados_reserva_raw = base_impuestos * tasa_impuesto;
    const impuestos_estimados_reserva = round2(impuestos_estimados_reserva_raw);
    const ganancia_neta_reserva_raw = ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva;
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
//# sourceMappingURL=calculo.js.map