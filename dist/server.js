"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = require("./stripe");
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const calculo_1 = require("./calculo");
const mercadoPagoProvider_1 = require("./pagos/mercadoPagoProvider");
const app = (0, express_1.default)();
const port = 3000;
// Precio del reporte simple (MXN)
const PRECIO_REPORTE_SIMPLE_MXN = 99;
const MONEDA_MXN = "MXN";
/**
 * En el futuro podrás cambiar fácilmente entre Stripe / Mercado Pago
 * leyendo una variable de entorno. Por ahora usamos solo Mercado Pago.
 */
function obtenerProveedorPago() {
    // Más adelante: leer process.env.PAYMENT_PROVIDER
    return mercadoPagoProvider_1.mercadoPagoProvider;
}
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
// Middleware simple de telemetría (ya lo tenías)
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Mensaje raíz
app.get("/", (_req, res) => {
    res.send("Airbnb Net Calculator API is running");
});
// Endpoint principal de cálculo JSON
app.post("/calcular", (req, res) => {
    try {
        const { tarifa_noche, noches, tarifa_limpieza, regimen_fiscal, gasto_limpieza_real, gasto_consumibles, gasto_comisiones_otras, } = req.body || {};
        if (tarifa_noche === undefined ||
            noches === undefined ||
            tarifa_limpieza === undefined ||
            regimen_fiscal === undefined ||
            gasto_limpieza_real === undefined ||
            gasto_consumibles === undefined ||
            gasto_comisiones_otras === undefined) {
            return res.status(400).json({
                ok: false,
                error: "Faltan campos. Se requieren: tarifa_noche, noches, tarifa_limpieza, regimen_fiscal, gasto_limpieza_real, gasto_consumibles, gasto_comisiones_otras",
            });
        }
        const input = {
            tarifa_noche: Number(tarifa_noche),
            noches: Number(noches),
            tarifa_limpieza: Number(tarifa_limpieza),
            regimen_fiscal: regimen_fiscal,
            gasto_limpieza_real: Number(gasto_limpieza_real),
            gasto_consumibles: Number(gasto_consumibles),
            gasto_comisiones_otras: Number(gasto_comisiones_otras),
        };
        const resultado = (0, calculo_1.calcularReservaAirbnb)(input);
        return res.json({
            ok: true,
            input,
            resultado,
            disclaimer: "Este cálculo es una estimación informativa. No constituye asesoría fiscal, contable ni legal.",
        });
    }
    catch (err) {
        console.error("Error en /calcular:", err);
        return res.status(400).json({
            ok: false,
            error: err.message || "Error al procesar la solicitud",
        });
    }
});
// Endpoint JSON de "reporte" (texto estructurado)
app.post("/reporte", (req, res) => {
    try {
        const input = req.body;
        const resultado = (0, calculo_1.calcularReservaAirbnb)(input);
        const resumen = {
            titulo: "Reporte simple de reserva Airbnb (estimación informativa)",
            fecha_generacion: new Date().toISOString(),
            entrada: input,
            salida: resultado,
            disclaimer: "Este reporte ofrece cálculos aproximados con fines informativos. No constituye asesoría fiscal, contable ni legal.",
        };
        return res.json(resumen);
    }
    catch (err) {
        console.error("Error en /reporte:", err);
        return res.status(400).json({
            ok: false,
            error: err.message || "Error al generar reporte",
        });
    }
});
// Endpoint PDF: /reporte-pdf
app.post("/reporte-pdf", (req, res) => {
    try {
        const input = req.body;
        const resultado = (0, calculo_1.calcularReservaAirbnb)(input);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="reporte-reserva.pdf"');
        const doc = new pdfkit_1.default({ margin: 50 });
        // Pipe directo a la respuesta HTTP
        doc.pipe(res);
        // Título
        doc
            .fontSize(18)
            .text("Reporte de reserva Airbnb (estimación informativa)", {
            align: "left",
        })
            .moveDown();
        // Fecha
        doc
            .fontSize(10)
            .text(`Fecha de generación: ${new Date().toLocaleString()}`)
            .moveDown();
        doc.moveDown();
        // Datos de entrada
        doc.fontSize(12).text("Datos de la reserva:", { underline: true }).moveDown();
        doc.fontSize(11);
        doc.text(`Tarifa por noche: ${input.tarifa_noche} MXN`);
        doc.text(`Noches: ${input.noches}`);
        doc.text(`Tarifa de limpieza cobrada: ${input.tarifa_limpieza} MXN`);
        doc.text(`Régimen / categoría fiscal: ${input.regimen_fiscal}`);
        doc.text(`Gasto real de limpieza: ${input.gasto_limpieza_real} MXN`);
        doc.text(`Gasto en consumibles: ${input.gasto_consumibles} MXN`);
        doc.text(`Otras comisiones / gastos: ${input.gasto_comisiones_otras} MXN`);
        doc.moveDown().moveDown();
        // Resultados
        doc.fontSize(12).text("Resultados estimados:", { underline: true }).moveDown();
        doc.fontSize(11);
        doc.text(`Ingreso bruto por reserva: ${resultado.ingreso_bruto_reserva} MXN`);
        doc.text(`Comisión Airbnb estimada: ${resultado.comision_airbnb_reserva} MXN`);
        doc.text(`Ingreso neto desde Airbnb: ${resultado.ingreso_neto_airbnb} MXN`);
        doc.text(`Gastos de la reserva: ${resultado.gastos_reserva} MXN`);
        doc.text(`Base estimada para impuestos: ${resultado.base_impuestos} MXN`);
        doc.text(`Impuestos estimados (aprox.): ${resultado.impuestos_estimados_reserva} MXN`);
        doc.moveDown();
        doc.text(`Impuestos estimados (aprox.): ${resultado.impuestos_estimados_reserva} MXN`);
        doc.moveDown();
        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text(`Ganancia neta estimada: ${resultado.ganancia_neta_reserva} MXN`);
        doc.font("Helvetica");
        doc.moveDown().moveDown();
        // Disclaimer
        doc
            .fontSize(9)
            .text("AVISO IMPORTANTE:", { underline: true })
            .moveDown(0.2);
        doc
            .fontSize(9)
            .text("Este reporte ofrece cálculos aproximados con fines informativos. No constituye asesoría fiscal, contable ni legal. ");
        doc
            .fontSize(9)
            .text("Los resultados no sustituyen el cálculo realizado por un Contador Público Certificado ni consideran todas las variables de la legislación vigente.");
        // Finalizar el PDF
        doc.end();
    }
    catch (err) {
        console.error("Error en /reporte-pdf:", err);
        if (!res.headersSent) {
            return res.status(400).json({
                ok: false,
                error: err.message || "Error al generar PDF",
            });
        }
    }
});
// Servir frontend estático (si lo tienes en /public)
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// Iniciar pago para reporte simple (JSON o PDF, según el flujo que uses en la UI)
app.post("/pago/reporte-simple", async (_req, res) => {
    try {
        const proveedor = obtenerProveedorPago();
        const { url } = await proveedor.crearCheckout({
            monto: PRECIO_REPORTE_SIMPLE_MXN,
            moneda: MONEDA_MXN,
            descripcion: "Reporte simple de reserva Airbnb (estimación informativa)",
        });
        return res.json({
            ok: true,
            proveedor: "mercado-pago",
            url_checkout: url,
            monto: PRECIO_REPORTE_SIMPLE_MXN,
            moneda: MONEDA_MXN,
            disclaimer: "Este reporte ofrece cálculos aproximados con fines informativos. No constituye asesoría fiscal, contable ni legal.",
        });
    }
    catch (error) {
        console.error("Error al crear checkout de pago:", error);
        return res.status(500).json({
            ok: false,
            error: "No se pudo iniciar el proceso de pago. Intenta más tarde.",
        });
    }
});
app.post("/crear-checkout", async (req, res) => {
    try {
        // Más adelante podemos leer cosas del body (tipo de producto, correo, etc.)
        // Por ahora, un solo producto fijo: Reporte PDF de reserva Airbnb
        const session = await stripe_1.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        unit_amount: 9900, // 99.00 MXN en centavos
                        product_data: {
                            name: "Reporte PDF de reserva Airbnb (estimación informativa)",
                            description: "Incluye desglose de ingresos, gastos e impuestos estimados. Uso informativo, no asesoría fiscal.",
                        },
                    },
                    quantity: 1,
                },
            ],
            // Por ahora, URLs locales. Luego las cambiamos a tu dominio.
            success_url: "http://localhost:3000/?checkout=success",
            cancel_url: "http://localhost:3000/?checkout=cancel",
        });
        return res.json({
            ok: true,
            checkoutUrl: session.url,
            message: "Sesión de pago creada correctamente.",
        });
    }
    catch (error) {
        console.error("Error creando sesión de checkout:", error);
        return res.status(500).json({
            ok: false,
            error: "No se pudo iniciar el pago del reporte. Intenta de nuevo más tarde.",
        });
    }
});
// Endpoint para crear sesión de pago de Stripe para reporte PDF
app.post("/crear-sesion-reporte", async (_req, res) => {
    try {
        const session = await stripe_1.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        unit_amount: 9900, // MX$99.00 en centavos
                        product_data: {
                            name: "Reporte PDF de estimación de reserva",
                        },
                    },
                    quantity: 1,
                },
            ],
            // 🔴 IMPORTANTE: aquí va la IP de tu Raspberry, NO localhost
            success_url: "http://192.168.1.79:3000/success",
            cancel_url: "http://192.168.1.79:3000/cancel",
        });
        return res.json({
            ok: true,
            url: session.url,
        });
    }
    catch (err) {
        console.error("Error creando sesión de Stripe:", err);
        return res.status(500).json({
            ok: false,
            error: "Error al crear sesión de pago",
        });
    }
});
// ======================================================
// Stripe Checkout – páginas de resultado
// ======================================================
app.get("/success", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "..", "public", "success.html"));
});
app.get("/cancel", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "..", "public", "cancel.html"));
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map