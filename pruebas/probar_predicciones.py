import json
import urllib.request
import urllib.error

BASE = "http://localhost:8081/api"

predicciones = [
    (1, 1, 2, 1),
    (1, 2, 3, 1),
    (1, 3, 2, 0),
    (2, 1, 1, 1),
    (2, 2, 2, 1),
    (3, 1, 0, 2),
    (3, 3, 1, 1),
]

print("===== REGISTRO DE PREDICCIONES =====")

for usuario, partido, local, visita in predicciones:
    datos = {
        "usuarioId": usuario,
        "partidoId": partido,
        "golesLocal": local,
        "golesVisitante": visita
    }

    req = urllib.request.Request(
        BASE + "/predicciones",
        data=json.dumps(datos).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            respuesta = json.load(r)
            print(
                f"PASS | Usuario {usuario} | "
                f"Partido {partido} | {local}-{visita}"
            )
    except urllib.error.HTTPError as e:
        print("FAIL", e.code, e.read().decode())

print("\n===== PREDICCIONES ALMACENADAS =====")

with open("backend/datos.json", encoding="utf-8") as f:
    db = json.load(f)

for p in db["predicciones"]:
    print(
        f"Usuario {p['usuarioId']} | "
        f"Partido {p['partidoId']} | "
        f"{p['golesLocal']}-{p['golesVisitante']}"
    )

print("\nTOTAL:", len(db["predicciones"]))
