# Manual de Usuario - Sistema Experto "Doctor Byte" (IA1)

**Universidad de San Carlos de Guatemala**  
**Facultad de Ingeniería - Escuela de Ciencias y Sistemas**  
**Inteligencia Artificial 1**  
**Proyecto:** Doctor Byte (Fase 1)  

---

## 1. Introducción

El presente manual tiene como objetivo guiar a los usuarios en el uso del sistema experto **Doctor Byte**. Esta herramienta ha sido desarrollada para automatizar el diagnóstico preliminar de fallas comunes en equipos de cómputo. Mediante una interfaz web intuitiva, el sistema permite seleccionar síntomas, obtener un diagnóstico con recomendaciones técnicas y recibir notificaciones automáticas a través de Telegram.

## 2. Requisitos Previos

Para utilizar el sistema de manera correcta, se requiere:
*   Un navegador web moderno y actualizado (Google Chrome, Mozilla Firefox, Microsoft Edge).
*   Conexión estable a Internet.
*   (Opcional pero recomendado) Una cuenta activa de Telegram para recibir notificaciones personalizadas del diagnóstico.

## 3. Acceso al Sistema

1. Abra su navegador web.
2. Ingrese la dirección URL proporcionada por el administrador del sistema o acceda a través del enlace de despliegue (localhost o dominio en la nube).
3. Se mostrará la pantalla principal de la aplicación con el panel de diagnóstico.

---

## 4. Guía de Uso Paso a Paso

### 4.1. Realizar un Diagnóstico

Esta es la función principal del sistema. Siga estos pasos para obtener un diagnóstico:

1. **Selección de Síntomas:** En la pantalla principal, encontrará una lista de síntomas comunes (por ejemplo: "pantalla azul", "equipo no enciende", "sobrecalentamiento"). Marque con un clic todas las casillas (checkboxes) que describan el problema que presenta su equipo.
2. **Identificación (Opcional):** En el campo de texto etiquetado como "Usuario de Telegram", ingrese su nombre de usuario de Telegram (incluyendo el símbolo @, por ejemplo: @JuanPerez). Si deja este campo vacío, el diagnóstico se registrará como "Anonimo".
3. **Ejecutar Diagnóstico:** Haga clic en el botón **Diagnosticar**.
4. **Visualización de Resultados:** El sistema procesará la información y mostrará una ventana o tarjeta en pantalla con:
   *   **Falla Detectada:** El nombre técnico del problema probable.
   *   **Recomendación:** Los pasos a seguir para solucionar o mitigar la falla.
5. **Notificación por Telegram:** Si proporcionó un usuario de Telegram válido y el bot está configurado correctamente, recibirá un mensaje con el mismo diagnóstico en su aplicación de mensajería.

![](/Proyecto1/docs/images/Diagnostico.png)
![](/Proyecto1/docs/images/Resultado.png)


### 4.2. Consultar el Historial de Diagnósticos

El sistema mantiene un registro de todas las consultas realizadas para fines de auditoría y seguimiento.

1. Navegue a la sección o pestaña etiquetada como **Historial**.
2. Se mostrará una tabla con los registros más recientes, ordenados del más nuevo al más antiguo.
3. Cada registro muestra:
   *   Fecha y hora del diagnóstico.
   *   Lista de síntomas reportados.
   *   Falla diagnosticada.
   *   Recomendación proporcionada.
   *   Usuario que solicitó el diagnóstico.

![](/Proyecto1/docs/images/Historial.png)

---

## 5. Funcionalidades para Administradores

El sistema incluye un panel de administración para mantener actualizada la base de conocimiento y la configuración del bot. Estas opciones suelen estar protegidas o en una sección separada de la interfaz.

### 5.1. Gestión de la Base de Conocimiento (CRUD)
El administrador puede modificar el conocimiento del sistema experto sin tocar el código fuente:
*   **Síntomas:** Puede agregar nuevos síntomas, eliminar los obsoletos o renombrar existentes (el sistema actualiza automáticamente las reglas asociadas).
*   **Fallas y Recomendaciones:** Puede dar de alta nuevas fallas con sus respectivos ID y textos de recomendación, o eliminarlas (lo que borrará también sus reglas asociadas).
*   **Reglas de Inferencia:** Puede vincular una falla existente con una lista de síntomas requeridos. Por ejemplo, indicar que la "Falla 1" requiere los síntomas "A" y "B".
*   **Guardar Cambios:** Después de realizar modificaciones en memoria, es obligatorio hacer clic en el botón **Guardar en Disco** para persistir los cambios en el archivo del motor lógico.

### 5.2. Configuración del Sistema y Telegram
En la sección de Configuración, el administrador puede:
*   **Token del Bot:** Ingresar o actualizar el token proporcionado por BotFather en Telegram.
*   **IDs de Chat:** Definir el ID del chat grupal de soporte técnico donde se centralizarán las alertas.
*   **Estado del Bot:** Activar o desactivar el envío de notificaciones (valor "true" o "false").
*   **Plantillas de Mensajes:** Editar el formato del texto (soporta HTML básico como negritas) que se enviará en caso de éxito o de fallo en el diagnóstico, utilizando las variables `{falla}`, `{recomendacion}` y `{sintomas}`.

![](/Proyecto1/docs/images/Administrador.png)

---

## 6. Preguntas Frecuentes (FAQ) y Solución de Problemas

**P: Seleccioné síntomas, pero el sistema me dice "Diagnóstico Fallido" o "Desconocida".**  
R: Esto ocurre cuando la combinación de síntomas seleccionados no coincide con ninguna de las reglas de inferencia cargadas en la base de conocimiento. Intente seleccionar solo los síntomas más relevantes o contacte al administrador para agregar una nueva regla.

**P: Ingresé mi usuario de Telegram, pero no recibí la notificación.**  
R: Verifique los siguientes puntos:
1. El nombre de usuario está escrito correctamente (sin espacios).
2. Ha iniciado al menos una vez una conversación con el bot de Telegram (el bot no puede enviar mensajes a usuarios que nunca lo han buscado o iniciado).
3. El administrador ha configurado correctamente el Token del bot y ha activado la opción "BOT_ACTIVO".

**P: ¿Puedo seleccionar un solo síntoma para el diagnóstico?**  
R: Sí. El sistema evaluará si existe alguna regla de falla que requiera únicamente ese síntoma. Sin embargo, proporcionar múltiples síntomas relacionados mejora la precisión del diagnóstico.

**P: Modifiqué una regla, pero al reiniciar la página se perdió.**  
R: Recuerde que los cambios se guardan primero en la memoria del servidor. Debe navegar a la sección de administración y presionar el botón **Guardar Cambios** para escribir la nueva base de conocimiento en el archivo permanente.

