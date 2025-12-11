// src/plataformas.ts

export type Plataforma = "AIRBNB" | "VRBO" | "BOOKING" | "OTRA";

export const COMISIONES_POR_PLATAFORMA: Record<Plataforma, number> = {
  AIRBNB: 0.03,     // 3% Airbnb huésped → host (aprox)
  VRBO: 0.08,       // 8% Vrbo (aprox)
  BOOKING: 0.15,    // 15% Booking.com (aprox)
  OTRA: 0.00,       // Directo o personalizado
};

