# Manual Técnico - Sistema de Rutas Más Cortas (IA1)

**Universidad de San Carlos de Guatemala**
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**
**Inteligencia Artificial 1**
**Estudiante:** Daniel Gálvez - 202203361

---

## 1. Introducción

El presente documento describe la arquitectura, estructura e integración del sistema desarrollado para la resolución del problema de búsqueda de la ruta más corta entre ciudades. El sistema implementa una solución híbrida donde **Prolog** actúa como el único motor de inferencia lógica y **Python (FastAPI)** funciona como capa de integración bajo un patrón MVC, mientras que **React** conforma la interfaz gráfica de usuario interactiva.

---

## 2. Arquitectura Implementada

### 2.1 Patrón de Arquitectura: Cliente-Servidor con MVC en Backend

El proyecto evoluciona de un diseño monolítico a una arquitectura **Cliente-Servidor con el backend estructurado bajo el patrón Modelo-Vista-Controlador (MVC)**. Esto separa claramente las responsabilidades del sistema:

![](/Practica1/docs/images/0-Arch.png)

### 2.2 Justificación del Patrón

* **Desacoplamiento estricto**: Prolog resuelve la lógica de grafos matemáticamente, Python orquesta el tráfico web y React dibuja la interfaz. Ninguna capa asume responsabilidades de la otra.
* **Mantenibilidad MVC**: Separar las rutas HTTP (`routers/`), la lógica de negocio temporal (`services/`) y los moldes de datos (`models/`) facilita la escalabilidad y lectura del código.
* **Cumplimiento de restricciones**: Se garantiza que Python no implementa algoritmos de búsqueda; se limita a consultar el archivo `.pl`.

### 2.3 ¿Por qué MVC y no una arquitectura monolítica?

La decisión de implementar MVC responde a necesidades específicas del proyecto:

**Separación de Responsabilidades:**

* **Modelo (`models/schemas.py`)**: Centraliza la validación de datos mediante Pydantic. Si cambian las reglas de validación (por ejemplo, una ciudad debe tener nombre único o la distancia debe ser un entero positivo), solo se modifica en un lugar.
* **Vista (React)**: El frontend no conoce nada de Prolog ni de bases de datos. Solo consume JSON. Esto permite cambiar el backend sin tocar el frontend.
* **Controlador (`routers/`)**: Orquesta las peticiones HTTP. Si mañana se agrega autenticación JWT, solo se modifican los routers, no el motor lógico.

**Ventajas para este proyecto específico:**

1. **Python como "pegamento"**: FastAPI actúa como middleware que traduce entre el mundo web (HTTP/JSON) y el mundo lógico (Prolog). Sin MVC, el código se volvería espagueti mezclando consultas Prolog con respuestas HTTP.
2. **Testing independiente**: Se puede probar el motor Prolog sin levantar el servidor web, y viceversa.
3. **Escalabilidad**: Si se requiere agregar más algoritmos (A*, Dijkstra), solo se agregan reglas en Prolog y endpoints en `routers/rutas.py`, sin afectar la capa de presentación.

**Comparación con alternativa monolítica:**

En un diseño monolítico, una función que busca la ruta más corta tendría que:
* Recibir parámetros HTTP
* Validar datos
* Consultar Prolog
* Formatear respuesta JSON
* Manejar errores HTTP

Con MVC, cada responsabilidad está aislada, facilitando el mantenimiento y la depuración.

---

## 3. Estructura del Proyecto

El código fuente está organizado de la siguiente manera para separar el entorno visual del motor lógico, aplicando los principios de separación de concerns y modularidad.

### 3.1 Estructura General

```text
Practica1/
 ├── backend/                 # Capa de integración y motor lógico
 ├── frontend/                # Capa de presentación (React + Vite)
 └── docs/                    # Documentación del proyecto
     ├── images/              # Recursos gráficos para los manuales
     ├── manual_tecnico.md    # Este documento
     └── manual_usuario.md    # Guía para el usuario final
```

### 3.2 Estructura del Backend (Python + FastAPI + Prolog)

```text
backend/
 ├── config/
 │   └── database.py          # Gestor de instancia Prolog y escritura a disco
 ├── models/
 │   └── schemas.py           # Esquemas de validación Pydantic (Capa Modelo)
 ├── routers/
 │   ├── grafo.py             # Endpoints para operaciones CRUD (Capa Controlador)
 │   └── rutas.py             # Endpoints para algoritmos de búsqueda (Capa Controlador)
 ├── services/
 │   └── prolog_service.py    # Abstracción de consultas PySwip (Lógica de negocio)
 ├── conocimiento.pl          # Base de conocimiento (Hechos y Reglas Prolog)
 ├── main.py                  # Punto de entrada ASGI de FastAPI
 └── requirements.txt         # Dependencias de Python
```

#### Descripción detallada de cada archivo:

**`config/database.py`**
Es el módulo encargado de la gestión de la persistencia física del sistema. Sus responsabilidades son:
* Inicializar la instancia embebida de SWI-Prolog al arrancar el servidor.
* Cargar el archivo `conocimiento.pl` en memoria al iniciar la aplicación.
* Ejecutar el proceso de volcado (dump) de los hechos dinámicos actuales hacia el archivo físico.
* Manejar la codificación UTF-8 para preservar caracteres especiales (tildes, ñ).
* Preservar las reglas algorítmicas estáticas al reescribir el archivo, actualizando únicamente la sección de hechos dinámicos.

**`models/schemas.py`**
Contiene las definiciones de los esquemas de validación usando **Pydantic**. Actúa como la capa Modelo del patrón MVC. Define las estructuras de datos que la API acepta y retorna:
* `CiudadRequest`: Valida el nombre de una ciudad (cadena no vacía).
* `ConexionRequest`: Valida origen, destino y distancia (entero positivo).
* `RutaResponse`: Estructura de respuesta para las consultas de rutas.
* `MensajeResponse`: Estructura estándar para mensajes de éxito o error.

**`routers/grafo.py`**
Contiene los endpoints HTTP relacionados con la manipulación del grafo. Actúa como capa Controlador:
* `GET /grafo/`: Obtiene todos los nodos y aristas.
* `POST /grafo/ciudad`: Inserta una nueva ciudad.
* `DELETE /grafo/ciudad/{nombre}`: Elimina una ciudad y sus conexiones.
* `POST /grafo/conexion`: Crea una arista bidireccional.
* `PUT /grafo/conexion/{O}/{D}`: Actualiza el peso de una arista.
* `POST /grafo/guardar`: Persiste los cambios en disco.

**`routers/rutas.py`**
Contiene los endpoints HTTP relacionados con la búsqueda de rutas:
* `GET /rutas/optima`: Ejecuta la inferencia de la ruta de menor peso.
* `GET /rutas/todas`: Retorna todas las trayectorias válidas posibles.

**`services/prolog_service.py`**
Es el puente de comunicación entre Python y Prolog. Sus responsabilidades son:
* Encapsular las llamadas a PySwip.
* Traducir las respuestas lógicas de Prolog en estructuras JSON nativas de Python.
* Manejar los errores de inferencia (cuando no existe una ruta, por ejemplo).
* Ejecutar los predicados CRUD (`agregar_ciudad`, `eliminar_conexion`, etc.).

**`conocimiento.pl`**
Es la base de conocimiento escrita en SWI-Prolog. Contiene:
* Declaraciones `:- dynamic/1` para habilitar la modificación en tiempo de ejecución.
* Hechos dinámicos iniciales (ciudades de Guatemala y sus conexiones).
* Reglas de conexión bidireccional (`conectado/3`).
* Algoritmos de búsqueda (`ruta/4` y `ruta_mas_corta/4`).
* Predicados CRUD (`agregar_ciudad/1`, `eliminar_ciudad/1`, `actualizar_distancia/3`, `eliminar_conexion/2`).

**`main.py`**
Es el punto de entrada ASGI de la aplicación FastAPI. Sus responsabilidades son:
* Instanciar la aplicación FastAPI.
* Configurar los middlewares (CORS para permitir peticiones desde React).
* Registrar los routers (`grafo.py` y `rutas.py`).
* Ejecutar la inicialización de la base de conocimiento al arrancar.

**`requirements.txt`**
Lista las dependencias de Python necesarias para ejecutar el backend:
* `fastapi`: Framework web asíncrono.
* `uvicorn`: Servidor ASGI.
* `pyswip`: Puente entre Python y SWI-Prolog.
* `pydantic`: Validación de datos.

### 3.3 Estructura del Frontend (React + Vite)

```text
frontend/
 ├── public/
 │   ├── favicon.svg          # Ícono de la pestaña del navegador
 │   └── icons.svg            # Conjunto de íconos SVG reutilizables
 ├── src/
 │   ├── assets/
 │   │   ├── hero.png         # Imagen principal o de presentación
 │   │   ├── react.svg        # Logo de React
 │   │   └── vite.svg         # Logo de Vite
 │   ├── components/
 │   │   └── Toast.jsx        # Componente de notificaciones emergentes
 │   ├── App.css              # Estilos específicos del componente App
 │   ├── App.jsx              # Componente raíz con lógica de estado y vistas
 │   ├── index.css            # Estilos globales de la aplicación
 │   └── main.jsx             # Punto de entrada de React (montaje del DOM)
 ├── eslint.config.js         # Configuración del linter ESLint
 ├── index.html               # Plantilla HTML base de la SPA
 ├── package.json             # Dependencias y scripts de Node.js
 ├── package-lock.json        # Versiones exactas de dependencias
 ├── README.md                # Documentación del frontend
 └── vite.config.js           # Configuración del bundler Vite
```

#### Descripción detallada de cada archivo:

**`public/`**
Carpeta de recursos estáticos que se sirven directamente sin procesamiento:
* `favicon.svg`: Ícono que aparece en la pestaña del navegador.
* `icons.svg`: Sprite de íconos SVG reutilizables en la interfaz.

**`src/assets/`**
Recursos gráficos procesados por Vite durante el build:
* `hero.png`: Imagen principal o de bienvenida.
* `react.svg` y `vite.svg`: Logos de las tecnologías utilizadas.

**`src/components/Toast.jsx`**
Componente reutilizable que renderiza notificaciones emergentes (toasts). Captura los mensajes de éxito o error provenientes de las peticiones HTTP y los muestra de manera amigable al usuario con temporizador de auto-cierre.

**`src/App.jsx`**
Es el componente raíz de la aplicación. Contiene:
* La lógica de estado principal (ciudades, conexiones, rutas encontradas).
* La integración con `ReactFlow` para el renderizado del grafo.
* La integración con `dagre` para el cálculo automático de posiciones.
* Las llamadas HTTP a la API REST mediante `fetch` o `axios`.
* La suscripción a los eventos de notificaciones.

**`src/App.css` y `src/index.css`**
Hojas de estilo que definen la apariencia visual:
* `index.css`: Estilos globales (reset CSS, tipografía, variables de color).
* `App.css`: Estilos específicos del layout principal, paneles de control y animaciones de las rutas resaltadas.

**`src/main.jsx`**
Punto de entrada de React. Su única responsabilidad es montar el componente `App` en el elemento raíz del DOM (`<div id="root">` en `index.html`).

**`index.html`**
Plantilla HTML base de la Aplicación de Página Única (SPA). Contiene el contenedor donde React inyectará la interfaz y las etiquetas `<script>` que cargan los bundles generados por Vite.

**`package.json`**
Manifiesto del proyecto Node.js. Define:
* Las dependencias de producción (React, ReactFlow, dagre).
* Las dependencias de desarrollo (Vite, ESLint).
* Los scripts de ejecución (`npm run dev`, `npm run build`).

**`package-lock.json`**
Archivo generado automáticamente que fija las versiones exactas de todas las dependencias, garantizando builds reproducibles en cualquier entorno.

**`eslint.config.js`**
Configuración del linter ESLint para mantener la calidad del código JavaScript/JSX, aplicando reglas de estilo y detectando errores potenciales.

**`vite.config.js`**
Configuración del bundler Vite. Define:
* El puerto de desarrollo (por defecto 5173).
* Las reglas de resolución de módulos.
* La configuración del servidor de desarrollo con proxy hacia el backend si es necesario.

## 4. Lógica de Búsqueda y Reglas en Prolog

### 4.1 ¿Por qué Prolog para este problema?

Imagina que quieres encontrar la ruta más corta entre dos ciudades. En Python o Java, tendrías que escribir **paso a paso** cómo buscar: crear una cola, marcar ciudades visitadas, recorrer vecinos, etc. Es como darle instrucciones detalladas a un robot.

En Prolog es diferente: tú le dices **QUÉ** es el problema (ciudades, conexiones, distancias) y **QUÉ** quieres (una ruta entre A y B), y Prolog usa su motor de inferencia para encontrar la solución automáticamente. Es como decirle a un experto: "Tengo estas ciudades conectadas así, encuéntrame la ruta más corta".

**Analogía simple:**
- **Python/Java (imperativo)**: "Toma este mapa, empieza en Guatemala, revisa cada ciudad vecina, anota las distancias, usa una cola..."
- **Prolog (declarativo)**: "Guatemala está conectada con Antigua (40km), Antigua con Chimaltenango (25km)... ¿Cuál es la ruta más corta de Guatemala a Quetzaltenango?"

### 4.2 Sintaxis Estricta de Variables

En Prolog, las variables SIEMPRE empiezan con mayúscula. Esto no es opcional:

```prolog
% CORRECTO: Variables en mayúscula
ruta(Origen, Destino, Ruta, Distancia) :- ...

% INCORRECTO: Si usas minúscula, Prolog piensa que es un nombre fijo
ruta(origen, destino, ruta, distancia) :- ...  % Esto busca literalmente "origen", no una variable
```

**Analogía:** Es como en matemáticas. Si escribes `x + 2 = 5`, `x` es una variable. Pero si escribes `juan + 2 = 5`, `juan` es un valor específico, no una variable.

---

## 4.3 Explicación Detallada de los Predicados

### 4.3.1 Hechos Dinámicos: La Base de Datos en Memoria

**¿Qué son los hechos dinámicos?**

Imagina que Prolog tiene una "base de datos" interna donde guarda información. Los hechos son como filas en una tabla:

```prolog
% Esto es como una tabla llamada "ciudad" con una columna
ciudad('guatemala').
ciudad('antigua').
ciudad('quetzaltenango').

% Esto es como una tabla llamada "conexion" con tres columnas: origen, destino, distancia
conexion('guatemala', 'antigua', 40).
conexion('antigua', 'chimaltenango', 25).
```

**¿Qué significa `:- dynamic`?**

Por defecto, Prolog trata los hechos como "congelados" - no puedes modificarlos después de cargar el archivo. Pero nosotros necesitamos agregar y eliminar ciudades en tiempo real (cuando el usuario hace clic en "Agregar Ciudad").

La línea `:- dynamic ciudad/1.` le dice a Prolog:
- `ciudad/1` significa "el predicado ciudad que tiene 1 argumento"
- `dynamic` significa "permíteme modificar esto mientras el programa corre"

**Sin esta línea, ¿qué pasa?**
```prolog
% Si intentas agregar una ciudad sin declararla como dynamic:
?- assertz(ciudad('peten')).
ERROR: No permission to modify static procedure 'ciudad/1'
```

**Con la línea dynamic:**
```prolog
% Ahora sí puedes modificar:
?- assertz(ciudad('peten')).
true.  % Éxito, la ciudad fue agregada
```

**Resumen visual:**
```
┌─────────────────────────────────────┐
│  Base de Conocimiento de Prolog     │
├─────────────────────────────────────┤
│  CIUDAD (tabla de 1 columna)        │
│  ┌──────────────────┐               │
│  │ guatemala        │ ← (dynamic)   │
│  │ antigua          │               │
│  │ quetzaltenango   │               │
│  └──────────────────┘               │
│                                     │
│  CONEXION (tabla de 3 columnas)     │
│  ┌──────────┬──────────┬────────┐   │
│  │ Origen   │ Destino  │ Dist   │   │
│  ├──────────┼──────────┼────────┤   │
│  │ guatemala│ antigua  │ 40     │ ← │
│  │ antigua  │ chimalt. │ 25     │   │
│  └──────────┴──────────┴────────┘   │
└─────────────────────────────────────┘
```

---

### 4.3.2 Conexión Bidireccional: El Truco para No Repetir Datos

**El problema:**

En el mundo real, si hay una carretera de Guatemala a Antigua, también puedes viajar de Antigua a Guatemala. Es bidireccional.

**Opción 1: Guardar ambas direcciones (redundante)**
```prolog
conexion('guatemala', 'antigua', 40).
conexion('antigua', 'guatemala', 40).  % ¡Duplicado!
```

Problemas:
- Ocupas el doble de espacio
- Si cambias la distancia, tienes que actualizar DOS líneas
- Riesgo de inconsistencia (actualizar una y olvidar la otra)

**Opción 2: Guardar solo una dirección y usar lógica (nuestra solución)**
```prolog
% Solo guardamos UNA vez:
conexion('guatemala', 'antigua', 40).

% Pero creamos una regla que dice "si existe A→B, también existe B→A":
conectado(X, Y, D) :- conexion(X, Y, D).   % Caso directo
conectado(X, Y, D) :- conexion(Y, X, D).   % Caso inverso
```

**¿Cómo funciona en la práctica?**

Cuando preguntas "¿Está conectada Antigua con Guatemala?":

```prolog
?- conectado('antigua', 'guatemala', D).
D = 40.  % ¡Funciona! Aunque solo guardamos 'guatemala' → 'antigua'
```

Prolog hace esto:
1. Primero intenta: `conexion('antigua', 'guatemala', D)` → Falla (no existe)
2. Luego intenta: `conexion('guatemala', 'antigua', D)` → Éxito (D=40)
3. Retorna D=40

**Analogía:** Es como tener una calle de doble sentido. No necesitas pintar dos flechas, solo una señal que diga "tráfico en ambos sentidos".

**Ventajas:**
- 50% menos datos almacenados
- Una sola actualización si cambia la distancia
- Imposible tener inconsistencias (A→B sin B→A)

---

### 4.3.3 Algoritmo de Búsqueda en Profundidad (DFS)

#### 4.3.3.1 El concepto de unificación en Prolog

Antes de analizar el algoritmo, es fundamental comprender cómo Prolog maneja los parámetros, ya que difiere radicalmente de lenguajes imperativos como Python o Java.

En lenguajes imperativos, una función recibe parámetros de entrada y retorna un valor de salida mediante la instrucción `return`:

```python
# Python: entrada por parámetros, salida por return
def buscar_ruta(origen, destino):
    # ... procesamiento ...
    return ruta_encontrada
```

En Prolog **no existe el `return`**. En su lugar, todos los parámetros pueden actuar como entrada o salida dependiendo de si contienen un valor o están vacíos. Este mecanismo se denomina **unificación** y funciona de la siguiente manera:

* Si el parámetro es una **variable sin valor** (casillero vacío), Prolog lo llena con el valor que coincida.
* Si el parámetro **ya tiene un valor**, Prolog lo compara para verificar igualdad.
* Si **dos variables están vacías** y se encuentran en la misma posición lógica, Prolog las unifica (las convierte en el mismo casillero).

Cuando el mismo nombre de variable aparece múltiples veces en la cabeza de una regla, significa que **todas esas posiciones deben contener exactamente el mismo valor** al momento de aplicar la regla.

#### 4.3.3.2 El predicado principal: `ruta/4`

```prolog
ruta(Origen, Destino, Ruta, Distancia) :-
    ruta_aux(Origen, Destino, [Origen], RutaInvertida, 0, Distancia),
    reverse(RutaInvertida, Ruta).
```

Este predicado actúa como interfaz pública del algoritmo. Recibe cuatro parámetros:

| Posición | Parámetro | Rol |
|----------|-----------|-----|
| 1 | `Origen` | Ciudad de partida (entrada) |
| 2 | `Destino` | Ciudad de llegada (entrada) |
| 3 | `Ruta` | Lista resultado del recorrido (salida) |
| 4 | `Distancia` | Distancia total acumulada (salida) |

Su funcionamiento interno es el siguiente:

1. Inicializa la lista de visitados con `[Origen]`, marcando el punto de partida como ya recorrido.
2. Inicializa la distancia acumulada en `0`.
3. Invoca al predicado auxiliar `ruta_aux/6`, pasando dos variables vacías (`RutaInvertida` y `Distancia`) que serán llenadas al encontrar una solución.
4. Aplica `reverse/2` sobre el resultado, ya que la ruta se construye en orden inverso (de destino a origen) debido a la forma en que se agregan elementos a la lista.

#### 4.3.3.3 El caso base: detección de llegada al destino

```prolog
ruta_aux(Destino, Destino, Visitados, Visitados, Distancia, Distancia).
```

A primera vista parece haber variables repetidas, pero cada aparición tiene un propósito específico. Los seis parámetros se interpretan así:

| Posición | Parámetro | Significado |
|----------|-----------|-------------|
| 1 | `Destino` | Ciudad donde se encuentra actualmente el recorrido |
| 2 | `Destino` | Ciudad objetivo a la que se desea llegar |
| 3 | `Visitados` | Lista de ciudades recorridas hasta el momento |
| 4 | `Visitados` | Lista que se devolverá como ruta encontrada |
| 5 | `Distancia` | Distancia acumulada en el recorrido |
| 6 | `Distancia` | Distancia total que se devolverá como resultado |

La repetición de nombres no es casual: indica que **las posiciones 1 y 2 deben unificarse con el mismo valor**, al igual que las posiciones 3 con 4, y 5 con 6. Esta regla solo se dispara cuando el nodo actual coincide con el nodo destino, es decir, cuando se ha completado una ruta válida.

Al ejecutarse, la regla transfiere los valores acumulados (lista de visitados y distancia) hacia las posiciones de salida, propagándolos hacia atrás en la cadena de llamadas recursivas gracias a la unificación.

#### 4.3.3.4 El caso recursivo: exploración del grafo

```prolog
ruta_aux(Actual, Destino, Visitados, Ruta, DistActual, DistTotal) :-
    conectado(Actual, Siguiente, Dist),
    \+ member(Siguiente, Visitados),
    NuevaDist is DistActual + Dist,
    ruta_aux(Siguiente, Destino, [Siguiente|Visitados], Ruta, NuevaDist, DistTotal).
```

En este caso los nombres no se repiten porque cada parámetro cumple un rol distinto:

| Posición | Parámetro | Significado |
|----------|-----------|-------------|
| 1 | `Actual` | Ciudad donde se encuentra el recorrido |
| 2 | `Destino` | Ciudad objetivo |
| 3 | `Visitados` | Lista de ciudades ya recorridas |
| 4 | `Ruta` | Variable vacía que recibirá la ruta final |
| 5 | `DistActual` | Distancia acumulada hasta el nodo actual |
| 6 | `DistTotal` | Variable vacía que recibirá la distancia total |

El cuerpo de la regla ejecuta cuatro pasos:

1. **`conectado(Actual, Siguiente, Dist)`**: Busca un nodo adyacente al nodo actual mediante el predicado bidireccional definido previamente.
2. **`\+ member(Siguiente, Visitados)`**: Verifica que el nodo adyacente no haya sido visitado previamente. El operador `\+` representa la negación por fallo, y `member/2` comprueba la pertenencia a una lista. Esta validación es crucial para evitar ciclos infinitos en grafos con conexiones circulares.
3. **`NuevaDist is DistActual + Dist`**: Acumula la distancia. El operador `is` fuerza la evaluación aritmética de la expresión.
4. **Llamada recursiva**: Invoca nuevamente a `ruta_aux/6` actualizando el nodo actual, agregando el nuevo nodo a la lista de visitados (usando el operador `[Cabeza|Cola]`), y propagando las variables vacías `Ruta` y `DistTotal` hacia la siguiente llamada.

#### 4.3.3.5 Ejemplo de ejecución paso a paso

Considere la búsqueda de una ruta entre Guatemala y Quetzaltenango:

```
Llamada 1: ruta_aux(guatemala, quetzaltenango, [guatemala], Ruta, 0, DistTotal)
  - conectado(guatemala, antigua, 40)
  - antigua no está en [guatemala]
  - NuevaDist = 0 + 40 = 40
  - Llama a: ruta_aux(antigua, quetzaltenango, [antigua, guatemala], Ruta, 40, DistTotal)

Llamada 2: ruta_aux(antigua, quetzaltenango, [antigua, guatemala], Ruta, 40, DistTotal)
  - conectado(antigua, chimaltenango, 25)
  - chimaltenango no está en [antigua, guatemala]
  - NuevaDist = 40 + 25 = 65
  - Llama a: ruta_aux(chimaltenango, quetzaltenango, [chimaltenango, antigua, guatemala], Ruta, 65, DistTotal)

Llamada 3: ruta_aux(chimaltenango, quetzaltenango, [chimaltenango, antigua, guatemala], Ruta, 65, DistTotal)
  - conectado(chimaltenango, quetzaltenango, 80)
  - quetzaltenango no está en [chimaltenango, antigua, guatemala]
  - NuevaDist = 65 + 80 = 145
  - Llama a: ruta_aux(quetzaltenango, quetzaltenango, [quetzaltenango, chimaltenango, antigua, guatemala], Ruta, 145, DistTotal)

Llamada 4: ruta_aux(quetzaltenango, quetzaltenango, [...], Ruta, 145, DistTotal)
  - ¡Caso base! El primer parámetro unifica con el segundo (quetzaltenango = quetzaltenango)
  - Se unifican las variables de salida:
      Ruta = [quetzaltenango, chimaltenango, antigua, guatemala]
      DistTotal = 145
  - Estos valores se propagan hacia atrás en toda la cadena de llamadas

Resultado final tras reverse/2:
  Ruta = [guatemala, antigua, chimaltenango, quetzaltenango]
  Distancia = 145
```

#### 4.3.3.6 Propagación de resultados mediante unificación

Las variables vacías `Ruta` y `DistTotal` funcionan como contenedores que se pasan de llamada en llamada sin duplicarse. Cuando el caso base las llena con valores concretos, todas las llamadas previas que las compartían reciben automáticamente esos valores. Este mecanismo sustituye al `return` de los lenguajes imperativos.

```
Llamada 1 ──┐
Llamada 2 ──┤──> comparten las mismas variables Ruta y DistTotal
Llamada 3 ──┤
Llamada 4 ──┘──> el caso base llena esas variables
                 todas las llamadas reciben los valores
```

#### 4.3.3.7 Backtracking y exploración de múltiples rutas

El motor de inferencia de Prolog implementa **backtracking** (retroceso) de forma nativa. Cuando se encuentra una ruta válida, el sistema la retorna. Si se solicitan soluciones adicionales, Prolog regresa al último punto de decisión, deshace las unificaciones realizadas y explora caminos alternativos.

Este comportamiento permite que el predicado `ruta/4` genere todas las trayectorias posibles entre dos nodos sin necesidad de implementar manualmente estructuras de control como pilas o colas.

```
Ejemplo de backtracking:

        [G]
         |
    ┌────┴────┐
   [A]       [B]
    |         |
   [C]       [D]  <-- Destino

DFS prueba: G -> A -> C (callejón sin salida)
Retrocede a G
DFS prueba: G -> B -> D (ruta válida encontrada)
```

#### 4.3.3.8 Complejidad algorítmica

El algoritmo DFS implementado tiene una complejidad temporal de **O(b^d)**, donde:

* **b** es el factor de ramificación promedio del grafo (número promedio de conexiones por nodo).
* **d** es la profundidad máxima del árbol de búsqueda (longitud de la ruta más larga sin ciclos).

Esta complejidad es aceptable para grafos de tamaño moderado como el utilizado en el proyecto (22 ciudades de Guatemala). Para grafos de mayor escala, sería recomendable implementar algoritmos heurísticos como A* o Dijkstra.

### 4.3.4 Optimización: Búsqueda de la Ruta Más Corta

#### 4.3.4.1 El problema de la búsqueda DFS simple

El predicado `ruta/4` implementado previamente utiliza un algoritmo de Búsqueda en Profundidad (DFS). Si bien este algoritmo garantiza encontrar *una* ruta válida entre el origen y el destino, no garantiza que sea la de menor distancia. El motor de Prolog retorna la primera solución que encuentra según el orden de los hechos en la base de conocimiento, lo cual no necesariamente corresponde al camino óptimo.

Para resolver el problema de la ruta más corta, la estrategia implementada sigue un enfoque de "generar y probar": primero se deben generar todas las trayectorias válidas posibles y, posteriormente, seleccionar aquella que minimice la distancia total.

#### 4.3.4.2 Implementación de la solución

La lógica de optimización se encapsula en el predicado `ruta_mas_corta/4`, el cual ejecuta el proceso en dos pasos secuenciales:

```prolog
ruta_mas_corta(Origen, Destino, MejorRuta, MenorDistancia) :-
    findall([Dist, R], ruta(Origen, Destino, R, Dist), TodasLasRutas),
    sort(TodasLasRutas, [[MenorDistancia, MejorRuta] | _]).
```

#### 4.3.4.3 Paso 1: Recolección exhaustiva con `findall/3`

```prolog
findall([Dist, R], ruta(Origen, Destino, R, Dist), TodasLasRutas)
```

El predicado nativo `findall/3` tiene la signatura `findall(+Plantilla, :Objetivo, -Lista)`. Su funcionamiento en este contexto es el siguiente:

1. **Objetivo (`ruta(Origen, Destino, R, Dist)`)**: Prolog ejecuta este predicado exhaustivamente. Gracias al mecanismo de *backtracking* (retroceso), Prolog no se detiene en la primera ruta encontrada, sino que explora sistemáticamente todo el espacio de soluciones posibles.
2. **Plantilla (`[Dist, R]`)**: Por cada solución exitosa del objetivo, Prolog instancia esta plantilla con los valores concretos de la distancia (`Dist`) y la lista de la ruta (`R`), creando una sublista.
3. **Lista (`TodasLasRutas`)**: Prolog acumula todas las sublistas generadas en una única lista de listas.

**Ejemplo del estado de la variable tras `findall/3`:**
```prolog
TodasLasRutas = [
    [145, [guatemala, antigua, chimaltenango, quetzaltenango]],
    [200, [guatemala, escuintla, mazatenango, retalhuleu, quetzaltenango]],
    [180, [guatemala, coban, quiche, solola, quetzaltenango]]
]
```

#### 4.3.4.4 Paso 2: Ordenamiento y extracción con `sort/2`

```prolog
sort(TodasLasRutas, [[MenorDistancia, MejorRuta] | _])
```

El predicado `sort/2` realiza dos operaciones fundamentales sobre la lista de listas:
1. **Ordenamiento**: Ordena las sublistas de forma ascendente basándose en la comparación del primer elemento de cada una (en este caso, la distancia).
2. **Eliminación de duplicados**: Remueve sublistas idénticas (aunque en este dominio es poco probable, es un comportamiento inherente de `sort/2`).

**La unificación del patrón `[[MenorDistancia, MejorRuta] | _]`:**

Esta es la parte más crítica del predicado. No se utiliza una variable simple para capturar el resultado, sino un patrón de unificación estructurado que descompone la lista ordenada:

| Componente del patrón | Significado y acción de Prolog |
|-----------------------|--------------------------------|
| `[` ... `]` | Indica que se espera una lista. |
| `[MenorDistancia, MejorRuta]` | Corresponde a la **primera sublista** (el encabezado o *head* de la lista principal). Al estar ordenada ascendentemente, esta sublista contiene obligatoriamente la distancia más pequeña y su ruta asociada. Prolog unifica el primer elemento con la variable `MenorDistancia` y el segundo con `MejorRuta`. |
| `|` | Operador "cons" (constructor de listas). Separa el primer elemento (la mejor ruta) del resto de la lista. |
| `_` | Variable anónima. Indica a Prolog que el resto de la lista (la cola o *tail*, que contiene las rutas subóptimas) debe ser ignorado. Esto optimiza el uso de memoria, ya que Prolog no necesita asignar un nombre ni almacenar referencias a datos que no serán utilizados. |

**Ejemplo de unificación paso a paso:**

Supongamos que `sort/2` produce la siguiente lista ordenada:
```prolog
[
    [145, [guatemala, antigua, chimaltenango, quetzaltenango]],
    [180, [guatemala, coban, quiche, solola, quetzaltenango]],
    [200, [guatemala, escuintla, mazatenango, retalhuleu, quetzaltenango]]
]
```

Al unificar esta lista con el patrón `[[MenorDistancia, MejorRuta] | _]`, Prolog realiza las siguientes asignaciones:
* `MenorDistancia` = `145`
* `MejorRuta` = `[guatemala, antigua, chimaltenango, quetzaltenango]`
* `_` = `[[180, [...]], [200, [...]]]` (descartado)

Estas variables (`MenorDistancia` y `MejorRuta`) son exactamente las que el predicado `ruta_mas_corta/4` retorna al llamador (por ejemplo, al servicio de Python).

#### 4.3.4.5 Análisis de complejidad y limitaciones

El enfoque implementado es una forma de "fuerza bruta inteligente". Su complejidad temporal y espacial es **O(N)**, donde N es el número total de rutas simples (sin ciclos) existentes entre el origen y el destino.

* **Ventaja**: Es extremadamente sencillo de implementar en Prolog, aprovechando al máximo las capacidades nativas de `findall/3` y `sort/2` sin requerir estructuras de datos auxiliares complejas.
* **Limitación**: Para grafos densos o de gran escala (por ejemplo, más de 1000 nodos), el número de rutas posibles puede crecer exponencialmente, provocando un agotamiento de la memoria (stack overflow) o tiempos de respuesta inaceptables.
* **Justificación para el proyecto**: Dado que el grafo modela los 22 departamentos de Guatemala con una conectividad moderada, el espacio de búsqueda es lo suficientemente pequeño como para que este método sea eficiente y responda en milisegundos. Para escalar el sistema en el futuro, se recomendaría implementar un algoritmo heurístico como A* o Dijkstra directamente en Prolog, los cuales podan el espacio de búsqueda y no requieren generar todas las soluciones antes de seleccionar la óptima.

## Resumen Visual de Todo el Flujo

```
Usuario pide: "Ruta más corta de Guatemala a Quetzaltenango"
                    ↓
        ┌───────────────────────┐
        │  ruta_mas_corta/4     │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │  findall/3            │ ← Genera TODAS las rutas
        │  (fuerza bruta)       │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │  ruta/4               │ ← DFS con backtracking
        │  (explora el grafo)   │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │  ruta_aux/6           │ ← Recursión paso a paso
        │  (camina el grafo)    │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │  conectado/3          │ ← Verifica vecinos
        │  (bidireccional)      │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │  conexion/3           │ ← Hechos en la base de datos
        │  (datos reales)       │
        └───────────────────────┘
```

## 5. Integración Python y Persistencia

### 5.1 PySwip como Puente

El servicio `prolog_service.py` utiliza la librería PySwip para enviar sentencias en formato de *string* hacia el intérprete embebido de SWI-Prolog y transformar las respuestas lógicas en listas de diccionarios JSON nativos de Python.

### 5.2 Persistencia Física (I/O)

A diferencia de los sistemas puramente dinámicos en memoria, este proyecto cuenta con persistencia. El módulo `config/database.py` realiza un volcado de memoria (dump) de las ciudades y conexiones actuales. Posteriormente, reescribe el archivo `conocimiento.pl` utilizando codificación `UTF-8` para soportar tildes y caracteres especiales. Este proceso está diseñado para preservar las reglas algorítmicas estáticas del archivo, actualizando únicamente la sección de hechos dinámicos, garantizando que el grafo editado sobreviva a reinicios del servidor.

### 5.3 Desafíos de la Integración PySwip

La librería PySwip permite embeber SWI-Prolog en Python, pero presenta particularidades técnicas que fueron resueltas durante el desarrollo:

**Desafío 1: Manejo de átomos vs strings**
Prolog diferencia entre átomos (`'guatemala'`) y strings (`"guatemala"`). PySwip convierte automáticamente, pero si Prolog retorna un átomo con espacios o caracteres especiales, debe entrecomillarse correctamente en Python para evitar errores de sintaxis al reconstruir las consultas.

**Desafío 2: Codificación UTF-8**
Al reescribir `conocimiento.pl`, se debe forzar la codificación UTF-8 para preservar tildes y caracteres especiales del español:
```python
with open('conocimiento.pl', 'w', encoding='utf-8') as f:
    # Escritura de hechos dinámicos
```
Sin esto, ciudades como "Quetzaltenango" o nombres con acentos se corromperían al persistir.

**Desafío 3: Preservación de reglas estáticas**
El proceso de escritura debe leer el archivo original, identificar las secciones de reglas algorítmicas (que no deben modificarse) y reescribir únicamente la sección de hechos dinámicos. Esto garantiza que los algoritmos de búsqueda (`ruta/4`, `ruta_mas_corta/4`) permanezcan intactos tras múltiples operaciones de guardado.

---

## 6. API REST - Endpoints Principales

La aplicación expone sus servicios a través de FastAPI, segmentados por sus respectivos *routers*:

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/rutas/optima?origen=X&destino=Y` | Ejecuta la inferencia de la ruta de menor peso. |
| `GET` | `/rutas/todas?origen=X&destino=Y` | Retorna todas las trayectorias válidas posibles de viaje. |
| `GET` | `/grafo/` | Lee todos los nodos aislados y aristas del grafo. |
| `POST` | `/grafo/ciudad` | Inserta un vértice aislado en la memoria lógica. |
| `DELETE` | `/grafo/ciudad/{nombre}` | Elimina el vértice y todas sus aristas conectadas en cascada. |
| `POST` | `/grafo/conexion` | Crea una arista bidireccional si ambos nodos existen. |
| `PUT` | `/grafo/conexion/{O}/{D}` | Actualiza el peso (distancia) de una arista específica. |
| `POST` | `/grafo/guardar` | Desencadena la escritura física de la memoria al archivo `.pl`. |

---

## 7. Frontend - React y Renderizado Gráfico

La capa de presentación fue construida utilizando **React** y empaquetada con **Vite** para máxima velocidad.

* **Renderizado de Grafo**: Se integró `ReactFlow` para el manejo del lienzo interactivo (canvas). Para evitar el solapamiento manual de nodos, se implementó la librería `dagre`, la cual calcula matemáticamente las posiciones `(X, Y)` basándose en jerarquías y conectividad.
* **Interactividad Visual**: Al ejecutar una consulta de ruta óptima, el estado del frontend re-mapea el arreglo de aristas (edges), inyectando clases de animación y cambiando colores (`stroke`) exclusivamente en los segmentos que componen la ruta.
* **Manejo de Errores**: Se implementó un sistema de notificaciones asíncronas (`Toast.jsx`) que captura y renderiza los errores HTTP provenientes de FastAPI (Ej. 404 Not Found, 400 Bad Request) de manera amigable.

---

## 8. Posibles Mejoras Futuras

* **Contenedorización**: Empaquetar el backend y frontend en contenedores Docker y orquestarlos mediante `docker-compose` para simplificar la configuración en diferentes entornos Linux o de servidores en la nube.
* **Algoritmos Heurísticos**: Implementar A* directamente en Prolog para optimizar la velocidad de búsqueda en grafos que superen los miles de nodos, reemplazando el enfoque actual de fuerza bruta con `findall/3`.
* **Exportación de Documentos**: Integrar librerías en React (como jsPDF o FileSaver) para descargar el resultado de las estadísticas de rutas en formato PDF o CSV.
* **Sistema de Autenticación**: Agregar JWT para restringir el acceso y permitir que múltiples usuarios mantengan sus propios grafos personalizados.
* **Caché de Consultas**: Implementar un sistema de caché en Python para evitar recalcular rutas entre pares de ciudades consultados frecuentemente.

