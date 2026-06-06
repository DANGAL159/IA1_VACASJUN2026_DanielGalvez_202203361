from config.database import prolog

def ejecutar_consulta(query_str):
    return list(prolog.query(query_str))

def obtener_todas_las_ciudades():
    return ejecutar_consulta("ciudad(C)")

def obtener_todas_las_conexiones():
    return ejecutar_consulta("conexion(Origen, Destino, Distancia)")

def ejecutar_operacion_crud(query_str):
    # Consumir el generador para que Prolog ejecute el predicado
    list(prolog.query(query_str))