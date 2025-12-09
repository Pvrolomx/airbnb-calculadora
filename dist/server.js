"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calculo_1 = require("./calculo");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
// Para recibir JSON en POST
app.use(express_1.default.json());
// Servir la carpeta "public"
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// Endpoint de prueba
app.get("/", (_req, res) => {
    res.send("Airbnb Net Calculator API is running");
});
// Endpoint principal: POST /calcular
app.post("/calcular", (req, res) => {
    try {
        const { tarifa_noche, noches, tarifa_limpieza, regimen_fiscal, gasto_limpieza_real, gasto_consumibles, gasto_comisiones_otras, } = req.body || {};
        // Validación mínima: todos los campos deben venir
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
        // Ejecutar el cálculo usando tu lógica existente
        const resultado = (0, calculo_1.calcularReservaAirbnb)({
            tarifa_noche: Number(tarifa_noche),
            noches: Number(noches),
            tarifa_limpieza: Number(tarifa_limpieza),
            regimen_fiscal: regimen_fiscal,
            gasto_limpieza_real: Number(gasto_limpieza_real),
            gasto_consumibles: Number(gasto_consumibles),
            gasto_comisiones_otras: Number(gasto_comisiones_otras),
        });
        return res.json({
            ok: true,
            input: req.body,
            resultado,
            disclaimer: "Este cálculo es una estimación informativa. No constituye asesoría fiscal, contable ni legal.",
        });
    }
    catch (err) {
        return res.status(400).json({
            ok: false,
            error: err.message || "Error al procesar la solicitud",
        });
    }
});
// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map