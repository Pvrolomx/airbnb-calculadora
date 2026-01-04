// src/plataformas.ts

export type Plataforma = "AIRBNB" | "AIRBNB_SIMPLIFIED" | "VRBO" | "BOOKING" | "OTRA";

export const COMISIONES_POR_PLATAFORMA: Record<Plataforma, number> = {
  AIRBNB: 0.03,              // 3% Airbnb split-fee
  AIRBNB_SIMPLIFIED: 0.155,  // 15.5% Airbnb host-only fee
  VRBO: 0.08,                // 8% Vrbo (aprox)
  BOOKING: 0.15,             // 15% Booking.com (aprox)
  OTRA: 0.00,                // Directo sin comision
};
