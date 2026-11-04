import concurrent.futures
import urllib.request
import time
import statistics
import json
from collections import Counter

URL = "http://localhost:8081/api/health"
TOTAL = 1000
USUARIOS = 20

def solicitud(numero):
    inicio = time.perf_counter()
    try:
        with urllib.request.urlopen(URL, timeout=10) as respuesta:
            datos = json.loads(respuesta.read())
            duracion = (time.perf_counter() - inicio) * 1000
            return {
                "ok": respuesta.status == 200,
                "ms": duracion,
                "instancia": datos.get("instancia", "desconocida")
            }
    except Exception:
        return {
            "ok": False,
            "ms": (time.perf_counter() - inicio) * 1000,
            "instancia": "error"
        }

print("===== CHAMPIONS PREDICTOR - STRESS TEST =====")
print(f"Solicitudes: {TOTAL}")
print(f"Usuarios simultáneos: {USUARIOS}")

inicio = time.perf_counter()

with concurrent.futures.ThreadPoolExecutor(
    max_workers=USUARIOS
) as executor:
    resultados = list(executor.map(solicitud, range(TOTAL)))

tiempo_total = time.perf_counter() - inicio

exitos = sum(r["ok"] for r in resultados)
errores = TOTAL - exitos
tiempos = [r["ms"] for r in resultados if r["ok"]]
instancias = Counter(
    r["instancia"] for r in resultados if r["ok"]
)

reporte = {
    "solicitudes": TOTAL,
    "usuarios_simultaneos": USUARIOS,
    "exitos": exitos,
    "errores": errores,
    "tiempo_total_segundos": round(tiempo_total, 2),
    "solicitudes_por_segundo": round(TOTAL / tiempo_total, 2),
    "latencia_promedio_ms": round(statistics.mean(tiempos), 2)
        if tiempos else None,
    "latencia_maxima_ms": round(max(tiempos), 2)
        if tiempos else None,
    "distribucion": dict(instancias)
}

print(json.dumps(reporte, indent=4, ensure_ascii=False))

with open("pruebas/resultados_stress.json", "w") as archivo:
    json.dump(reporte, archivo, indent=4)

print("Reporte guardado en pruebas/resultados_stress.json")
