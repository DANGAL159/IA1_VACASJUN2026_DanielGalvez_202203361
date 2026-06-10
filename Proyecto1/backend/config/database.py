from pyswip import Prolog

prolog = Prolog()

def iniciar_prolog():
    try:
        prolog.consult("doctor_byte.pl")
        print("Base de conocimiento de Doctor Byte cargada exitosamente.")
    except Exception as e:
        print(f"Error al cargar doctor_byte.pl: {e}")

def to_str(val):
    if isinstance(val, bytes):
        return val.decode('utf-8')
    return str(val)

# Función de seguridad para evitar que Prolog crashee el servidor FastAPI
def obtener_datos_seguro(query_str):
    try:
        return list(prolog.query(query_str))
    except Exception as e:
        print(f"Aviso: No se pudo ejecutar '{query_str}'. Retornando vacio.")
        return []

def guardar_base_conocimiento():
    # Usamos la función segura para evitar el existence_error
    sintomas = obtener_datos_seguro("sintoma(S)")
    fallas = obtener_datos_seguro("falla(ID, Nombre)")
    recomendaciones = obtener_datos_seguro("recomendacion(ID, Texto)")
    reglas = obtener_datos_seguro("regla_falla(ID, Sintomas)")
    historiales = obtener_datos_seguro("historial(Fecha, Sintomas, Falla, Rec, Usuario)")
    
    REGLAS_FIJAS = """
% ==========================================
% 5. MOTOR DE INFERENCIA
% ==========================================
subconjunto([], _).
subconjunto([H|T], Lista) :- member(H, Lista), subconjunto(T, Lista).

diagnosticar(SintomasUsuario, FallaID, NombreFalla, Rec) :-
    regla_falla(FallaID, SintomasRequeridos),
    subconjunto(SintomasRequeridos, SintomasUsuario),
    falla(FallaID, NombreFalla),
    recomendacion(FallaID, Rec),
    !. 

% ==========================================
% 6. LÓGICA CRUD GESTIONADA POR PROLOG
% ==========================================
agregar_sintoma(S) :- \+ sintoma(S), assertz(sintoma(S)).
eliminar_sintoma(S) :- retractall(sintoma(S)).

agregar_falla(ID, Nombre) :- \+ falla(ID, _), assertz(falla(ID, Nombre)).
eliminar_falla(ID) :- 
    retractall(falla(ID, _)), 
    retractall(recomendacion(ID, _)), 
    retractall(regla_falla(ID, _)).

agregar_recomendacion(ID, Rec) :- retractall(recomendacion(ID, _)), assertz(recomendacion(ID, Rec)).
eliminar_recomendacion(ID) :- retractall(recomendacion(ID, _)).

agregar_regla_falla(ID, ListaSintomas) :- retractall(regla_falla(ID, _)), assertz(regla_falla(ID, ListaSintomas)).
eliminar_regla_falla(ID) :- retractall(regla_falla(ID, _)).
"""

    try:
        with open("doctor_byte.pl", "w", encoding="utf-8") as file:
            file.write(":- dynamic sintoma/1.\n:- dynamic falla/2.\n:- dynamic recomendacion/2.\n:- dynamic regla_falla/2.\n:- dynamic historial/5.\n\n")
            
            file.write("% --- SINTOMAS ---\n")
            for s in sintomas: 
                file.write(f"sintoma('{to_str(s['S'])}').\n")
            
            file.write("\n% --- FALLAS ---\n")
            for f in fallas: 
                file.write(f"falla({f['ID']}, '{to_str(f['Nombre'])}').\n")
            
            file.write("\n% --- RECOMENDACIONES ---\n")
            for r in recomendaciones: 
                file.write(f"recomendacion({r['ID']}, '{to_str(r['Texto'])}').\n")
            
            file.write("\n% --- REGLAS DE FALLA ---\n")
            for rg in reglas:
                lista_str = [to_str(x) for x in rg['Sintomas']]
                lista_prolog = "[" + ", ".join(f"'{x}'" for x in lista_str) + "]"
                file.write(f"regla_falla({rg['ID']}, {lista_prolog}).\n")
                
            file.write("\n% --- HISTORIAL DE DIAGNOSTICOS ---\n")
            for h in historiales:
                lista_sintomas = [to_str(x) for x in h['Sintomas']]
                lista_prolog = "[" + ", ".join(f"'{x}'" for x in lista_sintomas) + "]"
                file.write(f"historial('{to_str(h['Fecha'])}', {lista_prolog}, '{to_str(h['Falla'])}', '{to_str(h['Rec'])}', '{to_str(h['Usuario'])}').\n")
            
            file.write(REGLAS_FIJAS)
        return True
    except Exception as e:
        print(f"Error escribiendo el archivo: {e}")
        return False