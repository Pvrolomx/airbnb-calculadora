export interface ProveedorPago {
  crearCheckout(params: {
    monto: number;
    moneda: string;
    descripcion: string;
  }): Promise<{ url: string }>;

  manejarWebhook(payload: any, firmaCabecera: string): Promise<void>;
}
