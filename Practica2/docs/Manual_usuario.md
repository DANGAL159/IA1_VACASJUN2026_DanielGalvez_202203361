# Manual de Usuario - SmartBot FAQ

**Universidad de San Carlos de Guatemala**
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**
**Inteligencia Artificial 1**
**Estudiante:** Daniel Gálvez - 202203361

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Público Objetivo](#2-público-objetivo)
3. [Requisitos del Sistema](#3-requisitos-del-sistema)
4. [Instalación y Despliegue](#4-instalación-y-despliegue)
5. [Primer Inicio del Sistema](#5-primer-inicio-del-sistema)
6. [Panel Administrativo Web](#6-panel-administrativo-web)
   6.1. Acceso al Sistema
   6.2. Dashboard Principal
   6.3. Gestión de Categorías
   6.4. Gestión de Preguntas FAQ
   6.5. Configuración del Bot
   6.6. Estadísticas y Auditoría
7. [Bot de Telegram - Guía para Usuarios Finales](#7-bot-de-telegram---guía-para-usuarios-finales)
   7.1. Primer Contacto con el Bot
   7.2. Comandos Disponibles
   7.3. Navegación por Menús Interactivos
   7.4. Búsqueda por Texto Libre
   7.5. Ejemplos de Uso
8. [Caso de Uso Completo: Flujo de Trabajo](#8-caso-de-uso-completo-flujo-de-trabajo)
9. [Solución de Problemas Comunes](#9-solución-de-problemas-comunes)
10. [Preguntas Frecuentes (FAQ del Sistema)](#10-preguntas-frecuentes-faq-del-sistema)
11. [Mejores Prácticas de Uso](#11-mejores-prácticas-de-uso)
12. [Anexos](#12-anexos)

---

## 1. Introducción

Bienvenido al **Manual de Usuario de SmartBot FAQ**, un sistema integral de gestión de preguntas frecuentes que combina un panel administrativo web con un bot conversacional de Telegram. Este sistema fue desarrollado como parte de la Práctica 2 del curso de Inteligencia Artificial 1.

SmartBot FAQ permite a los administradores gestionar una base de conocimiento estructurada por categorías, mientras que los usuarios finales pueden interactuar de manera natural a través de Telegram para obtener respuestas inmediatas a sus consultas. Todas las interacciones son registradas para fines de auditoría y análisis.

**¿Qué puede hacer SmartBot FAQ?**

* Responder preguntas frecuentes de forma automatizada vía Telegram.
* Permitir a administradores crear, editar y eliminar categorías y preguntas.
* Configurar el comportamiento del bot en tiempo real sin reiniciar el sistema.
* Registrar un historial completo de todas las interacciones.
* Proporcionar estadísticas de uso y métricas de rendimiento.
* Notificar a un grupo de auditoría sobre cada interacción del bot.

**¿Qué NO hace SmartBot FAQ?**

* No reemplaza la atención humana para consultas complejas o específicas.
* No implementa inteligencia artificial conversacional avanzada (es un sistema basado en coincidencia de texto).
* No gestiona usuarios finales de Telegram (cualquiera puede interactuar con el bot).

---

## 2. Público Objetivo

Este manual está dirigido a dos tipos de usuarios:

### 2.1 Administradores del Sistema

**Perfil:** Personal técnico o administrativo responsable de gestionar el contenido del bot y supervisar su funcionamiento.

**Responsabilidades:**
* Crear y mantener la base de conocimiento (categorías y preguntas).
* Configurar los parámetros del bot (token de Telegram, grupo de auditoría).
* Monitorear el historial de interacciones y estadísticas.
* Habilitar o deshabilitar el bot según necesidades.

**Conocimientos requeridos:**
* Uso básico de navegadores web.
* Comprensión de conceptos de categorías y preguntas frecuentes.
* Capacidad para redactar preguntas y respuestas claras.

### 2.2 Usuarios Finales de Telegram

**Perfil:** Cualquier persona con cuenta de Telegram que necesite consultar información frecuente.

**Responsabilidades:**
* Interactuar con el bot mediante comandos o texto libre.
* Navegar por los menús de categorías para encontrar respuestas.

**Conocimientos requeridos:**
* Uso básico de Telegram (enviar mensajes, hacer clic en botones).
* No se requiere registro ni autenticación.

---

## 3. Requisitos del Sistema

### 3.1 Para Administradores (Panel Web)

**Hardware:**
* Computadora con al menos 2 GB de RAM.
* Conexión a internet estable.

**Software:**
* Sistema operativo: Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+, Debian 10+).
* Navegador web moderno:
  * Google Chrome 90+
  * Mozilla Firefox 88+
  * Microsoft Edge 90+
  * Safari 14+
* Resolución de pantalla mínima: 1280x720 píxeles.

**Para despliegue local (desarrollo/pruebas):**
* Docker Engine 20.10 o superior.
* Docker Compose 2.0 o superior.
* Al menos 4 GB de RAM disponible.
* 2 GB de espacio en disco.

### 3.2 Para Usuarios Finales (Telegram)

**Hardware:**
* Dispositivo móvil (smartphone o tablet) o computadora.

**Software:**
* Aplicación oficial de Telegram instalada:
  * Android: versión 5.0 o superior.
  * iOS: versión 12.0 o superior.
  * Desktop: Windows, macOS o Linux.
  * Web: Navegador moderno (web.telegram.org).
* Cuenta de Telegram activa (gratuita).
* Conexión a internet.

**Nota:** El bot funciona con cualquier cliente oficial de Telegram. No se requieren aplicaciones de terceros.

---

## 4. Instalación y Despliegue

Esta sección está dirigida a administradores técnicos responsables de instalar el sistema.

### 4.1 Instalación de Docker y Docker Compose

**En Windows:**
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Ejecutar el instalador y seguir las instrucciones.
3. Reiniciar la computadora cuando se solicite.
4. Verificar instalación abriendo PowerShell y ejecutando:
```powershell
docker --version
docker-compose --version
```

**En macOS:**
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Arrastrar Docker a la carpeta Aplicaciones.
3. Abrir Docker desde Aplicaciones.
4. Verificar instalación abriendo Terminal y ejecutando:
```bash
docker --version
docker-compose --version
```

**En Linux (Ubuntu/Debian):**
```bash
# Actualizar repositorios
sudo apt update

# Instalar Docker
sudo apt install docker.io

# Instalar Docker Compose
sudo apt install docker-compose

# Agregar usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar para aplicar cambios

# Verificar instalación
docker --version
docker-compose --version
```

### 4.2 Obtención del Código Fuente

**Opción 1: Clonar desde repositorio Git**
```bash
git clone <url-del-repositorio>
cd Practica2
```

**Opción 2: Descargar archivo ZIP**
1. Descargar el archivo ZIP del proyecto.
2. Extraer el contenido en una carpeta de su elección.
3. Abrir terminal o símbolo del sistema en esa carpeta.

### 4.3 Verificación de la Estructura del Proyecto

Antes de continuar, verifique que la estructura de carpetas sea correcta:

```bash
ls -la
```

Debe ver:
```
backend/
frontend/
docs/
docker-compose.yml
```

### 4.4 Construcción y Levantamiento de Contenedores

Ejecute el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build -d
```

**Explicación del comando:**
* `docker-compose`: Herramienta de orquestación de contenedores.
* `up`: Levanta los servicios definidos en docker-compose.yml.
* `--build`: Fuerza la reconstrucción de las imágenes Docker (importante la primera vez).
* `-d`: Ejecuta los contenedores en segundo plano (detached mode).

**Tiempo estimado de primera ejecución:** 3-5 minutos (depende de la velocidad de internet para descargar imágenes base).

### 4.5 Verificación del Despliegue Exitoso

**Paso 1: Verificar estado de los contenedores**
```bash
docker-compose ps
```

Salida esperada:
```
NAME                STATUS              PORTS
practica2-db-1      Up                  0.0.0.0:5432->5432/tcp
practica2-backend-1 Up                  0.0.0.0:8000->8000/tcp
practica2-frontend-1 Up                 0.0.0.0:80->80/tcp
```

Todos los contenedores deben mostrar estado "Up".

**Paso 2: Verificar logs del sistema**
```bash
docker-compose logs
```

Busque las siguientes líneas clave:

En los logs del backend:
```
Usuario administrador por defecto creado exitosamente.
Datos de seed insertados exitosamente.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

En los logs de la base de datos:
```
database system is ready to accept connections
```

**Paso 3: Probar acceso a los servicios**

Abra un navegador web y visite:

* **Panel Administrativo:** http://localhost
* **API REST (documentación):** http://localhost:8000/docs

Si ambas páginas cargan correctamente, la instalación fue exitosa.

### 4.6 Detención del Sistema

Para detener todos los servicios:

```bash
docker-compose down
```

**Nota:** Este comando detiene los contenedores pero NO elimina los datos de la base de datos. Los datos persisten en un volumen de Docker.

Para detener y eliminar TODOS los datos (usar con precaución):
```bash
docker-compose down -v
```

### 4.7 Reinicio del Sistema

Para reiniciar los servicios:

```bash
docker-compose restart
```

O si los contenedores están detenidos:
```bash
docker-compose up -d
```

---

## 5. Primer Inicio del Sistema

### 5.1 Credenciales por Defecto

Al iniciar el sistema por primera vez, el script de inicialización (`seed_data.py`) crea automáticamente un usuario administrador con las siguientes credenciales:

| Campo | Valor |
|-------|-------|
| **Usuario** | `IA1-User` |
| **Contraseña** | `IA1-password@_new` |

**Nota importante:** La contraseña se almacena hasheada con bcrypt en la base de datos. El sistema no ofrece actualmente una interfaz para cambiar la contraseña; esta funcionalidad está contemplada para versiones futuras.

### 5.2 Datos de Ejemplo Precargados

El sistema incluye automáticamente datos iniciales para facilitar la exploración inmediata:

- **3 categorías base:** Admisión, Académico, Servicios Estudiantiles.
- **20 preguntas FAQ** distribuidas entre las categorías anteriores.

Estos datos permiten probar el bot de Telegram desde el primer momento, sin necesidad de crear contenido manualmente.

### 5.3 Acceso Inicial al Panel

1. Abra su navegador web moderno (Chrome, Firefox, Edge o Safari).
2. Navegue a `http://localhost`.
3. Se mostrará la pantalla de autenticación del panel administrativo.
4. Ingrese las credenciales por defecto y haga clic en **"Ingresar al Sistema"**.

Si las credenciales son correctas, el sistema mostrará una notificación de éxito y lo redirigirá automáticamente a la vista de **Preguntas FAQ**.

![Pantalla de Login](/Practica2/docs/images/login.png)

---

## 6. Panel Administrativo Web

El panel administrativo es una Aplicación de Página Única (SPA) construida con React. Está organizado en cuatro pestañas principales accesibles desde la barra superior:

1. **Preguntas FAQ** - Gestión de la base de conocimiento.
2. **Categorías** - Administración de agrupaciones lógicas.
3. **Configuración** - Parámetros del bot de Telegram.
4. **Auditoría** - Historial de consultas y estadísticas.

Adicionalmente, el panel cuenta con un **selector de tema** (modo claro/oscuro) ubicado en la esquina superior derecha. La preferencia de tema se guarda en el navegador del usuario y persiste entre sesiones.

### 6.1 Acceso al Sistema

**URL de acceso:** `http://localhost`

La pantalla de login solicita dos campos:
- **Usuario:** Nombre de usuario del administrador (sensible a mayúsculas/minúsculas).
- **Contraseña:** Contraseña del administrador.

**Proceso de autenticación:**
1. El sistema valida que el usuario exista en la base de datos.
2. Compara la contraseña ingresada con el hash almacenado mediante bcrypt.
3. Si la validación es exitosa, se concede acceso al panel.
4. Si falla, se muestra una notificación roja indicando "Credenciales incorrectas".

**Errores comunes en login:**

| Error | Causa | Solución |
|-------|-------|----------|
| "Credenciales incorrectas" | Usuario o contraseña incorrectos | Verificar mayúsculas/minúsculas. Usar credenciales por defecto si es el primer acceso. |
| "Error al cargar datos del servidor" | El backend no está respondiendo | Verificar que los contenedores estén corriendo con `docker-compose ps`. |
| Página en blanco | Problema con el frontend | Limpiar caché del navegador (Ctrl+F5) o probar en modo incógnito. |

### 6.2 Gestión de Preguntas FAQ (Pestaña "Preguntas FAQ")

Esta es la vista principal del panel. Presenta el formulario de creación/edición en la parte superior y la tabla de preguntas existentes en la parte inferior.

![Gestión de Preguntas](/Practica2/docs/images/preguntas.png)

#### 6.2.1 Crear una Nueva Pregunta

El formulario superior muestra el título **"Nueva Pregunta"** con una etiqueta verde que indica el modo "Crear".

**Pasos:**
1. En el campo **"Categoría"**, seleccione del menú desplegable la categoría a la que pertenecerá la pregunta.
2. En el campo **"Pregunta del Usuario"**, escriba la pregunta tal como podría formularla un usuario final.
3. En el campo **"Respuesta del Bot"**, redacte la respuesta completa que proporcionará el bot.
4. Haga clic en el botón **"Crear Pregunta"**.

**Validaciones:**
- Los tres campos son obligatorios. Si alguno está vacío, se mostrará una notificación de advertencia: "Todos los campos son obligatorios".
- El `categoria_id` debe corresponder a una categoría existente.

**Resultado exitoso:**
- Notificación verde: "Pregunta creada".
- El formulario se limpia automáticamente.
- La tabla inferior se actualiza mostrando la nueva pregunta.

#### 6.2.2 Editar una Pregunta Existente

El panel implementa un sistema de edición integrado con desplazamiento automático (scroll) para mejorar la experiencia de usuario.

**Pasos:**
1. En la tabla de preguntas, localice la pregunta a modificar.
2. Haga clic en el botón con icono de lápiz (editar) en la columna "Acciones".
3. El sistema realizará dos acciones simultáneamente:
   - Cargará los datos de la pregunta en el formulario superior.
   - Desplazará la vista suavemente hacia el formulario para que el usuario note que está en modo edición.
4. El formulario cambiará su apariencia:
   - El título mostrará **"Editar Pregunta"** con el ID de la pregunta.
   - Una etiqueta naranja indicará el modo "Editar".
   - El fondo del formulario cambiará a un tono de advertencia (amarillo suave).
   - Aparecerá un botón adicional **"Cancelar Edición"**.
5. Modifique los campos necesarios.
6. Haga clic en **"Guardar Cambios"**.

**Cancelar una edición:**
Si decide no guardar los cambios, haga clic en **"Cancelar Edición"**. El formulario volverá al modo "Crear" con todos los campos vacíos.

#### 6.2.3 Eliminar una Pregunta

**Pasos:**
1. Localice la pregunta en la tabla.
2. Haga clic en el botón con icono de papelera (eliminar) en la columna "Acciones".
3. La eliminación es inmediata y no requiere confirmación adicional.

**Advertencia:** La eliminación es permanente. Si un usuario de Telegram consulta posteriormente una pregunta eliminada, recibirá el mensaje de fallback: *"Lo siento, no tengo una respuesta registrada para esa consulta."*

#### 6.2.4 Estructura de la Tabla de Preguntas

La tabla muestra la siguiente información:

| Columna | Descripción |
|---------|-------------|
| **ID** | Identificador único de la pregunta. |
| **Categoría** | Nombre de la categoría asociada (mostrado como badge). |
| **Pregunta** | Texto completo de la pregunta. |
| **Respuesta** | Texto de la respuesta (truncado a 60px de altura si es muy largo). |
| **Acciones** | Botones de editar y eliminar. |

Cuando una pregunta está siendo editada, su fila en la tabla se resalta visualmente para facilitar la identificación.

### 6.3 Gestión de Categorías (Pestaña "Categorías")

Esta vista permite administrar las agrupaciones lógicas de preguntas mediante una interfaz de lista con edición en línea.

![Gestión de Categorías](/Practica2/docs/images/categorias.png)

#### 6.3.1 Crear una Nueva Categoría

**Pasos:**
1. En el campo de texto superior, escriba el nombre de la nueva categoría.
2. Haga clic en el botón **"Agregar"**.

**Validaciones:**
- El nombre no puede estar vacío (se ignoran espacios en blanco al inicio y final).
- El nombre debe ser único en el sistema.

**Ejemplos de nombres válidos:**
- "Becas y Financiamiento"
- "Horarios de Clase"
- "Trámites de Graduación"

#### 6.3.2 Editar una Categoría (Edición en Línea)

El panel implementa edición en línea (inline editing), lo que significa que el campo de texto se transforma directamente en un campo editable sin abrir ventanas modales.

**Pasos:**
1. Localice la categoría a modificar en la lista.
2. Haga clic en el botón con icono de lápiz (editar) a la derecha del nombre.
3. El nombre se convertirá en un campo de texto editable con foco automático.
4. Aparecerán dos botones:
   - **"Ok"** (verde): Confirma los cambios.
   - **"X"** (gris): Cancela la edición.
5. Modifique el nombre y presione **"Ok"** o la tecla Enter.

**Restricción importante:** Si la categoría tiene preguntas asociadas, el cambio de nombre se reflejará automáticamente en todas las preguntas vinculadas.

#### 6.3.3 Eliminar una Categoría

**Pasos:**
1. Localice la categoría en la lista.
2. Haga clic en el botón con icono de papelera (eliminar).

**Restricción de integridad:**
No se puede eliminar una categoría que contenga preguntas asociadas. Si lo intenta, el sistema mostrará una notificación de error: *"No se puede eliminar la categoría porque tiene preguntas asociadas"*.

**Procedimiento correcto:**
1. Vaya a la pestaña "Preguntas FAQ".
2. Elimine o reasigne todas las preguntas de esa categoría a otra categoría.
3. Regrese a "Categorías" y elimine la categoría ahora vacía.

### 6.4 Configuración del Bot (Pestaña "Configuración")

Esta sección permite modificar los parámetros operativos del bot de Telegram en tiempo real, sin necesidad de reiniciar el sistema.

![Configuración del Bot](/Practica2/docs/images/configuracion.png)

#### 6.4.1 Estado del Bot (Interruptor Principal)

En la parte superior se encuentra un interruptor visual que indica el estado actual del bot:

- **BOT ACTIVO — Escuchando mensajes** (fondo verde suave): El bot está procesando y respondiendo mensajes de Telegram.
- **BOT APAGADO** (fondo rojo suave): El bot ignora todos los mensajes entrantes.

**Cómo cambiar el estado:**
1. Marque o desmarque el checkbox.
2. El cambio visual es inmediato, pero para que surta efecto en el sistema debe hacer clic en **"Guardar Configuración"**.
3. El bot aplicará el nuevo estado en la siguiente iteración de su ciclo de polling (máximo 5 segundos).

**Casos de uso para desactivar el bot:**
- Mantenimiento programado del sistema.
- Actualización masiva de la base de conocimiento.
- Periodos vacacionales sin personal de supervisión.
- Diagnóstico de problemas técnicos.

#### 6.4.2 Token del Bot de Telegram

El token es la credencial que autentica su bot ante la API oficial de Telegram. Se muestra como un campo de contraseña (oculto por defecto) por motivos de seguridad.

**Cómo obtener el token:**
1. Abra Telegram y busque el usuario `@BotFather`.
2. Envíe el comando `/newbot`.
3. Proporcione un nombre para el bot (ej: "SmartBot FAQ").
4. Proporcione un username que termine en "bot" (ej: "smartbot_ia1_bot").
5. Copie el token completo que @BotFather le proporcionará.

**Formato del token:**
```
123456789:AAHxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Precaución:** El token es altamente sensible. Quien lo posea puede controlar completamente el bot. No lo comparta ni lo incluya en capturas de pantalla públicas.

#### 6.4.3 ID del Grupo de Respaldo (Auditoría)

Este campo opcional permite configurar un supergrupo de Telegram donde se enviará una copia de todas las interacciones del bot.

**Cómo obtener el ID del grupo:**
1. Cree un grupo en Telegram y conviértalo en supergrupo (cambiando el historial de chat a "Visible").
2. Agregue el bot al grupo como miembro.
3. Agregue `@userinfobot` al grupo; este enviará automáticamente un mensaje con el ID del grupo.
4. Copie el ID (formato negativo, ej: `-1001234567890`).

**Si se deja vacío:**
El bot funcionará normalmente pero no enviará notificaciones de auditoría al grupo.

#### 6.4.4 Guardar los Cambios

Después de modificar cualquier parámetro, haga clic en **"Guardar Configuración"**. El sistema enviará los nuevos valores al backend y mostrará una notificación de éxito: *"Configuración guardada"*.

Los cambios son aplicados en caliente: el bot los tomará en cuenta en su próxima iteración de polling, sin necesidad de reiniciar el contenedor.

### 6.5 Auditoría e Historial (Pestaña "Auditoría")

Esta vista proporciona visibilidad completa sobre el uso del bot, dividida en dos secciones: estadísticas agregadas y el historial detallado de consultas.

![Auditoría e Historial](/Practica2/docs/images/auditoria.png)

#### 6.5.1 Tarjetas de Estadísticas

En la parte superior se muestran dos tarjetas con métricas clave:

| Métrica | Descripción |
|---------|-------------|
| **Consultas Totales** | Número total de interacciones registradas en el historial desde el inicio del sistema. |
| **Usuarios Únicos** | Cantidad de usuarios distintos de Telegram que han interactuado con el bot (contabilizados por username). |

Estas métricas se actualizan automáticamente al cargar la vista.

#### 6.5.2 Tabla de Últimas Consultas Registradas

La tabla inferior muestra un registro cronológico de cada interacción con el bot, ordenada de la más reciente a la más antigua.

**Columnas de la tabla:**

| Columna | Descripción |
|---------|-------------|
| **Fecha** | Marca de tiempo en formato localizado (es-GT) con año, mes, día, hora y minuto. |
| **Usuario** | Username de Telegram del usuario que realizó la consulta, mostrado como badge con prefijo "@". Si el usuario no tiene username, se muestra "Anónimo". |
| **Consulta** | Texto exacto enviado por el usuario al bot. Puede ser un comando (`/start`, `/ayuda`, `/preguntas`), texto libre de búsqueda, o la descripción de una acción de menú. |
| **Respuesta** | Texto exacto enviado por el bot como respuesta (truncado a 60px de altura si es muy largo). |

#### 6.5.3 Actualización Manual del Historial

El panel incluye un botón **"Actualizar Historial"** con icono de refrescar en la esquina superior derecha de la sección. Al hacer clic:
- Se realiza una nueva consulta al backend.
- La tabla se actualiza con las últimas interacciones.
- Se muestra una notificación informativa: *"Auditoría actualizada"*.

**Nota:** El historial no se actualiza en tiempo real automáticamente. Para ver las últimas interacciones, debe presionar el botón de actualización.

#### 6.5.4 Uso del Historial para Mejorar el Sistema

El historial es una herramienta valiosa para el mantenimiento continuo:

- **Identificar preguntas sin respuesta:** Busque respuestas que contengan *"Lo siento, no tengo una respuesta registrada"*. Analice las consultas asociadas y considere agregarlas a la base de conocimiento.
- **Detectar ambigüedades:** Si una consulta recibió una respuesta incorrecta, la pregunta en la base de datos puede ser demasiado vaga.
- **Identificar tendencias:** Observe qué tipos de preguntas son más frecuentes para priorizar la expansión del contenido.

---

## 7. Bot de Telegram - Guía para Usuarios Finales

Esta sección está dirigida a los usuarios finales que interactúan con el bot a través de Telegram.

### 7.1 Primer Contacto con el Bot

**Paso 1: Encontrar el bot**
1. Abra Telegram.
2. En la barra de búsqueda, escriba el username del bot (ej: `@smartbot_ia1_bot`).
3. Seleccione el bot de los resultados.

**Paso 2: Iniciar la conversación**
1. Haga clic en el botón "Iniciar" o envíe el comando `/start`.
2. El bot responderá con el mensaje de bienvenida:

```
¡Hola! Soy SmartBot. Estoy aquí para resolver tus dudas frecuentes. 
Escribe /ayuda para ver las instrucciones.
```

### 7.2 Comandos Disponibles

El bot reconoce tres comandos especiales:

#### 7.2.1 Comando `/start`
- **Propósito:** Iniciar la conversación y recibir el mensaje de bienvenida.
- **Cuándo usarlo:** La primera vez que interactúa con el bot, o si desea ver nuevamente el mensaje inicial.

#### 7.2.2 Comando `/ayuda`
- **Propósito:** Ver las instrucciones de uso del bot.
- **Respuesta del bot:**
```
Instrucciones de uso:

Escribe tu pregunta o palabras clave (ej. 'requisitos' o 'notas').

Comandos:
- /start - Iniciar el bot
- /ayuda - Ver instrucciones
- /preguntas - Explorar el menú de preguntas
```

#### 7.2.3 Comando `/preguntas`
- **Propósito:** Abrir el menú interactivo de categorías.
- **Respuesta del bot:** Un mensaje con botones (Inline Keyboard) que listan todas las categorías disponibles.

### 7.3 Navegación por Menús Interactivos

El bot utiliza teclados interactivos (Inline Keyboards) que permiten navegar sin necesidad de escribir.

**Flujo completo:**

1. **Usuario envía:** `/preguntas`
2. **Bot muestra:** Botones con nombres de categorías.
   ```
   [ Admisión ]
   [ Académico ]
   [ Servicios Estudiantiles ]
   ```
3. **Usuario hace clic en una categoría.**
4. **Bot muestra:** Botones con las preguntas de esa categoría.
   ```
   [ ¿Cuáles son los requisitos de admisión? ]
   [ ¿Cuándo es la fecha límite de inscripción? ]
   [ ¿Cuánto cuesta el proceso? ]
   ```
5. **Usuario hace clic en una pregunta.**
6. **Bot envía:** La respuesta completa formateada en HTML.

**Ventajas del menú interactivo:**
- No requiere escribir.
- Permite explorar todas las opciones disponibles.
- Elimina el riesgo de errores de escritura.

### 7.4 Búsqueda por Texto Libre

La forma más rápida de obtener una respuesta es escribir directamente la pregunta o palabras clave.

**Cómo funciona:**
1. El bot toma el texto que usted envía.
2. Busca en la base de datos preguntas que contengan ese texto (insensible a mayúsculas/minúsculas).
3. Retorna la primera coincidencia encontrada.

**Ejemplos de búsquedas exitosas:**

| Usuario envía | Coincide con |
|---------------|--------------|
| "requisitos" | "¿Cuáles son los requisitos de admisión?" |
| "FECHA" | "¿Cuándo es la fecha límite de inscripción?" |
| "becas disponibles" | "¿Hay becas disponibles para estudiantes?" |
| "horario biblioteca" | "¿Cuál es el horario de atención de biblioteca?" |

**Consejos para búsquedas efectivas:**
- Use palabras clave específicas, no demasiado genéricas.
- Use frases completas cuando sea posible.
- Evite palabras muy comunes como "el", "la", "de".
- Si una búsqueda no funciona, pruebe con sinónimos.

**Cuando no hay coincidencia:**
Si el bot no encuentra ninguna pregunta que coincida, responderá:
```
Lo siento, no tengo una respuesta registrada para esa consulta. 
Usa /preguntas para ver los temas disponibles.
```

En este caso:
1. Reformule su pregunta con palabras diferentes.
2. Use el menú de preguntas (`/preguntas`) para explorar las opciones.
3. Contacte al administrador para sugerir agregar la pregunta.

### 7.5 Limitaciones del Bot

- **No entiende contexto:** Cada mensaje se procesa de forma independiente.
- **No maneja sinónimos automáticamente:** "inscripción" y "registro" se tratan como palabras distintas.
- **No corrige errores ortográficos:** La búsqueda es literal.
- **Solo retorna la primera coincidencia:** No hay forma de ver múltiples resultados.
- **Solo procesa texto:** Las imágenes, archivos, stickers y mensajes de voz son ignorados.

![](/Practica2/docs/images/bot.png)

---

## 8. Caso de Uso Completo: Flujo de Trabajo

Este ejemplo muestra un flujo de trabajo completo desde la perspectiva del administrador y del usuario final.

### 8.1 Escenario: Agregar una Nueva Pregunta sobre Becas

**Contexto:** La universidad lanza un nuevo programa de becas y el administrador debe agregar esta información al bot.

#### Paso 1: Administrador accede al panel
1. Abre el navegador y navega a `http://localhost`.
2. Ingresa sus credenciales y accede al panel.
3. Verifica que la categoría "Becas y Financiamiento" exista en la pestaña **Categorías**. Si no existe, la crea.

#### Paso 2: Administrador crea la nueva pregunta
1. Navega a la pestaña **Preguntas FAQ**.
2. En el formulario superior:
   - Selecciona "Becas y Financiamiento" en el menú de categorías.
   - Escribe la pregunta: *"¿Cuáles son los requisitos para la beca de excelencia académica?"*
   - Redacta la respuesta completa con requisitos, proceso de solicitud y montos.
3. Hace clic en **"Crear Pregunta"**.
4. Recibe la notificación verde: *"Pregunta creada"*.

#### Paso 3: Usuario final consulta la nueva pregunta
Interacción en Telegram:
```
Usuario: beca excelencia
Bot: [Respuesta completa sobre la beca de excelencia]
```

#### Paso 4: Administrador verifica el registro
1. Navega a la pestaña **Auditoría**.
2. Presiona el botón **"Actualizar Historial"**.
3. Localiza la nueva interacción en la tabla:
   - Usuario: `@estudiante_juan`
   - Consulta: `beca excelencia`
   - Respuesta: Texto completo enviado.
4. Confirma que el grupo de auditoría también recibió la notificación (si está configurado).

### 8.2 Escenario: Deshabilitar el Bot Temporalmente

**Contexto:** El sistema entrará en mantenimiento programado de 2:00 AM a 4:00 AM.

#### Paso 1: Administrador deshabilita el bot (1:55 AM)
1. Accede al panel y navega a la pestaña **Configuración**.
2. Desmarca el checkbox **"BOT ACTIVO"**.
3. El interruptor cambia a rojo: *"BOT APAGADO"*.
4. Hace clic en **"Guardar Configuración"**.
5. Recibe la notificación: *"Configuración guardada"*.

**Resultado:** En un máximo de 5 segundos, el bot deja de responder mensajes.

#### Paso 2: Periodo de mantenimiento (2:00 AM - 4:00 AM)
- Los mensajes enviados al bot no reciben respuesta.
- El panel administrativo sigue operativo.
- El administrador realiza las tareas de mantenimiento.

#### Paso 3: Administrador rehabilita el bot (4:05 AM)
1. Navega a **Configuración**.
2. Marca el checkbox **"BOT ACTIVO"**.
3. Guarda los cambios.
4. Envía un mensaje de prueba al bot para confirmar su funcionamiento.

---

## 9. Solución de Problemas Comunes

### 9.1 Problemas del Panel Administrativo

#### 9.1.1 No puedo acceder al panel

**Síntoma:** Al navegar a `http://localhost`, la página no carga.

| Causa probable | Solución |
|----------------|----------|
| Los contenedores no están corriendo | Ejecutar `docker-compose ps`. Si no están activos, ejecutar `docker-compose up -d`. |
| El puerto 80 está ocupado | Detener la aplicación que usa el puerto o modificar el mapeo en `docker-compose.yml`. |
| Problema con el navegador | Probar en modo incógnito o con otro navegador. |

#### 9.1.2 El login falla con credenciales correctas

**Síntoma:** Ingreso las credenciales por defecto pero recibo "Credenciales incorrectas".

| Causa probable | Solución |
|----------------|----------|
| Mayúsculas/minúsculas incorrectas | Verificar exactamente `IA1-User` y `IA1-password@_new`. |
| El usuario admin no se creó | Revisar logs: `docker-compose logs backend \| grep "Usuario administrador"`. |
| Base de datos corrupta | Detener con `docker-compose down -v` y reiniciar (esto borra todos los datos). |

#### 9.1.3 No puedo eliminar una categoría

**Síntoma:** Al intentar eliminar, aparece el error: *"No se puede eliminar la categoría porque tiene preguntas asociadas"*.

**Solución:**
1. Vaya a la pestaña **Preguntas FAQ**.
2. Elimine o reasigne todas las preguntas de esa categoría.
3. Regrese a **Categorías** y elimine la categoría.

#### 9.1.4 Los cambios no se reflejan en el bot

**Síntoma:** Creo una pregunta en el panel pero el bot no la muestra.

| Causa probable | Solución |
|----------------|----------|
| El bot está deshabilitado | Verificar en **Configuración** que el interruptor esté en verde. |
| Token inválido | Verificar el token en @BotFather y actualizarlo. |
| Backend sin conexión a la BD | Revisar logs: `docker-compose logs backend`. |

### 9.2 Problemas del Bot de Telegram

#### 9.2.1 El bot no responde a mis mensajes

**Síntoma:** Envío mensajes al bot pero no recibo respuesta.

| Causa probable | Solución (administrador) |
|----------------|--------------------------|
| Bot deshabilitado | Activar en la pestaña **Configuración**. |
| Token inválido | Regenerar token en @BotFather y actualizarlo. |
| Backend caído | Verificar con `docker-compose ps` y reiniciar si es necesario. |
| Usuario bloqueó al bot | El usuario debe desbloquearlo desde Telegram. |

**Diagnóstico:**
```bash
# Verificar que el backend esté corriendo
docker-compose ps

# Revisar logs del bot
docker-compose logs backend | grep -i "telegram"

# Probar el token
curl https://api.telegram.org/bot<TU_TOKEN>/getMe
```

#### 9.2.2 El bot responde "no tengo una respuesta registrada"

**Causa:** La búsqueda no encontró coincidencia.

**Soluciones:**
- **Usuario:** Reformule la pregunta con sinónimos o use el menú `/preguntas`.
- **Administrador:** Revise el historial en **Auditoría** y agregue la pregunta faltante.

#### 9.2.3 Los botones del menú no funcionan

**Soluciones:**
- Cerrar y reabrir Telegram.
- Enviar `/preguntas` nuevamente para regenerar el menú.
- Verificar conexión a internet.
- Como alternativa, usar búsqueda por texto libre.

### 9.3 Problemas de Datos

#### 9.3.1 Perdí todos mis datos después de reiniciar

**Causa:** Se ejecutó `docker-compose down -v` en algún momento, lo que elimina el volumen de datos.

**Solución:** Los datos no se pueden recuperar. Debe recrear categorías y preguntas manualmente.

**Prevención:** Realice backups regulares:
```bash
docker-compose exec db pg_dump -U postgres smartbotdb > backup_$(date +%Y%m%d).sql
```

#### 9.3.2 Restaurar un backup

```bash
# 1. Detener servicios
docker-compose down

# 2. Iniciar solo la base de datos
docker-compose up -d db

# 3. Esperar 15 segundos

# 4. Restaurar
docker-compose exec -T db psql -U postgres smartbotdb < backup.sql

# 5. Iniciar todo
docker-compose up -d
```

---

## 10. Preguntas Frecuentes (FAQ del Sistema)

### 10.1 Para Administradores

**P: ¿Puedo tener múltiples administradores?**
R: Actualmente el sistema soporta un único usuario administrador (`IA1-User`). La gestión de múltiples usuarios con roles está contemplada para versiones futuras.

**P: ¿Cómo cambio la contraseña del administrador?**
R: No existe una interfaz para esto en la versión actual. Las opciones son: modificar la base de datos directamente, o reiniciar con `docker-compose down -v` (perdiendo todos los datos).

**P: ¿Hay un límite de preguntas o categorías?**
R: No hay límite técnico. PostgreSQL puede manejar millones de registros. Sin embargo, por usabilidad se recomienda mantener entre 5-10 categorías y 10-20 preguntas por categoría.

**P: ¿Puedo personalizar la apariencia del panel?**
R: Sí, el frontend está construido con React y CSS. Puede modificar los archivos en `frontend/src/`. Además, el panel incluye un selector de tema claro/oscuro.

**P: ¿Qué pasa si el servidor se reinicia?**
R: Los contenedores tienen `restart: always` en `docker-compose.yml`, por lo que se reiniciarán automáticamente. Los datos persisten en el volumen de PostgreSQL.

**P: ¿Cómo actualizo el sistema?**
R:
1. Haga backup de la base de datos.
2. `docker-compose down`
3. Actualice el código fuente.
4. `docker-compose build`
5. `docker-compose up -d`

### 10.2 Para Usuarios Finales

**P: ¿Necesito registrarme para usar el bot?**
R: No, el bot es público y no requiere autenticación.

**P: ¿Mis conversaciones son privadas?**
R: Sus conversaciones son privadas entre usted y el bot, pero todas las interacciones quedan registradas en el historial de auditoría visible para el administrador.

**P: ¿Puedo usar el bot desde Telegram Web?**
R: Sí, el bot funciona con cualquier cliente oficial de Telegram (móvil, desktop, web).

**P: ¿Puedo enviar imágenes o archivos al bot?**
R: No, el bot solo procesa mensajes de texto. Otros tipos de mensajes son ignorados.

**P: ¿Por qué el bot tarda en responder?**
R: El bot procesa mensajes en orden de llegada. Normalmente responde en menos de 3 segundos. Si hay alta concurrencia, puede haber retrasos.

**P: ¿Qué hago si el bot da una respuesta incorrecta?**
R: Contacte al administrador proporcionando: la pregunta exacta, la respuesta recibida y la respuesta correcta esperada.

**P: ¿El bot recuerda conversaciones anteriores?**
R: No, cada mensaje se procesa independientemente. No hay memoria conversacional.

---

## 11. Mejores Prácticas de Uso

### 11.1 Para Administradores

#### Gestión de la Base de Conocimiento

**Organice las categorías de forma lógica:**
- Agrupe preguntas por temas relacionados.
- Use nombres claros y descriptivos.
- Evite crear más de 10-15 categorías.

**Redacte preguntas específicas:**
- Bien: *"¿Cuáles son los requisitos de admisión para estudiantes de primer ingreso?"*
- Mal: *"requisitos"* (demasiado vago).

**Escriba respuestas completas:**
- Proporcione toda la información necesaria.
- Use formato HTML básico (`<b>`, `<i>`) para resaltar información importante.
- Incluya datos de contacto cuando sea relevante.

**Mantenga la información actualizada:**
- Revise periódicamente las preguntas.
- Use el historial de auditoría para identificar preguntas obsoletas.
- Actualice fechas, costos y requisitos cuando cambien.

#### Monitoreo y Mantenimiento

**Revise el historial de auditoría:**
- Diario: Identifique consultas sin respuesta.
- Semanal: Analice tendencias y preguntas más consultadas.
- Mensual: Genere reportes de uso.

**Realice backups regulares:**
```bash
docker-compose exec db pg_dump -U postgres smartbotdb > backup_$(date +%Y%m%d).sql
```

**Proteja las credenciales:**
- No comparta la contraseña del administrador.
- No comparta el token del bot.
- Si sospecha compromiso del token, regenérelo en @BotFather.

### 11.2 Para Usuarios Finales

**Haga preguntas específicas:**
- Bien: *"requisitos admisión primer ingreso"*
- Mal: *"info"*

**Use el menú cuando no sepa qué preguntar:**
- Envíe `/preguntas` para explorar todas las opciones.

**Pruebe variaciones si no encuentra respuesta:**
- Use sinónimos.
- Pruebe formas singulares y plurales.
- Reformule con diferentes palabras.

**Sea paciente con los tiempos de respuesta:**
- No envíe el mismo mensaje múltiples veces.
- Espere al menos 10 segundos antes de reintentar.

---

## 12. Anexos

### 12.1 Glosario de Términos

- **Bot:** Programa que automatiza tareas en Telegram.
- **Categoría:** Agrupación lógica de preguntas relacionadas.
- **FAQ:** Preguntas frecuentes.
- **Inline Keyboard:** Teclado interactivo con botones dentro del chat.
- **Long Polling:** Técnica donde el bot mantiene conexión abierta con Telegram esperando mensajes.
- **Seed:** Datos iniciales cargados en una base de datos vacía.
- **Token:** Credencial que autentica al bot ante la API de Telegram.

### 12.2 Comandos Útiles de Docker

```bash
# Levantar el sistema
docker-compose up --build -d

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f backend

# Detener el sistema (conservando datos)
docker-compose down

# Detener y borrar todos los datos
docker-compose down -v

# Backup de base de datos
docker-compose exec db pg_dump -U postgres smartbotdb > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres smartbotdb < backup.sql
```