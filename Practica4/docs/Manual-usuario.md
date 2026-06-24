# Manual de Usuario - RoboMaze

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**  
**Inteligencia Artificial 1**  
**Estudiante:** Daniel Gálvez - 202203361

---

## 1. Introducción

RoboMaze es una aplicación web interactiva diseñada para la visualización, ejecución y análisis comparativo de algoritmos de búsqueda en espacios de estados (BFS, DFS y A*). El sistema permite a los usuarios crear, cargar y modificar laberintos bidimensionales, definir puntos de inicio y múltiples objetivos, y observar el comportamiento de los algoritmos de inteligencia artificial mediante animaciones paso a paso y tableros de carrera simultánea.

---

## 2. Requisitos del Sistema

Para la correcta instalación y ejecución de RoboMaze, el equipo debe contar con:

- **Sistema Operativo:** Windows, Linux o macOS.
- **Python 3.11 o superior** (para el Backend).
- **Node.js 18.x o superior y npm** (para el Frontend).
- **Navegador Web moderno y actualizado** (Chrome, Firefox, Edge).
- **Conexión a internet** (solo para la instalación inicial de dependencias).

---

## 3. Instalación y Ejecución

El sistema está compuesto por dos módulos independientes que deben ejecutarse simultáneamente.

### 3.1. Despliegue del Backend (Python / FastAPI)

1. Abrir una terminal y navegar hasta la carpeta `backend` del proyecto.
2. (Opcional pero recomendado) Crear y activar un entorno virtual de Python.
3. Instalar las dependencias necesarias ejecutando:
   ```bash
   pip install -r requirements.txt
   ```
4. Iniciar el servidor de la API REST ejecutando:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. El backend quedará expuesto en `http://localhost:8000`.

### 3.2. Despliegue del Frontend (React / Vite)

1. Abrir una nueva terminal y navegar hasta la carpeta `frontend` del proyecto.
2. Instalar las dependencias de Node.js ejecutando:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo ejecutando:
   ```bash
   npm run dev
   ```
4. El sistema estará disponible en el navegador en la dirección indicada por Vite (generalmente `http://localhost:5173`).

---

## 4. Guía de Uso del Sistema

### 4.1. Interfaz Principal y Controles

Al acceder a la aplicación, el usuario se encuentra con la interfaz principal dividida en tres secciones: el panel de controles izquierdo (herramientas de generación y edición), el área central (cuadrícula del laberinto) y el panel derecho (métricas, gráficas y controles de ejecución).

![Creador de Laberintos](/Practica4/docs/images/creador-laberintos.png)  
**Figura 1:** Interfaz principal del sistema RoboMaze en modo edición.

### 4.2. Carga y Generación de Laberintos

El sistema ofrece múltiples formas de inicializar un entorno de trabajo:

- **Laberintos Predefinidos:** En el panel izquierdo, el usuario puede seleccionar uno de los 5 laberintos de prueba almacenados en el sistema.
- **Generación Aleatoria:** Especificando el número de filas y columnas, el sistema genera un laberinto perfecto mediante un algoritmo de tallado recursivo.
- **Cuadrícula Vacía:** Permite crear un lienzo en blanco para diseñar un laberinto desde cero.
- **Importación de JSON:** El usuario puede cargar un laberinto previamente guardado en formato JSON.

![Selector de Laberintos](/Practica4/docs/images/selector-laberintos-prehechos.png)  
**Figura 2:** Menú de selección de laberintos preconfigurados.

### 4.3. Modo Edición y Herramientas de Pintura

Una vez cargado o generado el laberinto, el usuario puede interactuar con la cuadrícula utilizando las herramientas de pintura:

- **Pared (Wall):** Permite dibujar obstáculos bloqueando el paso del agente.
- **Borrador (Eraser):** Elimina paredes, puntos de inicio o objetivos.
- **Inicio (Start):** Define la posición inicial del agente. Solo puede existir un punto de inicio.
- **Objetivo (Target):** Define las metas a alcanzar. El sistema soporta múltiples objetivos simultáneos.

![Modo Edición](/Practica4/docs/images/modo-edicion-laberintos.png)  
**Figura 3:** Cuadrícula interactiva con herramientas de edición activas.

### 4.4. Ejecución Individual de Algoritmos

En el panel derecho, el usuario puede seleccionar el algoritmo de búsqueda deseado (BFS, DFS o A*) y ejecutar la resolución. El sistema enviará la matriz, el inicio y los objetivos al backend, y animará la exploración de nodos en el frontend con un intervalo de 35ms por cuadro.

- **Detener Animación:** El usuario puede pausar la animación en cualquier momento.
- **Recálculo Dinámico:** Si el usuario modifica el laberinto (agrega paredes o cambia el inicio/objetivos) mientras hay una ruta estática, el sistema recalcula automáticamente la nueva ruta.

![Opciones de Ejecución](/Practica4/docs/images/opciones-ejecución-individual.png)  
**Figura 4:** Panel de control para la ejecución secuencial de algoritmos.

### 4.5. Modo Comparativo (Carrera de Algoritmos)

Para un análisis profundo, el sistema incluye un modo de carrera que ejecuta BFS, DFS y A* de forma simultánea sobre el mismo laberinto. Al activar esta opción, la interfaz renderiza tres tableros paralelos que animan la exploración de cada algoritmo al mismo tiempo, permitiendo contrastar visualmente sus estrategias de expansión.

![Opción Comparación](/Practica4/docs/images/opcion-comparacion.png)  
**Figura 5:** Botón de activación del modo carrera.

![Comparación Visual](/Practica4/docs/images/compacion-BFS-DFS-A.png)  
**Figura 6:** Renderizado del modo carrera mostrando los tres tableros paralelos.

### 4.6. Métricas y Exportación de Reportes

Tras la ejecución, el panel derecho muestra las métricas de rendimiento (tiempo de ejecución en milisegundos y cantidad de nodos explorados). En el modo comparativo, se genera una gráfica de barras interactiva.

El sistema permite exportar estas métricas en tres formatos:

- **CSV:** Para procesamiento en hojas de cálculo básicas.
- **Excel (XLSX):** Para reportes estructurados.
- **PDF:** Para inclusión en documentos técnicos o académicos.

![Exportación de Rendimiento](/Practica4/docs/images/opciones-export-rendimiento.png)  
**Figura 7:** Panel de exportación de métricas en múltiples formatos.

![Gráfica de Rendimiento](/Practica4/docs/images/grafica-rendimiento.png)  
**Figura 8:** Dashboard de métricas analíticas y gráficas comparativas.

### 4.7. Retorno al Modo Edición

Al finalizar la animación o detenerla manualmente, el sistema limpia las secuencias de exploración pero conserva la ruta final y la estructura del laberinto, permitiendo al usuario continuar editando o ejecutar un nuevo algoritmo sin perder el estado actual.

![Volver a Edición](/Practica4/docs/images/volver-edicion-1-cuadricula.png)  
**Figura 9:** Interfaz tras finalizar la animación, lista para nueva edición.

---

## 5. Solución de Problemas Comunes (Troubleshooting)

### El frontend no logra conectarse con el backend

- Verificar que el servidor de FastAPI esté ejecutándose en el puerto 8000.
- Asegurar que no existan bloqueos de firewall o extensiones de navegador que impidan las peticiones HTTP locales.

### La animación se congela o el navegador se vuelve lento

- Laberintos de dimensiones extremadamente grandes pueden generar miles de nodos explorados. Se recomienda reducir el tamaño de la cuadrícula para mantener un rendimiento óptimo en la animación.

### El algoritmo indica "Sin solución"

- Verificar que exista un camino transitable entre el punto de inicio y todos los objetivos definidos.
- Asegurar que el punto de inicio y los objetivos no estén bloqueados por paredes.

---

## 6. Conclusiones de Uso

RoboMaze proporciona una experiencia intuitiva para el estudio de algoritmos de inteligencia artificial. La separación entre la lógica de resolución (backend) y la visualización (frontend) garantiza que el usuario pueda interactuar con el sistema de forma fluida, obteniendo retroalimentación visual y analítica inmediata sobre el comportamiento de BFS, DFS y A* en entornos dinámicos.