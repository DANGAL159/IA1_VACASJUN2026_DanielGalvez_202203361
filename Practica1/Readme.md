# Sistema de Rutas Más Cortas (IA1)

Aplicación web híbrida desarrollada para la resolución del problema de búsqueda de la ruta más corta entre ciudades. El sistema implementa una arquitectura desacoplada donde **SWI-Prolog** actúa como el único motor de inferencia lógica, **Python (FastAPI)** funciona como capa de integración bajo el patrón MVC, y **React** conforma la interfaz gráfica de usuario interactiva.

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**  
**Inteligencia Artificial 1**  
**Estudiante:** Daniel Gálvez - 202203361

---

## Características Principales

- **Motor Lógico Puro**: Toda la lógica de búsqueda (DFS) y optimización reside en Prolog. Python solo actúa como orquestador.
- **Patrón MVC en Backend**: Separación estricta entre controladores (routers), modelos (schemas Pydantic) y servicios (lógica de negocio).
- **Visualización Interactiva**: Renderizado dinámico del grafo utilizando `ReactFlow` y cálculo automático de posiciones con `dagre`.
- **CRUD Completo**: Capacidad para agregar, eliminar y modificar ciudades y conexiones en tiempo de ejecución.
- **Persistencia en Disco**: Los cambios realizados en el grafo se guardan físicamente en el archivo `conocimiento.pl` con codificación UTF-8, sobreviviendo a reinicios del servidor.
- **Búsqueda Múltiple**: Consulta de la ruta óptima (más corta) o listado de todas las trayectorias válidas posibles.

---

## Tecnologías Utilizadas

### Backend
- **Python 3.10+**: Lenguaje de programación principal.
- **FastAPI**: Framework web asíncrono para la construcción de la API REST.
- **Pydantic**: Validación de datos y gestión de configuraciones.
- **PySwip**: Puente de comunicación entre Python y el intérprete de SWI-Prolog.
- **SWI-Prolog**: Motor de inferencia lógica y base de conocimiento.

### Frontend
- **React 18+**: Biblioteca para la construcción de la interfaz de usuario.
- **Vite**: Herramienta de compilación y servidor de desarrollo.
- **ReactFlow**: Librería para la renderización de grafos interactivos.
- **dagre**: Algoritmo de layout para el posicionamiento automático de nodos.

---

## Requisitos Previos

Antes de iniciar, asegúrate de tener instalados los siguientes componentes en tu sistema:

1. **Python 3.10 o superior**: [Descargar Python](https://www.python.org/downloads/)
2. **Node.js 18 o superior**: [Descargar Node.js](https://nodejs.org/)
3. **SWI-Prolog**: Es **obligatorio** tenerlo instalado en el sistema operativo para que la librería `pyswip` funcione correctamente.
   - Windows: Instalador oficial de SWI-Prolog.
   - macOS: `brew install swi-prolog`
   - Linux (Ubuntu/Debian): `sudo apt install swi-prolog`

---

## Instalación y Configuración

Sigue estos pasos para configurar el entorno de desarrollo local.

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Practica1
```

### 2. Configuración del Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configuración del Frontend
```bash
cd ../frontend

# Instalar dependencias de Node.js
npm install
```

---

## Ejecución del Proyecto

Debes ejecutar el backend y el frontend en terminales separadas.

### Terminal 1: Backend (FastAPI)
```bash
cd backend
# Asegúrate de que el entorno virtual esté activado
uvicorn main:app --reload --port 8000
```
El servidor backend estará disponible en: `http://localhost:8000`  
La documentación interactiva de la API (Swagger) en: `http://localhost:8000/docs`

### Terminal 2: Frontend (React)
```bash
cd frontend
npm run dev
```
La aplicación web estará disponible en: `http://localhost:5173`

---

## Estructura del Proyecto

```text
Practica1/
 ├── backend/                 # Capa de integración y motor lógico
 │   ├── config/              # Gestión de persistencia y configuración
 │   ├── models/              # Esquemas de validación (Pydantic)
 │   ├── routers/             # Controladores de endpoints (MVC)
 │   ├── services/            # Lógica de negocio y puente PySwip
 │   ├── conocimiento.pl      # Base de conocimiento (Hechos y Reglas)
 │   ├── main.py              # Punto de entrada de FastAPI
 │   └── requirements.txt     # Dependencias de Python
 ├── frontend/                # Capa de presentación (React + Vite)
 │   ├── src/
 │   │   ├── components/      # Componentes reutilizables (ej. Toast)
 │   │   ├── App.jsx          # Componente raíz y lógica de estado
 │   │   └── App.css          # Estilos de la aplicación
 │   └── package.json         # Dependencias de Node.js
 └── docs/                    # Documentación del proyecto
     ├── images/              # Recursos gráficos para los manuales
     ├── manual_tecnico.md    # Documentación de arquitectura y código
     └── manual_usuario.md    # Guía de uso para el usuario final
```

---

## Endpoints Principales de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/rutas/optima?origen=X&destino=Y` | Ejecuta la inferencia de la ruta de menor peso. |
| `GET` | `/rutas/todas?origen=X&destino=Y` | Retorna todas las trayectorias válidas posibles. |
| `GET` | `/grafo/` | Obtiene todos los nodos y aristas actuales del grafo. |
| `POST` | `/grafo/ciudad` | Inserta un nuevo vértice aislado en la memoria lógica. |
| `DELETE` | `/grafo/ciudad/{nombre}` | Elimina un vértice y todas sus aristas conectadas. |
| `POST` | `/grafo/conexion` | Crea una arista bidireccional entre dos nodos existentes. |
| `PUT` | `/grafo/conexion/{O}/{D}` | Actualiza el peso (distancia) de una arista específica. |
| `POST` | `/grafo/guardar` | Persiste los cambios de memoria al archivo `conocimiento.pl`. |

---

## Documentación Adicional

Para obtener información detallada sobre la arquitectura, la lógica en Prolog o las instrucciones de uso de la interfaz, consulta los siguientes documentos:

- [Manual Técnico](/Practica1/docs/manual_tecnico.md): Arquitectura, justificación de patrones de diseño, explicación de predicados y estructura del código.
- [Manual de Usuario](/Practica1/docs/manual_usuario.md): Guía paso a paso para la operación del sistema, gestión del grafo y resolución de errores comunes.

---

## Solución de Problemas Comunes

1. **Error `ModuleNotFoundError: No module named 'pyswip'`**: Asegúrate de haber activado el entorno virtual antes de ejecutar `pip install`.
2. **Error `libswipl` no encontrado**: Significa que SWI-Prolog no está instalado en tu sistema operativo o no está en las variables de entorno (PATH). Verifica ejecutando `swipl --version` en tu terminal.
3. **Error de CORS en el frontend**: Asegúrate de que el backend esté corriendo en el puerto 8000 y que el middleware CORS en `main.py` esté configurado para permitir `http://localhost:5173`.

