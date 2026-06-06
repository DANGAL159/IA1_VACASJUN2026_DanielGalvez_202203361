# Manual de Usuario - Sistema de Rutas Más Cortas (IA1)

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**  
**Inteligencia Artificial 1**  
**Estudiante:** Daniel Gálvez - 202203361

## 1. Introducción

El presente manual tiene como objetivo guiar al usuario final en el uso correcto y eficiente del Sistema de Rutas Más Cortas. Este documento describe las funcionalidades de la interfaz gráfica, los pasos para gestionar el mapa de ciudades y conexiones, y el procedimiento para realizar consultas de rutas. Está dirigido a usuarios sin conocimientos técnicos de programación, enfocándose en la operación práctica del sistema.

## 2. Requisitos del Sistema

Para utilizar la aplicación, el equipo debe cumplir con los siguientes requisitos mínimos:

* **Sistema Operativo:** Windows, macOS o Linux.
* **Navegador Web:** Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versión actualizada).
* **Conexión:** Acceso a la dirección local del servidor (por defecto `http://localhost:5173`) o a la URL de despliegue en la nube, si aplica.
* **Resolución de pantalla:** Se recomienda un mínimo de 1366x768 píxeles para una visualización óptima del lienzo del grafo.

## 3. Acceso al Sistema

1. Abra su navegador web preferido.
2. En la barra de direcciones, ingrese la URL proporcionada por el administrador del sistema (ejemplo: `http://localhost:5173`).
3. Al cargar la página, verá la interfaz principal dividida en el lienzo de visualización (centro) y el panel de control (lateral o superior, según el diseño).

![Pantalla de inicio del sistema](/Practica1/docs/images/01_pantalla_inicio.png)
*Figura 1: Vista inicial del sistema al acceder desde el navegador*

## 4. Descripción de la Interfaz

La pantalla principal se compone de las siguientes áreas funcionales:

* **Lienzo Interactivo (Canvas):** Área central donde se dibuja el grafo. Los nodos representan ciudades y las líneas (aristas) representan las conexiones y distancias entre ellas. Es posible hacer zoom y desplazar la vista.
* **Panel de Control:** Sección que contiene los formularios y botones para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre ciudades y conexiones.
* **Panel de Búsqueda:** Formulario específico para ingresar ciudad de origen y destino, con opciones para buscar la ruta óptima o todas las rutas posibles.
* **Área de Notificaciones (Toasts):** Mensajes emergentes en la esquina superior (o inferior) que informan sobre el éxito de una operación o detallan errores.

![Componentes de la interfaz](/Practica1/docs/images/02_interfaz_completa.png)
*Figura 2: Interfaz principal

## 5. Guía de Uso Paso a Paso

### 5.1 Visualización Inicial del Grafo

Al ingresar al sistema, el lienzo cargará automáticamente el estado actual del mapa de ciudades almacenado en la base de conocimiento. Puede usar la rueda del ratón para acercar o alejar la vista, y hacer clic y arrastrar para moverse por el lienzo.

![Visualización del grafo](/Practica1/docs/images/03_visualizacion_grafo.png)
*Figura 3: Grafo de ciudades con nodos y aristas mostrando las distancias*

### 5.2 Gestión de Ciudades (Nodos)

* **Agregar una ciudad:** 
  1. Diríjase al panel de control, sección "Ciudades".
  2. Ingrese el nombre de la nueva ciudad en el campo de texto.

![Formulario para agregar ciudad](/Practica1/docs/images/04_formulario_agregar_ciudad.png)
*Figura 4: Campo de ingreso para agregar una nueva ciudad al sistema*

  3. Haga clic en el botón "Agregar Ciudad".
  4. El sistema mostrará una notificación de éxito y el nuevo nodo aparecerá en el lienzo (inicialmente sin conexiones).

![Ciudad agregada al grafo](/Practica1/docs/images/05_ciudad_agregada.png)
*Figura 5: Nueva ciudad agregada al grafo y notificación de éxito*

* **Eliminar una ciudad:**
  1. En la sección de gestión, seleccione o escriba el nombre de la ciudad a eliminar.
  2. Haga clic en "Eliminar Ciudad".
  3. *Nota:* Esta acción eliminará la ciudad y todas las conexiones asociadas a ella de forma automática.

![Eliminar ciudad del sistema](/Practica1/docs/images/06_eliminar_ciudad.png)
*Figura 6: Proceso de eliminación de una ciudad y sus conexiones asociadas*

### 5.3 Gestión de Conexiones (Aristas)

* **Crear una conexión:**
  1. En la sección "Conexiones", ingrese el nombre de la ciudad de origen y el de la ciudad de destino.
  2. Ingrese el valor numérico de la distancia (peso) entre ambas.
  3. Haga clic en "Crear Conexión". El sistema validará que ambas ciudades existan antes de unir las.

![Formulario de conexión](/Practica1/docs/images/07_formulario_conexion.png)
*Figura 7: Formulario para crear una nueva conexión entre dos ciudades*

![Conexión creada exitosamente](/Practica1/docs/images/08_conexion_creada.png)
*Figura 8: Nueva arista creada mostrando la distancia entre ciudades*

* **Modificar una distancia:**
  1. Utilice la opción "Actualizar Conexión".
  2. Ingrese el origen, el destino y el nuevo valor de distancia.
  3. Confirme la operación. El valor en el lienzo se actualizará inmediatamente.

![Actualizar distancia de conexión](/Practica1/docs/images/09_actualizar_distancia.png)
*Figura 9: Modificación del peso/distancia de una conexión existente*


### 5.4 Búsqueda de Rutas

El sistema ofrece dos tipos de consulta lógica:

* **Ruta Óptima (Más Corta):**
  1. En el panel de búsqueda, seleccione la pestaña o opción "Ruta Óptima".
  2. Ingrese la ciudad de origen y la ciudad de destino.
  3. Haga clic en "Buscar".

![Panel de búsqueda de rutas](/Practica1/docs/images/10_panel_busqueda.png)
*Figura 10: Panel de búsqueda con opciones de ruta óptima y todas las rutas*

![Ruta óptima encontrada](/Practica1/docs/images/11_ruta_optima.png)
*Figura 11: Ruta más corta resaltada visualmente con el detalle del recorrido y distancia total*

* **Todas las Rutas Posibles:**
  1. Seleccione la opción "Todas las Rutas".
  2. Ingrese origen y destino, y ejecute la búsqueda.
  3. El sistema devolverá una lista ordenada de menor a mayor distancia con todas las trayectorias válidas (sin ciclos) disponibles entre los dos puntos.

![Lista de todas las rutas](/Practica1/docs/images/12_todas_las_rutas.png)
*Figura 12: Listado completo de todas las rutas posibles ordenadas por distancia*

### 5.5 Guardado de Cambios (Persistencia)

Cualquier modificación (agregar, eliminar o editar) se guarda temporalmente en la memoria del sistema. Para que estos cambios sean permanentes y sobrevivan a un reinicio:

1. Diríjase al panel de control.
2. Haga clic en el botón "Guardar Cambios en Disco".
3. Espere la notificación de confirmación.

![Botón de guardado](/Practica1/docs/images/13_guardar_cambios.png)
*Figura 13: Botón para persistir los cambios en el archivo de conocimiento*

## 6. Manejo de Errores Comunes

El sistema cuenta con validaciones para evitar inconsistencias. A continuación, se describen los mensajes de error más frecuentes y su solución:

| Mensaje de Error | Causa Probable | Solución |
| --- | --- | --- |
| "La ciudad ya existe" | Se intentó agregar un nodo con un nombre que ya está en el grafo. | Verifique el nombre o use la opción de modificar si es un error de escritura. |
| "Origen o destino no encontrados" | Se intentó crear una conexión o buscar una ruta usando nombres de ciudades que no están registradas. | Asegúrese de que ambas ciudades hayan sido creadas previamente y que la ortografía (incluyendo mayúsculas/minúsculas) sea exacta. |
| "No existe una ruta entre los puntos" | Las ciudades existen, pero no hay una secuencia de conexiones que las una (grafo desconectado). | Agregue las conexiones intermedias necesarias o verifique la topología del grafo. |
| "La distancia debe ser un número válido" | Se ingresó texto o caracteres especiales en el campo de distancia/peso. | Ingrese únicamente valores numéricos (enteros). |
