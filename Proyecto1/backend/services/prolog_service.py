from config.database import prolog

def ejecutar_consulta(query_str):
    return list(prolog.query(query_str))