import { ProveedorPago } from "./proveedorPago";

// Implementación inicial (stub) sin conexión real a Mercado Pago.
export const mercadoPagoProvider: ProveedorPago = {
  async crearCheckout({ monto, moneda, descripcion }) {
    console.log("[MP] Crear checkout:", { monto, moneda, descripcion });

    // Por ahora devolvemos una URL ficticia para pruebas internas
    return {
      url: "https://www.mercadopago.com.mx/checkout/v1/redirect/stub",
    };
  },

  async manejarWebhook(payload, firmaCabecera) {
    console.log("[MP] Webhook recibido:", {
      payload,
      firmaCabecera,
    });
  },
};
