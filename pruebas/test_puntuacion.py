from datetime import datetime, timedelta, timezone

def calcular(pred, real, anticipacion_horas=48):
    exacto = pred == real
    ganador = (pred[0] > pred[1]) - (pred[0] < pred[1])
    ganador_real = (real[0] > real[1]) - (real[0] < real[1])

    acierto_ganador = ganador == ganador_real
    diferencia = pred[0] - pred[1] == real[0] - real[1]

    puntos = 5 if exacto else (
        (3 if acierto_ganador else 0) +
        (2 if diferencia else 0)
    )

    if anticipacion_horas > 24:
        puntos += 1

    return puntos

casos = [
    ("Resultado exacto", (2,1), (2,1), 48, 6),
    ("Ganador correcto", (2,0), (1,0), 10, 3),
    ("Diferencia correcta", (3,1), (2,0), 10, 5),
    ("Empate correcto", (1,1), (0,0), 10, 5),
    ("Predicción incorrecta", (1,0), (0,2), 10, 0),
    ("Predicción anticipada", (2,0), (1,0), 48, 4),
    ("Exactamente 24 horas", (2,1), (2,1), 24, 5),
]

print("===== PRUEBAS DE PUNTUACIÓN =====")

aprobadas = 0

for nombre, pred, real, horas, esperado in casos:
    obtenido = calcular(pred, real, horas)
    ok = obtenido == esperado
    aprobadas += ok
    print(
        f"{'PASS' if ok else 'FAIL'} | "
        f"{nombre}: {obtenido} puntos"
    )

racha = [True, True, True, True, True, True]
bonus = sum(
    2 for i in range(1, len(racha) + 1)
    if i % 3 == 0 and all(racha[i-3:i])
)
ok = bonus == 4
aprobadas += ok
print(f"{'PASS' if ok else 'FAIL'} | Racha de 6: +{bonus} puntos")

print(f"\nRESULTADO: {aprobadas}/8 pruebas correctas")
