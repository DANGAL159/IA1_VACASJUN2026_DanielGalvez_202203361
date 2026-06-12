# Manual Técnico - Sistema Experto "Doctor Byte" (IA1)

**Universidad de San Carlos de Guatemala**
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**
**Inteligencia Artificial 1**
**Proyecto:** Doctor Byte (Fase 1)

---

## 1. Introducción

El presente documento describe la arquitectura, estructura e integración del sistema experto **Doctor Byte**, desarrollado para la automatización del diagnóstico preliminar de fallas en equipos de cómputo. El sistema implementa una solución híbrida donde **SWI-Prolog** actúa como el motor de inferencia lógica basado en reglas, **Python (FastAPI)** funciona como capa de integración y orquestador de servicios bajo un patrón MVC, **React** conforma la interfaz gráfica de usuario, y la **API de Telegram** actúa como canal de notificación asíncrona para usuarios y personal de soporte.

---

## 2. Arquitectura Implementada

### 2.1 Patrón de Arquitectura: Cliente-Servidor con MVC y Servicios Externos

El proyecto evoluciona de un sistema experto tradicional de consola a una arquitectura **Cliente-Servidor distribuida**. El backend está estructurado bajo el patrón **Modelo-Vista-Controlador (MVC)**, lo que permite separar la lógica de negocio (Prolog), la orquestación web (FastAPI) y la presentación (React). Adicionalmente, se integra un actor externo (Bot de Telegram) que consume los resultados del sistema de manera pasiva.

![](/Proyecto1/docs/images/0-arch.svg)

### 2.2 Justificación del Patrón

*   **Desacoplamiento Estricto:** Prolog resuelve la lógica difusa y el razonamiento experto. Python orquesta el tráfico HTTP, gestiona la persistencia en disco y se comunica con APIs REST externas (Telegram). React consume JSON sin conocer la existencia de Prolog.
*   **Mantenibilidad MVC:** Separar las rutas HTTP (`routers/`), la lógica de negocio y acceso a datos (`services/`, `config/`) y los moldes de datos (`models/`) facilita la escalabilidad.
*   **Cumplimiento de Restricciones:** Se garantiza que Python no implementa algoritmos de diagnóstico; se limita a formatear los síntomas del usuario, consultar el archivo `.pl` y parsear la respuesta lógica.

---

## 3. Estructura del Proyecto

El código fuente está organizado aplicando los principios de separación de *concerns* y modularidad.

```text
Proyecto1/
 ├── backend/                 # Capa de integración, servicios y motor lógico
 │   ├── config/              # Configuración y persistencia física
 │   ├── models/              # Esquemas de validación Pydantic (MVC - Modelo)
 │   ├── routers/             # Endpoints HTTP (MVC - Controlador)
 │   ├── services/            # Lógica de negocio y puentes externos
 │   ├── doctor_byte.pl       # Base de Conocimiento (Hechos y Reglas)
 │   ├── main.py              # Punto de entrada ASGI
 │   └── requirements.txt
 ├── frontend/                # Capa de presentación (React + Vite)
 ├── docs/                    # Documentación y enunciados
 ├── init.ps1                 # Script de inicialización de entorno
 └── Readme.md
```

---

## 4. Lógica de Inferencia y Reglas en Prolog

### 4.1 Representación del Conocimiento: Hechos y Listas

El sistema experto modela el conocimiento técnico mediante hechos dinámicos que permiten la modificación en tiempo real (CRUD) sin necesidad de reiniciar el motor.

```prolog
:- dynamic sintoma/1.
:- dynamic falla/2.
:- dynamic recomendacion/2.
:- dynamic regla_falla/2.
:- dynamic historial/5.
```

**El uso de Listas en las Reglas de Inferencia:**
A diferencia de sistemas simples que asocian un síntoma a una falla, *Doctor Byte* reconoce que las fallas de hardware suelen presentar **múltiples síntomas simultáneos**. Para modelar esto, el predicado `regla_falla/2` asocia un identificador de falla con una **lista** de síntomas requeridos:

```prolog
% La Falla 7 (Temperatura/Suciedad) requiere que se presente AL MENOS esta combinación
regla_falla(7, ['sobrecalentamiento', 'ventilador muy ruidoso', 'reinicios inesperados']).
```

### 4.2 El Motor de Inferencia: Búsqueda por Subconjuntos

El núcleo del razonamiento experto reside en el predicado `diagnosticar/4`. Su objetivo es determinar si los síntomas reportados por el usuario "contienen" el conocimiento necesario para dictar un veredicto.

```prolog
diagnosticar(SintomasUsuario, FallaID, NombreFalla, Rec) :-
    regla_falla(FallaID, SintomasRequeridos),
    subconjunto(SintomasRequeridos, SintomasUsuario),
    falla(FallaID, NombreFalla),
    recomendacion(FallaID, Rec),
    !.
```

#### 4.2.1 El Predicado Auxiliar `subconjunto/2`
Para verificar si una falla es aplicable, el sistema no exige que el usuario reporte *exactamente* los mismos síntomas (lo cual sería muy restrictivo), sino que verifica si los síntomas *requeridos* por la regla están **contenidos** dentro de los síntomas que el usuario experimenta.

```prolog
subconjunto([], _).
subconjunto([H|T], Lista) :- member(H, Lista), subconjunto(T, Lista).
```
*   **Caso Base:** Una lista vacía `[]` es subconjunto de cualquier lista.
*   **Caso Recursivo:** La cabeza `H` de la lista de requisitos debe ser miembro (`member/2`) de la lista del usuario, y la cola `T` debe seguir siendo subconjunto.

**Ejemplo de Inferencia:**
*   **Usuario reporta:** `['pantalla azul', 'pitidos cortos al arrancar', 'lentitud extrema']`
*   **Regla RAM:** `['pantalla azul', 'pitidos cortos al arrancar']`
*   **Evaluación:** `subconjunto(['pantalla azul', 'pitidos cortos'], ['pantalla azul', 'pitidos...', 'lentitud...'])` retorna **True**. El sistema diagnostica Falla de RAM, ignorando el síntoma extra ("lentitud") que no invalida el diagnóstico principal.

#### 4.2.2 El Operador de Corte (`!`) y el Compromiso Lógico
Al final del predicado `diagnosticar/4` se encuentra el operador de corte `!`. Este es un requisito fundamental del proyecto y tiene una implicación crítica en el comportamiento del sistema experto:

1.  **Evita el Backtracking (Retroceso):** Una vez que Prolog encuentra la *primera* regla de falla cuyos síntomas son un subconjunto de los del usuario, el corte "compromete" al motor con esa solución.
2.  **Simulación de Comportamiento Experto:** Un técnico humano, al ver síntomas claros de una falla de RAM, dicta ese diagnóstico y no continúa buscando si también hay una falla de red, a menos que se le pida explícitamente. El corte `!` asegura que la API retorne **un único diagnóstico definitivo** (el primero que coincida según el orden de prioridad en la base de conocimiento), evitando respuestas ambiguas o múltiples diagnósticos conflictivos en una sola petición.

### 4.3 Lógica CRUD Gestionada por Prolog
Para cumplir con la capacidad de administrar el conocimiento, se implementaron predicados que utilizan `assertz/1` (inserción) y `retractall/1` (eliminación).

```prolog
agregar_sintoma(S) :- \+ sintoma(S), assertz(sintoma(S)).
eliminar_falla(ID) :-
    retractall(falla(ID, _)),
    retractall(recomendacion(ID, _)),
    retractall(regla_falla(ID, _)). % Eliminación en cascada
```
*Nota: Se utiliza la negación por fallo (`\+`) o validación previa para garantizar la integridad referencial y evitar duplicados en la base de conocimiento.*

---

## 5. Integración Python, Persistencia y Telegram

### 5.1 PySwip y Manejo de Codificación (UTF-8)
El puente entre Python y SWI-Prolog (`pyswip`) presenta el desafío de que Prolog retorna átomos como secuencias de bytes (`bytes`), no como strings nativos de Python. El módulo `database.py` implementa la función `to_str(val)` para decodificar sistemáticamente estas respuestas a `UTF-8`, preservando caracteres especiales del español (tildes, ñ) en los diagnósticos.

```python
def to_str(val):
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return str(val)
```

### 5.2 Persistencia Inteligente (Dump y Reconstrucción)
A diferencia de una base de datos relacional, Prolog opera en memoria. Para persistir los cambios (nuevos síntomas, historial de diagnósticos) sin corromper el motor de inferencia, `database.py` implementa un volcado inteligente (`guardar_base_conocimiento`):

1.  **Extracción:** Consulta todos los hechos dinámicos actuales en memoria.
2.  **Reescritura:** Sobrescribe el archivo `doctor_byte.pl` desde cero.
3.  **Inyección de Reglas Fijas:** Al final del archivo, inyecta el bloque de código `REGLAS_FIJAS` (que contiene el motor `diagnosticar/4` y `subconjunto/2`).
    *   *Justificación:* Si solo guardáramos los hechos, perderíamos los algoritmos de búsqueda tras el primer reinicio. Este patrón garantiza que la lógica de negocio sea inmutable mientras los datos son volátiles.

### 5.3 Integración con Telegram y Sincronización de Usuarios
El servicio `telegram_service.py` implementa una arquitectura de notificación dual y un directorio de usuarios en memoria.

*   **Directorio de Usuarios (`directorio_usuarios`):** En lugar de exigir al usuario que conozca su `chat_id` numérico de Telegram, el sistema utiliza el endpoint `getUpdates` de la API de Telegram para escanear mensajes recientes y mapear `@username` a `chat_id`.
*   **Envío Dual:** Al generarse un diagnóstico, el sistema envía la notificación formateada en HTML a dos destinos simultáneamente:
    1.  **Al Usuario:** Si proporcionó su alias de Telegram.
    2.  **Al Grupo de Soporte (`TELEGRAM_GROUP_ID`):** Funcionando como un log centralizado de incidencias para los técnicos.

---

## 6. API REST - Capa Controlador (Routers)

La capa de controladores (`routers/`) actúa como el punto de entrada HTTP del sistema. Su responsabilidad es recibir las peticiones del frontend (React), validar los datos mediante esquemas Pydantic (`models/schemas.py`), orquestar las llamadas a los servicios (`services/`) y retornar respuestas JSON estandarizadas.

### 6.1 Router de Conocimiento (`conocimiento.py`)

Este router implementa el patrón CRUD (Crear, Leer, Actualizar, Eliminar) sobre la base de conocimiento de Prolog. Su diseño garantiza la **integridad referencial** de los datos lógicos.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/conocimiento/` | Extrae y estructura todos los síntomas, fallas, recomendaciones y reglas actualmente cargados en memoria. |
| `POST` | `/conocimiento/sintoma` | Inserta un nuevo síntoma aislado. |
| `PUT` | `/conocimiento/sintoma/{nombre_viejo}` | **Propagación en cascada:** Renombra un síntoma y actualiza automáticamente todas las reglas de inferencia que lo contenían. |
| `DELETE` | `/conocimiento/sintoma/{nombre}` | Elimina un síntoma de la base de hechos. |
| `POST` | `/conocimiento/regla` | Vincula una lista de síntomas a un ID de falla existente. |
| `POST` | `/conocimiento/guardar` | Dispara el volcado físico de la memoria al archivo `doctor_byte.pl`. |

**Análisis Técnico: Actualización en Cascada de Reglas**
Uno de los desafíos más complejos al modificar una base de conocimiento lógica es la dependencia entre hechos. Si un administrador decide que el síntoma `"pantalla azul"` debe llamarse `"BSOD"`, las reglas que lo utilizan quedarían rotas. El controlador resuelve esto dinámicamente:

```python
# 1. Retrae el síntoma viejo y aserta el nuevo
ejecutar_consulta(f"retractall(sintoma('{viejo_limpio}'))")
ejecutar_consulta(f"assertz(sintoma('{nuevo_limpio}'))")

# 2. Itera sobre todas las reglas de falla existentes
reglas = ejecutar_consulta("regla_falla(ID, Sintomas)")
for rg in reglas:
    lista_sintomas = [str(x) for x in rg['Sintomas']]
    if viejo_limpio in lista_sintomas:
        # 3. Reconstruye la lista de Prolog con el nuevo nombre
        lista_sintomas = [nuevo_limpio if s == viejo_limpio else s for s in lista_sintomas]
        lista_prolog = "[" + ", ".join(f"'{x}'" for x in lista_sintomas) + "]"
        
        # 4. Reemplaza la regla completa en memoria
        ejecutar_consulta(f"retractall(regla_falla({rg['ID']}, _))")
        ejecutar_consulta(f"assertz(regla_falla({rg['ID']}, {lista_prolog}))")
```
Este enfoque garantiza que el motor de inferencia (`subconjunto/2`) nunca falle por referencias colgantes a átomos inexistentes.

### 6.2 Router de Diagnóstico (`diagnostico.py`)

Es el núcleo transaccional del sistema experto. Recibe los síntomas del usuario, ejecuta la inferencia y dispara los efectos secundarios (notificaciones e historial).

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/sistema-experto/diagnosticar` | Ejecuta el motor de inferencia, notifica por Telegram y persiste el resultado. |
| `GET` | `/sistema-experto/historial` | Retorna el log cronológico de todos los diagnósticos realizados. |

### 6.3 Router de Configuración (`configuracion.py`)

Expone los parámetros globales del sistema, permitiendo a los administradores habilitar/deshabilitar el bot de Telegram y personalizar las plantillas de los mensajes sin tocar el código fuente.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/configuracion/` | Lee el archivo `.env` y retorna los tokens y plantillas actuales. |
| `PUT` | `/configuracion/` | Sobrescribe el archivo `.env` con la nueva configuración. |

---

## 7. Orquestación del Diagnóstico: El Flujo Transaccional

El endpoint `POST /sistema-experto/diagnosticar` implementa un flujo de múltiples etapas que conecta el mundo web (HTTP) con el mundo lógico (Prolog) y el mundo externo (Telegram).

### 7.1 Paso 1: Construcción de la Consulta Lógica
El frontend envía un array de strings (ej. `["pantalla azul", "pitidos cortos al arrancar"]`). Python debe traducir esto a la sintaxis de listas de Prolog mediante interpolación de cadenas:

```python
sintomas_prolog = "[" + ", ".join(f"'{s}'" for s in solicitud.sintomas_usuario) + "]"
# Resultado: "['pantalla azul', 'pitidos cortos al arrancar']"

consulta = f"diagnosticar({sintomas_prolog}, ID, Falla, Recomendacion)"
```

### 7.2 Paso 2: Inferencia y Manejo del Corte (`!`)
Al ejecutar `diagnosticar/4`, Prolog itera sobre las reglas. Gracias al **operador de corte (`!`)** al final del predicado, Prolog se "compromete" con la primera falla cuyo conjunto de síntomas sea un subconjunto de los reportados.
*   **Éxito:** `resultados` contendrá un diccionario con `ID`, `Falla` y `Recomendacion`.
*   **Fallo (Fuerza Bruta Agotada):** Si ningún `subconjunto/2` retorna verdadero, la lista `resultados` estará vacía. El sistema asume que la falla es "Desconocida" y utiliza la plantilla de error configurada.

### 7.3 Paso 3: Formateo de Mensajes (Plantillas Dinámicas)
El sistema lee el archivo `.env` a través de `config_service.py` para obtener plantillas HTML con marcadores de posición (`{falla}`, `{recomendacion}`, `{sintomas}`). Python reemplaza estos marcadores con los datos reales del diagnóstico antes de enviarlos a Telegram.

### 7.4 Paso 4: Persistencia del Historial (RAM + Disco)
Para cumplir con el requisito de "Historial de diagnósticos realizados", el sistema aplica una estrategia de doble escritura:
1.  **Escritura en RAM (Inmediata):** Se utiliza `assertz(historial(...))` para que el nuevo registro sea consultable instantáneamente por el endpoint `/historial`.
2.  **Escritura en Disco (Asíncrona/Inmediata):** Se invoca `guardar_base_conocimiento()`, que reescribe el archivo `doctor_byte.pl` para que el historial sobreviva a reinicios del servidor.

---

## 8. Integración con Telegram y Gestión de Configuración

### 8.1 El Desafío del Archivo `.env` y los Saltos de Línea
El servicio `config_service.py` implementa un parser manual para el archivo `.env`. Un desafío técnico crítico fue el manejo de los saltos de línea en las plantillas de mensajes HTML de Telegram.
*   **Problema:** Un archivo `.env` estándar guarda una variable por línea. Si la plantilla contiene `\n` reales, el parser la rompería en múltiples variables inválidas.
*   **Solución:** Al guardar, el servicio escapa los saltos de línea reales a la secuencia literal `\n`. Al leer, revierte el proceso (`v.replace("\\n", "\n")`), permitiendo que las plantillas mantengan su formato HTML multilínea.

### 8.2 Sincronización Dinámica de Usuarios (`telegram_service.py`)
La API de Telegram no permite enviar mensajes a un `@username` directamente; requiere el `chat_id` numérico. Para evitar que el usuario tenga que buscar su ID numérico, el sistema implementa un **directorio dinámico**:

1.  Cuando se solicita un diagnóstico, el servicio llama a `sincronizar_mensajes(token)`.
2.  Este método consulta el endpoint `getUpdates` de la API de Telegram, obteniendo los últimos mensajes recibidos por el bot.
3.  Extrae el `username` y el `chat_id` de cada mensaje y los almacena en un diccionario en memoria (`directorio_usuarios`).
4.  Si el usuario proporcionó su `@username` en la interfaz web, el sistema busca en el diccionario y obtiene su `chat_id` para enviarle la notificación personal.

### 8.3 Notificación Dual (Usuario + Grupo de Soporte)
El sistema está diseñado para funcionar como un Help Desk automatizado. Cada diagnóstico exitoso o fallido genera dos peticiones HTTP POST a la API de Telegram:
1.  **Notificación Personal:** Enviada al `chat_id` del usuario que solicitó el diagnóstico (si fue identificado).
2.  **Log Centralizado:** Enviada al `TELEGRAM_GROUP_ID` configurado, permitiendo al equipo de soporte técnico monitorear en tiempo real qué fallas están reportando los usuarios finales.

---

## 9. Resumen Visual del Flujo Completo

```text
[ Usuario en React ]
       │ Selecciona síntomas y ingresa @username
       ▼
[ POST /sistema-experto/diagnosticar ] (FastAPI - Capa Controlador)
       │
       ├──► 1. Lee configuración (.env) ──► [ config_service.py ]
       │
       ├──► 2. Construye Query ──► "diagnosticar(['sintoma1', ...], ID, F, R)"
       │
       ▼
[ SWI-Prolog (Motor de Inferencia) ]
       │
       ├──► regla_falla(ID, Requisitos)
       ├──► subconjunto(Requisitos, Usuario) ──► (Recursividad y Listas)
       ├──► falla(ID, Nombre)
       ├──► recomendacion(ID, Texto)
       └──► ! (Corte: Compromete la primera solución válida)
       │
       ▼
[ Python: Orquestación de Efectos Secundarios ]
       │
       ├──► A. Formatea plantilla HTML con los resultados
       │
       ├──► B. [ telegram_service.py ]
       │       ├── Sincroniza getUpdates (Mapea @user -> chat_id)
       │       ├── POST sendMessage -> Usuario
       │       └── POST sendMessage -> Grupo de Soporte
       │
       └──► C. [ database.py ]
               ├── assertz(historial(...)) ──► Guarda en RAM
               └── Sobrescribe doctor_byte.pl ──► Persiste en Disco
       │
       ▼
[ Respuesta JSON a React ]
       └──► Renderiza Modal de Éxito/Fallo y actualiza tabla de Historial
```

---

## 10. Frontend - Interfaz de Usuario (React + Vite)

La capa de presentación consume la API REST mediante peticiones `fetch` o `axios`. Sus responsabilidades principales son:
*   **Selector de Síntomas:** Renderiza dinámicamente los síntomas obtenidos de `GET /conocimiento/` como checkboxes o botones de selección múltiple.
*   **Visualización del Diagnóstico:** Muestra la falla detectada y la recomendación en un componente modal o tarjeta destacada.
*   **Tabla de Historial:** Consume `GET /sistema-experto/historial` para mostrar un log reversible de todas las consultas pasadas, permitiendo a los técnicos auditar el rendimiento del sistema experto.
*   **Panel de Administración:** Incluye formularios protegidos para invocar los endpoints `POST/PUT/DELETE` del router de conocimiento, permitiendo a los expertos alimentar la base de reglas sin editar el archivo `.pl` manualmente.

![](/Proyecto1/docs/images/Diagnostico.png)
![](/Proyecto1/docs/images/Resultado.png)
![](/Proyecto1/docs/images/Historial.png)
![](/Proyecto1/docs/images/Administrador.png)

---

## 11. Posibles Mejoras Futuras

*   **Sistema de Pesos y Probabilidades (Lógica Difusa):** Actualmente, todas las reglas tienen la misma prioridad (la primera que coincide gana). Una mejora sería asignar "pesos" a los síntomas para que el sistema retorne la falla que acumule mayor puntuación, en lugar de depender del orden de declaración en el archivo `.pl`.
*   **Webhooks de Telegram:** En lugar de usar `getUpdates` (polling), configurar un Webhook permitiría al bot recibir notificaciones de la API de Telegram en tiempo real, optimizando el mapeo de usuarios y permitiendo que los usuarios soliciten diagnósticos directamente desde la app de mensajería.
*   **Contenedorización (Docker):** Empaquetar SWI-Prolog, FastAPI y React en contenedores orquestados con `docker-compose` para eliminar los problemas de compatibilidad de `pyswip` con diferentes versiones de Python y sistemas operativos.
*   **Motor de Búsqueda A* o Bayesiano:** Evolucionar de un sistema experto basado puramente en reglas lógicas (IF-THEN) a una Red Bayesiana que pueda calcular la probabilidad de una falla dado un conjunto de síntomas incompletos.