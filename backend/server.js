const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const DB_FILE = "./datos.json";

const inicial = {
  usuarios: [
    { id: 1, nombre: "Kevin", puntos: 0 },
    { id: 2, nombre: "Luis", puntos: 0 },
    { id: 3, nombre: "Ana", puntos: 0 }
  ],
  partidos: [
    {
      id: 1,
      local: "Real Madrid",
      visitante: "Bayern Munich",
      fecha: "2026-12-10T20:00:00Z",
      golesLocal: null,
      golesVisitante: null,
      demo: true
    },
    {
      id: 2,
      local: "Barcelona",
      visitante: "Manchester City",
      fecha: "2026-12-11T20:00:00Z",
      golesLocal: null,
      golesVisitante: null,
      demo: true
    },
    {
      id: 3,
      local: "PSG",
      visitante: "Liverpool",
      fecha: "2026-12-12T20:00:00Z",
      golesLocal: null,
      golesVisitante: null,
      demo: true
    }
  ],
  predicciones: [],
  salas: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(inicial, null, 2));
}

function leer() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function guardar(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function enviar(res, codigo, datos) {
  res.writeHead(codigo, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(datos));
}

function resultado(a, b) {
  return Math.sign(a - b);
}

function puntos(pred, partido) {
  if (partido.golesLocal === null ||
      partido.golesVisitante === null) return 0;

  const exacto =
    pred.golesLocal === partido.golesLocal &&
    pred.golesVisitante === partido.golesVisitante;

  const ganador =
    resultado(pred.golesLocal, pred.golesVisitante) ===
    resultado(partido.golesLocal, partido.golesVisitante);

  const diferencia =
    pred.golesLocal - pred.golesVisitante ===
    partido.golesLocal - partido.golesVisitante;

  let total = exacto ? 5 : (ganador ? 3 : 0) +
    (diferencia && !exacto ? 2 : 0);

  const anticipacion =
    new Date(partido.fecha).getTime() -
    new Date(pred.fechaRegistro).getTime();

  if (anticipacion > 24 * 60 * 60 * 1000) total++;

  return total;
}

function cuerpo(req) {
  return new Promise((resolve, reject) => {
    let datos = "";
    req.on("data", c => {
      datos += c;
      if (datos.length > 100000) {
        reject(new Error("Solicitud demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(datos || "{}"));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

const servidor = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return enviar(res, 204, {});
  const url = new URL(req.url, "http://localhost");
  const db = leer();

  try {
    if (url.pathname === "/api/health") {
      return enviar(res, 200, {
        estado: "OK",
        servicio: "Champions Predictor",
        instancia: process.env.INSTANCE || "backend-1",
        temporada: "2026/27"
      });
    }


    if (url.pathname === "/api/usuarios" && req.method === "GET") {
      return enviar(res, 200, db.usuarios);
    }

    if (url.pathname === "/api/predicciones" &&
        req.method === "GET") {

      const usuarioId = Number(url.searchParams.get("usuarioId"));

      const lista = db.predicciones
        .filter(p => !usuarioId || p.usuarioId === usuarioId)
        .map(p => {
          const partido = db.partidos.find(
            x => x.id === p.partidoId
          );

          const usuario = db.usuarios.find(
            x => x.id === p.usuarioId
          );

          if (!partido || !usuario) return null;

          const finalizado =
            partido.golesLocal !== null &&
            partido.golesVisitante !== null;

          return {
            ...p,
            usuario: usuario.nombre,
            local: partido.local,
            visitante: partido.visitante,
            fechaPartido: partido.fecha,
            finalizado,
            resultadoReal: finalizado
              ? {
                  golesLocal: partido.golesLocal,
                  golesVisitante: partido.golesVisitante
                }
              : null,
            puntos: finalizado ? puntos(p, partido) : 0
          };
        })
        .filter(Boolean);

      return enviar(res, 200, lista);
    }

    if (url.pathname === "/api/partidos" && req.method === "GET") {
      return enviar(res, 200, db.partidos);
    }

    if (url.pathname === "/api/ranking" && req.method === "GET") {
      const ranking = db.usuarios.map(u => {
        const predicciones = db.predicciones
          .filter(p => p.usuarioId === u.id)
          .sort((a, b) => a.partidoId - b.partidoId);

        let total = 0;
        let racha = 0;

        for (const pred of predicciones) {
          const partido = db.partidos.find(
            p => p.id === pred.partidoId
          );

          if (!partido ||
              partido.golesLocal === null ||
              partido.golesVisitante === null) continue;

          total += puntos(pred, partido);

          const acerto =
            resultado(pred.golesLocal, pred.golesVisitante) ===
            resultado(partido.golesLocal, partido.golesVisitante);

          racha = acerto ? racha + 1 : 0;
          if (racha > 0 && racha % 3 === 0) total += 2;
        }

        return { ...u, puntos: total };
      });

      ranking.sort((a, b) => b.puntos - a.puntos);
      return enviar(res, 200, ranking);
    }

    if (url.pathname === "/api/predicciones" &&
        req.method === "POST") {
      const d = await cuerpo(req);
      const usuario = db.usuarios.find(u => u.id === d.usuarioId);
      const partido = db.partidos.find(p => p.id === d.partidoId);

      if (!usuario || !partido) {
        return enviar(res, 404, { error: "Usuario o partido no existe" });
      }

      if (!Number.isInteger(d.golesLocal) ||
          !Number.isInteger(d.golesVisitante) ||
          d.golesLocal < 0 || d.golesVisitante < 0) {
        return enviar(res, 400, { error: "Marcador inválido" });
      }

      if (Date.now() >= new Date(partido.fecha).getTime()) {
        return enviar(res, 409, {
          error: "Las predicciones están cerradas"
        });
      }

      const pred = {
        usuarioId: d.usuarioId,
        partidoId: d.partidoId,
        golesLocal: d.golesLocal,
        golesVisitante: d.golesVisitante,
        fechaRegistro: new Date().toISOString()
      };

      db.predicciones = db.predicciones.filter(
        p => !(p.usuarioId === pred.usuarioId &&
               p.partidoId === pred.partidoId)
      );
      db.predicciones.push(pred);
      guardar(db);

      return enviar(res, 201, {
        mensaje: "Predicción guardada",
        prediccion: pred
      });
    }

    if (url.pathname === "/api/salas" && req.method === "GET") {
      return enviar(res, 200, db.salas);
    }

    if (url.pathname === "/api/salas" && req.method === "POST") {
      const d = await cuerpo(req);
      if (typeof d.nombre !== "string" ||
          !d.nombre.trim() ||
          !db.usuarios.some(u => u.id === d.creadorId)) {
        return enviar(res, 400, { error: "Datos inválidos" });
      }

      const sala = {
        id: crypto.randomUUID(),
        nombre: d.nombre.trim(),
        codigo: crypto.randomBytes(4).toString("hex").toUpperCase(),
        creadorId: d.creadorId,
        miembros: [d.creadorId]
      };

      db.salas.push(sala);
      guardar(db);
      return enviar(res, 201, sala);
    }

    if (url.pathname === "/api/salas/unirse" &&
        req.method === "POST") {
      const d = await cuerpo(req);
      const sala = db.salas.find(s => s.codigo === d.codigo);

      if (!sala || !db.usuarios.some(u => u.id === d.usuarioId)) {
        return enviar(res, 404, { error: "Sala o usuario no encontrado" });
      }

      if (!sala.miembros.includes(d.usuarioId)) {
        sala.miembros.push(d.usuarioId);
      }

      guardar(db);
      return enviar(res, 200, sala);
    }

    return enviar(res, 404, { error: "Ruta no encontrada" });
  } catch (error) {
    return enviar(res, 500, { error: error.message });
  }
});

servidor.listen(PORT, "0.0.0.0", () => {
  console.log(`Champions Predictor ejecutándose en puerto ${PORT}`);
});
