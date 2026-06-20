# Manual de Usuario - SmartInvoice OCR y RPA

**Universidad de San Carlos de Guatemala** 
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas** 
**Inteligencia Artificial 1** 
**Estudiante:** Daniel Gálvez - 202203361

---

## 1. Introducción al Sistema

**SmartInvoice** es una plataforma automatizada diseñada para agilizar el procesamiento de facturas mediante Inteligencia Artificial (OCR) y Automatización Robótica de Procesos (RPA). El sistema extrae los datos clave de sus facturas (PDF o imágenes), permite una validación rápida y los registra en un sistema contable simulado, generando comprobantes y reportes automáticos.

El sistema cuenta con dos tipos de perfiles:

* **Usuario (Cliente):** Orientado a la carga de documentos propios, validación y consulta de métricas de consumo personal.
* **Administrador:** Orientado a la auditoría global, gestión de cuentas, administración de proveedores y visualización de rendimiento de toda la plataforma.

---

## 2. Acceso y Configuración Inicial

### 2.1 Pantalla de Inicio de Sesión y Registro

Al ingresar a la plataforma, se presentará la pantalla de autenticación.

![Pantalla de inicio de sesion y registro](/Practica3/docs/images/1-login_register.png)
*Figura 1: Interfaz de autenticación y registro de nuevos usuarios.*

1. **Ingresar:** Introduzca su nombre de usuario y contraseña proporcionados por el administrador, o creados por usted mismo.
2. **Registrarse:** Si no posee cuenta, seleccione la pestaña "Registrarse", ingrese un nombre de usuario único y una contraseña. El sistema le creará un perfil con el rol estándar de "Usuario".
3. **Alternar Tema:** En la esquina superior derecha encontrará un botón con un icono (Sol/Luna) que le permite cambiar la interfaz gráfica entre Modo Claro y Modo Oscuro para mayor comodidad visual.

---

## 3. Guía para el Perfil: Usuario (Cliente)

Al iniciar sesión como usuario, tendrá acceso a tres pestañas principales de operación.

### 3.1 Pestaña: Carga Masiva

Esta sección está destinada al ingreso de facturas al sistema.

![Interfaz de carga masiva de facturas](/Practica3/docs/images/7-user-carga-masiva.png)
*Figura 2: Módulo de carga masiva y validación intermedia de documentos.*

1. **Arrastrar y Soltar:** Arrastre sus archivos (PDF, PNG, JPG, JPEG) directamente al recuadro punteado en el centro de la pantalla, o haga clic sobre él para abrir el explorador de archivos de su computadora. Puede seleccionar múltiples facturas a la vez.
2. **Procesar Lote:** Una vez cargados los archivos, presione "Procesar Lote". El sistema OCR leerá los documentos y extraerá la información.
3. **Validación Intermedia:** Se desplegará una tabla con los datos extraídos (Proveedor, NIT, Factura, Total).
   * Revise que los datos sean correctos. Puede editarlos directamente en las cajas de texto si el OCR cometió algún error de lectura.
   * **Aprobar:** Presione este botón en una fila específica para enviar esa factura al robot RPA.
   * **Rechazar:** Presione este botón si la factura es inválida. Se archivará como rechazada y no afectará sus métricas.
   * **Aprobar Todo el Lote:** Procesa automáticamente todas las facturas en cola de forma secuencial.
   * **Copiar reportes a:** Ingrese un correo electrónico en la parte superior si desea que el sistema le envíe el respaldo de la factura confirmada.

### 3.2 Pestaña: Mis Documentos

Muestra el historial completo de las facturas que usted ha subido.

![Historial de documentos del usuario](/Practica3/docs/images/8-user-documentos.png)
*Figura 3: Listado de documentos procesados con opciones de exportación y reenvío.*

* **Filtros Avanzados:** Utilice la barra superior para buscar facturas de un proveedor específico o dentro de un rango de fechas determinado (Fecha Inicio y Fecha Fin).
* **Reenviar Correo:** Si necesita que el comprobante de la factura se envíe de nuevo, presione "Reenviar Correo" e ingrese la dirección destino en la ventana emergente.
* **Exportar:** Puede descargar el registro de la factura seleccionando el formato deseado (PDF, Excel o CSV).

### 3.3 Pestaña: Mis Métricas

Visualización analítica del rendimiento financiero basado únicamente en las facturas procesadas de forma exitosa (excluyendo las rechazadas).

![Dashboard de metricas del usuario cliente](/Practica3/docs/images/9-user-metricas.png)
*Figura 4: Panel analítico personal con gráficas de evolución y concentración de gasto.*

* **Indicadores Clave:** Muestra el volumen total de documentos y la suma financiera total.
* **Gráficas de Evolución temporal:** Un gráfico de líneas indicará los picos de facturación por fecha.
* **Gráfica de Concentración:** Un gráfico circular detallará qué porcentaje del gasto total pertenece a cada proveedor.
* *Nota:* Los filtros superiores de esta vista actualizarán las gráficas en tiempo real.

---

## 4. Guía para el Perfil: Administrador

El administrador posee control total de la plataforma y visualiza cinco pestañas en su panel de control.

### 4.1 Pestaña: Auditoría General

Un repositorio global donde se listan absolutamente todas las facturas procesadas en la plataforma, indicando a qué cliente pertenecen.

![Panel de auditoria general del administrador](/Practica3/docs/images/2-admin-auditoria.png)
*Figura 5: Registro global de auditoría con trazabilidad de usuarios y estados.*

* **Ver Archivo (Evidencia RPA):** Para las facturas con estado "Procesado", el administrador verá un botón. Al hacer clic, se abrirá en una nueva pestaña la captura de pantalla exacta que tomó el robot al registrar la factura en el sistema, demostrando la veracidad de la automatización.
* **Filtros Centralizados:** Permite segmentar las facturas por Cliente, Proveedor o Rango de Fechas.

### 4.2 Pestaña: Proveedores

Directorio donde se administran las empresas emisoras de facturas.

![Gestion de proveedores](/Practica3/docs/images/3-admin-proveedores.png)
*Figura 6: Módulo CRUD para el directorio centralizado de proveedores.*

* **Registrar Nuevo:** Ingrese la Razón Social y el NIT, luego presione el botón de registro.
* **Editar/Eliminar:** Utilice las acciones al final de la tabla para modificar los datos. El sistema bloqueará la eliminación si el proveedor ya tiene facturas emitidas, garantizando la integridad de los datos.

### 4.3 Pestaña: Clientes

Módulo de gestión de cuentas de usuario.

![Administracion de clientes y usuarios](/Practica3/docs/images/4-admin-clientes.png)
*Figura 7: Interfaz para la creación, edición y control de roles de los usuarios del sistema.*

* **Crear Usuario:** Permite al administrador crear cuentas de forma manual. Requiere definir un nombre de usuario, una contraseña inicial y seleccionar el rol (Usuario o Administrador).
* **Editar:** Permite cambiar el nombre de la cuenta o promover/degradar roles.
* **Eliminar:** Elimina cuentas del sistema (solo si no poseen facturas asociadas).

### 4.4 Pestaña: Métricas Globales

Dashboard analítico similar al del cliente, pero con alcance organizacional.

![Metricas globales de la plataforma](/Practica3/docs/images/5-admin-metricas.png)
*Figura 8: Dashboards analíticos con métricas agregadas de toda la organización.*

* **Gráfica de Top Proveedores:** Muestra un gráfico de barras con los 10 proveedores a los que más se les ha facturado a nivel global.
* **Aportación por Cliente:** Un gráfico de distribución que refleja qué usuarios registran el mayor volumen financiero en la plataforma.
* Todos los gráficos responden a los filtros cruzados en la parte superior.

### 4.5 Pestaña: Logs RPA (Bitácora)

Es un registro inmutable de seguridad. Muestra cada acción realizada por el sistema automatizado.

![Bitacora de ejecuciones RPA](/Practica3/docs/images/6-admin-logs_rpa.png)
*Figura 9: Bitácora técnica de las ejecuciones del robot RPA y sus resultados.*

* Incluye la fecha y hora exacta del evento.
* Muestra el archivo de origen que originó la petición.
* Registra si la acción fue un "Éxito" (color verde) o "Error/Rechazado" (color rojo), proporcionando el detalle técnico devuelto por el servidor para su posterior análisis.