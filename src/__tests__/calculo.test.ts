import { calcularReservaAirbnb, CalculoInput } from "../calculo";

describe("calcularReservaAirbnb", () => {
  it("Caso 1 – SIN_RFC, reserva básica", () => {
    const input: CalculoInput = {
      tarifa_noche: 500,
      noches: 3,
      tarifa_limpieza: 200,
      regimen_fiscal: "SIN_RFC",
      gasto_limpieza_real: 150,
      gasto_consumibles: 50,
      gasto_comisiones_otras: 0,
    };
    const output = calcularReservaAirbnb(input);
    expect(output).toEqual({
      ingreso_bruto_reserva: 1700,
      comision_airbnb_reserva: 51,
      ingreso_neto_airbnb: 1649,
      gastos_reserva: 200,
      base_impuestos: 1449,
      impuestos_estimados_reserva: 362.25,
      ganancia_neta_reserva: 1086.75,
    });
  });

  it("Caso 2 – RESICO, mismos datos", () => {
    const input: CalculoInput = {
      tarifa_noche: 500,
      noches: 3,
      tarifa_limpieza: 200,
      regimen_fiscal: "RESICO",
      gasto_limpieza_real: 150,
      gasto_consumibles: 50,
      gasto_comisiones_otras: 0,
    };
    const output = calcularReservaAirbnb(input);
    expect(output).toEqual({
      ingreso_bruto_reserva: 1700,
      comision_airbnb_reserva: 51,
      ingreso_neto_airbnb: 1649,
      gastos_reserva: 200,
      base_impuestos: 1449,
      impuestos_estimados_reserva: 36.23,
      ganancia_neta_reserva: 1412.77,
    });
  });

  it("Caso 3 – Pérdida (gastos mayores que ingreso)", () => {
    const input: CalculoInput = {
      tarifa_noche: 300,
      noches: 1,
      tarifa_limpieza: 0,
      regimen_fiscal: "RESICO",
      gasto_limpieza_real: 200,
      gasto_consumibles: 100,
      gasto_comisiones_otras: 50,
    };
    const output = calcularReservaAirbnb(input);
    expect(output).toEqual({
      ingreso_bruto_reserva: 300,
      comision_airbnb_reserva: 9,
      ingreso_neto_airbnb: 291,
      gastos_reserva: 350,
      base_impuestos: 0,
      impuestos_estimados_reserva: 0,
      ganancia_neta_reserva: -59,
    });
  });

  it("Caso 4 – Actividad Empresarial, sin gastos", () => {
    const input: CalculoInput = {
      tarifa_noche: 1000,
      noches: 2,
      tarifa_limpieza: 300,
      regimen_fiscal: "ACTIVIDAD_EMPRESARIAL",
      gasto_limpieza_real: 0,
      gasto_consumibles: 0,
      gasto_comisiones_otras: 0,
    };
    const output = calcularReservaAirbnb(input);
    expect(output).toEqual({
      ingreso_bruto_reserva: 2300,
      comision_airbnb_reserva: 69,
      ingreso_neto_airbnb: 2231,
      gastos_reserva: 0,
      base_impuestos: 2231,
      impuestos_estimados_reserva: 669.3,
      ganancia_neta_reserva: 1561.7,
    });
  });

  it("Caso 5 – RESICO, reserva opcional", () => {
    const input: CalculoInput = {
      tarifa_noche: 400,
      noches: 4,
      tarifa_limpieza: 0,
      regimen_fiscal: "RESICO",
      gasto_limpieza_real: 100,
      gasto_consumibles: 80,
      gasto_comisiones_otras: 0,
    };
    const output = calcularReservaAirbnb(input);
    expect(output).toEqual({
      ingreso_bruto_reserva: 1600,
      comision_airbnb_reserva: 48,
      ingreso_neto_airbnb: 1552,
      gastos_reserva: 180,
      base_impuestos: 1372,
      impuestos_estimados_reserva: 34.3,
      ganancia_neta_reserva: 1337.7,
    });
  });
});
