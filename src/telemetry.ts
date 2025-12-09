import fs from "fs";
import path from "path";

const TELEMETRY_FILE = path.join(__dirname, "../data/telemetry.json");

// Asegura directorio y archivo
export function initTelemetry() {
  const dir = path.join(__dirname, "../data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  if (!fs.existsSync(TELEMETRY_FILE)) {
    fs.writeFileSync(
      TELEMETRY_FILE,
      JSON.stringify({ byDay: {} }, null, 2),
      "utf8"
    );
  }
}

// Registra un uso
export function recordUsage(source: "api" | "cli" | "ui") {
  const raw = fs.readFileSync(TELEMETRY_FILE, "utf8");
  const data = JSON.parse(raw);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!data.byDay[today]) {
    data.byDay[today] = {
      total: 0,
      api: 0,
      cli: 0,
      ui: 0,
    };
  }

  data.byDay[today].total += 1;
  data.byDay[today][source] += 1;

  fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(data, null, 2));
}

// Obtén cuántos cálculos quedan
export function getTodayUsage() {
  const raw = fs.readFileSync(TELEMETRY_FILE, "utf8");
  const data = JSON.parse(raw);

  const today = new Date().toISOString().slice(0, 10);

  return data.byDay[today] || { total: 0 };
}
