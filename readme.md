# 🏆 Champions Predictor 2026/27

Aplicación web desarrollada como proyecto académico para el curso de **Desarrollo de Soluciones en la Nube – TECSUP**.

## 📌 Descripción

Champions Predictor es una aplicación que permite a los usuarios realizar predicciones de los resultados de partidos de la UEFA Champions League 2026/27, acumular puntos y competir con otros participantes mediante un ranking.

El proyecto tiene fines educativos y utiliza partidos de demostración.

## 🚀 Funcionalidades

- Visualización de partidos de fútbol.
- Registro de predicciones de resultados.
- Ranking de participantes.
- Historial de predicciones por usuario.
- Creación de salas con códigos de invitación.
- Sistema de puntuación con bonificaciones.
- Despliegue mediante contenedores Docker.
- Escalamiento horizontal con dos instancias de backend.
- Balanceo de carga utilizando Nginx.
- Pruebas de estrés y rendimiento.

## 🛠️ Tecnologías utilizadas

- **Frontend:** HTML, CSS y JavaScript.
- **Backend:** Node.js.
- **Almacenamiento:** JSON.
- **Contenedores:** Docker y Docker Compose.
- **Balanceador de carga:** Nginx.
- **Entorno de desarrollo:** Google Cloud Shell.
- **Control de versiones:** Git y GitHub.

## 🏗️ Arquitectura del sistema

El proyecto utiliza una arquitectura basada en contenedores, con dos instancias del backend y un balanceador de carga.

```text
           USUARIO
              |
              v
            NGINX
        Balanceador
              |
       +------+------+
       |             |
       v             v
   BACKEND 1     BACKEND 2
       |             |
       +------+------+
              |
              v
       DATOS COMPARTIDOS
            JSON

Frontend: Nginx (servidor web)
```

## 🐳 Ejecución con Docker

**1. Clonar el repositorio**

```bash
git clone https://github.com/Chanok18/Lab11_DSN.git
cd Lab11_DSN
```

**2. Preparar los datos de ejemplo**

```bash
cp backend/datos.example.json backend/datos.json
```

**3. Construir y ejecutar los contenedores**

```bash
docker compose up -d --build
```

**4. Verificar los contenedores**

```bash
docker compose ps
```

**5. Acceder a la aplicación**

```text
http://localhost:8081
```

## ⚽ Sistema de puntuación

| Regla | Puntos |
|---|---|
| Resultado exacto | 5 puntos |
| Ganador o empate correcto | 3 puntos |
| Diferencia de goles correcta | 2 puntos |
| Racha de 3 aciertos consecutivos | +2 puntos |
| Predicción con más de 24 horas de anticipación | +1 punto |

## 🧪 Pruebas realizadas

Se implementaron pruebas para verificar el funcionamiento del sistema:

- Pruebas de los endpoints de la API.
- Comprobación del balanceo de carga.
- Pruebas de puntuación.
- Pruebas de estrés con 1000 solicitudes y 20 trabajadores concurrentes.

**Ejecutar pruebas:**

```bash
python3 pruebas/stress_test.py
python3 pruebas/test_puntuacion.py
```

## 📚 Información académica

- **Institución:** TECSUP
- **Curso:** Desarrollo de Soluciones en la Nube
- **Laboratorio:** Despliegue de Instancias Virtualizadas
- **Estudiante:** Kevin Quispe Ccolque
- **Docente:** Jaime Farfán

## 📄 Nota

Este proyecto fue desarrollado únicamente con fines educativos. No involucra apuestas ni dinero real. Los encuentros y resultados utilizados son de demostración.