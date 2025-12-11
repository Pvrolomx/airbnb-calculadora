# Booking calculator (net estimate)

> Herramienta informativa para estimar la ganancia neta por reserva en plataformas tipo Airbnb / Vrbo / Booking.com.

---

## 🎯 ¿Qué hace esta herramienta?

Para **una sola reserva**, te calcula de forma aproximada:

- Ingreso bruto (tarifa por noche × noches + limpieza cobrada)
- Comisión de la plataforma (según canal seleccionado)
- Lo que te deposita la plataforma
- Gastos directos de la reserva:
  - Limpieza real
  - Consumibles / amenidades
  - Otras comisiones o costos
- Retención fiscal **aproximada** según categoría seleccionada
- Ganancia neta estimada por reserva

> 💡 **Importante:** Es una herramienta informativa.  
> No constituye asesoría fiscal, contable ni legal.

---

## 🧮 Modelo de cálculo (resumen)

Entrada principal:

- `tarifa_noche`
- `noches`
- `tarifa_limpieza`
- `regimen_fiscal` (ej. `SIN_RFC`, `RESICO`, `ACTIVIDAD_EMPRESARIAL`)
- `gasto_limpieza_real`
- `gasto_consumibles`
- `gasto_comisiones_otras`
- `plataforma` (`AIRBNB`, `VRBO`, `BOOKING`, `OTRA`)

Pasos:

1. **Ingreso bruto**  
   `ingreso_bruto_reserva = tarifa_noche * noches + tarifa_limpieza`

2. **Comisión de plataforma** (según canal)  
   Ejemplo aproximado:
   - Airbnb ≈ 3 %
   - Vrbo ≈ 8 %
   - Booking.com ≈ 15 %
   - Otra = configurable

3. **Ingreso neto desde la plataforma**  
   `ingreso_neto_airbnb = ingreso_bruto_reserva - comision_plataforma`

4. **Gastos directos de la reserva**  
   `gastos_reserva = gasto_limpieza_real + gasto_consumibles + gasto_comisiones_otras`

5. **Base para cálculo fiscal (informativa)**  
   `base_impuestos = max(0, ingreso_neto_airbnb - gastos_reserva)`

6. **Tasa estimada según régimen**  
   - `SIN_RFC` → 25 %
   - `RESICO` → 2.5 %
   - `ACTIVIDAD_EMPRESARIAL` → 30 %

7. **Impuestos estimados (informativos)**  
   `impuestos_estimados_reserva = base_impuestos * tasa`

8. **Ganancia neta estimada**  
   `ganancia_neta_reserva = ingreso_neto_airbnb - gastos_reserva - impuestos_estimados_reserva`

Todos los resultados numéricos se redondean a 2 decimales.

---

## 🧱 Estructura del proyecto

- `src/calculo.ts`  
  Lógica pura de cálculo (`calcularReservaAirbnb`) + tipos de entrada/salida.

- `src/__tests__/calculo.test.ts`  
  Casos de prueba con Jest que validan las fórmulas.

- `src/server.ts`  
  API Express:
  - `POST /calcular` → devuelve JSON con el cálculo.
  - `POST /reporte-pdf` → genera PDF con el detalle.
  - `POST /crear-sesion-reporte` → crea sesión de pago (Stripe Checkout).
  - Rutas de éxito / cancelación de pago.

- `src/stripe.ts`  
  Cliente de Stripe encapsulado. Lee `STRIPE_SECRET_KEY` de variables de entorno.

- `public/index.html`  
  UI estática:
  - Selector de idioma ES/EN
  - Selector de plataforma (Airbnb, Vrbo, Booking.com, Otra)
  - Formulario de reserva y gastos
  - Resultados
  - Botón para comprar **reporte PDF** (Stripe)

- `.github/workflows/ci.yml`  
  Pipeline CI:
  - `npm install`
  - `npm test`
  - `npm run build`
  - `npm run test:ci` (placeholder amigable para Actions)

---

## 🏃‍♂️ Cómo correrlo en local (desarrollo)

Requisitos:

- Node.js 18+ o 20+
- npm
- (Opcional) Stripe account en modo test

### 1. Instalar dependencias

```bash
npm install
