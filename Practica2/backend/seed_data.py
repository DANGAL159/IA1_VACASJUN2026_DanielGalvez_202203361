from config.database import SessionLocal, engine, Base
from models.models import Categoria, PreguntaFAQ

def inicializar_datos():
    db = SessionLocal()
    try:
        # Verificar si ya existen categorias para no duplicar
        if db.query(Categoria).count() > 0:
            print("La base de datos ya contiene información. Omitiendo la carga inicial.")
            return

        print("Cargando categorías y preguntas iniciales...")

        # 1. Crear Categorías
        cat_academico = Categoria(nombre="Academico")
        cat_admin = Categoria(nombre="Administrativo")
        cat_soporte = Categoria(nombre="Soporte Tecnico")
        
        db.add_all([cat_academico, cat_admin, cat_soporte])
        db.commit()

        # 2. Crear las 20 Preguntas
        preguntas_iniciales = [
            PreguntaFAQ(pregunta="Cuando inician las clases", respuesta="Las clases inician el 15 de enero.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Donde veo mis notas", respuesta="Puedes consultar tus notas en la plataforma oficial de la facultad.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Cual es la zona minima", respuesta="La zona minima para tener derecho a examen final es de 36 puntos.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Con cuanto se aprueba", respuesta="Los cursos se aprueban con una nota final minima de 61 puntos.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Como me asigno cursos", respuesta="Las asignaciones se realizan a traves del portal web de control academico.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Que es recuperacion", respuesta="Es una oportunidad adicional si no alcanzas los 61 puntos en primera oportunidad.", categoria_id=cat_academico.id),
            PreguntaFAQ(pregunta="Cuantos creditos para EPS", respuesta="Necesitas tener aprobados al menos 200 creditos academicos para iniciar el tramite.", categoria_id=cat_academico.id),
            
            PreguntaFAQ(pregunta="Requisitos de inscripcion", respuesta="Debes presentar tu DPI, titulo de diversificado y aprobar los examenes basicos.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Cuanto cuesta la matricula", respuesta="La matricula anual basica es de 91 quetzales.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Donde tramito mi carne", respuesta="El carne se tramita en el edificio de Registro y Estadistica.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Horarios de atencion", respuesta="Las ventanillas atienden de lunes a viernes de 8:00 a 16:00 horas.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Como solicito certificacion", respuesta="Debes generar la orden de pago en linea y presentarla en control academico.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Olvide mi PIN", respuesta="Puedes recuperar tu PIN en la opcion de Olvidaste tu contrasena del portal web.", categoria_id=cat_admin.id),
            PreguntaFAQ(pregunta="Como hago equivalencias", respuesta="Debes presentar el pensum certificado y el programa de estudios en la direccion de escuela.", categoria_id=cat_admin.id),

            PreguntaFAQ(pregunta="Como ingreso a UEDI", respuesta="Debes utilizar tu numero de carne y la contrasena asignada por correo.", categoria_id=cat_soporte.id),
            PreguntaFAQ(pregunta="El campus virtual no carga", respuesta="Intenta borrar las cookies de tu navegador o usar una ventana de incognito.", categoria_id=cat_soporte.id),
            PreguntaFAQ(pregunta="Correo institucional", respuesta="Debes solicitarlo en el portal de la facultad en la seccion de servicios estudiantiles.", categoria_id=cat_soporte.id),
            PreguntaFAQ(pregunta="Como conectarse al WiFi", respuesta="Usa la red oficial e ingresa con tus credenciales de correo institucional.", categoria_id=cat_soporte.id),
            PreguntaFAQ(pregunta="Reportar fallas del sistema", respuesta="Envia un correo a soporte de la escuela con capturas de pantalla del error.", categoria_id=cat_soporte.id),
            PreguntaFAQ(pregunta="Software gratuito estudiantes", respuesta="Tienes acceso a Office 365, GitHub Student Pack y licencias de Autodesk con tu correo.", categoria_id=cat_soporte.id)
        ]

        db.add_all(preguntas_iniciales)
        db.commit()
        print("Datos iniciales insertados con éxito.")

    except Exception as e:
        print(f"Ocurrió un error al poblar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inicializar_datos()