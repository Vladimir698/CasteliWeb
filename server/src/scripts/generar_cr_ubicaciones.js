/**
 * Genera server/src/data/cr_ubicaciones.json con:
 * {
 *   "San José": {
 *     "Central": ["Carmen", "Merced", ...],
 *     "Escazú": ["Escazú", "San Antonio", ...],
 *     ...
 *   },
 *   "Alajuela": { ... }
 * }
 */

const fs = require("fs");
const path = require("path");

const BASE = "https://ubicaciones.paginasweb.cr";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

(async () => {
  try {
    const provinciasUrl = `${BASE}/provincias.json`;
    const provinciasMap = await getJson(provinciasUrl); // { "1": "San José", ... }

    const salida = {};

    for (const provinciaId of Object.keys(provinciasMap)) {
      const provinciaNombre = provinciasMap[provinciaId];

      // cantones
      const cantonesUrl = `${BASE}/provincia/${provinciaId}/cantones.json`;
      const cantonesMap = await getJson(cantonesUrl); // { "1":"Central", ... }

      salida[provinciaNombre] = {};

      for (const cantonId of Object.keys(cantonesMap)) {
        const cantonNombre = cantonesMap[cantonId];

        // distritos
        const distritosUrl = `${BASE}/provincia/${provinciaId}/canton/${cantonId}/distritos.json`;
        const distritosMap = await getJson(distritosUrl); // { "1":"Carmen", ... }

        salida[provinciaNombre][cantonNombre] = Object.values(distritosMap);
      }
    }

    const outDir = path.join(__dirname, "..", "data");
    const outFile = path.join(outDir, "cr_ubicaciones.json");

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(outFile, JSON.stringify(salida, null, 2), "utf-8");

    console.log("✅ Archivo generado:", outFile);
  } catch (err) {
    console.error("❌ Error generando cr_ubicaciones.json:", err.message);
    process.exit(1);
  }
})();