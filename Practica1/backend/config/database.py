from pyswip import Prolog

prolog = Prolog()

def iniciar_prolog():
    try:
        prolog.consult("conocimiento.pl")
        print("Base de conocimiento cargada exitosamente.")
    except Exception as e:
        print(f"Error al cargar conocimiento.pl: {e}")

def guardar_base_conocimiento():
    # Extraer los hechos actuales de la memoria
    ciudades = list(prolog.query("ciudad(C)"))
    conexiones = list(prolog.query("conexion(O, D, Dist)"))
    
    # Constante con todas las reglas que jamás debe ser alterada
    REGLAS_FIJAS = """
% ==========================================
% REGLAS DE CONEXIÓN Y BÚSQUEDA
% ==========================================
conectado(X, Y, D) :- conexion(X, Y, D).
conectado(X, Y, D) :- conexion(Y, X, D).

ruta(Origen, Destino, Ruta, Distancia) :-
    ruta_aux(Origen, Destino, [Origen], RutaInvertida, 0, Distancia),
    reverse(RutaInvertida, Ruta).

ruta_aux(Destino, Destino, Visitados, Visitados, Distancia, Distancia).
ruta_aux(Actual, Destino, Visitados, Ruta, DistActual, DistTotal) :-
    conectado(Actual, Siguiente, Dist),
    \+ member(Siguiente, Visitados),
    NuevaDist is DistActual + Dist,
    ruta_aux(Siguiente, Destino, [Siguiente|Visitados], Ruta, NuevaDist, DistTotal).

ruta_mas_corta(Origen, Destino, MejorRuta, MenorDistancia) :-
    findall([Dist, R], ruta(Origen, Destino, R, Dist), TodasLasRutas),
    sort(TodasLasRutas, [[MenorDistancia, MejorRuta] | _]).

% ==========================================
% LÓGICA CRUD GESTIONADA POR PROLOG
% ==========================================
agregar_ciudad(C) :- \+ ciudad(C), assertz(ciudad(C)).

eliminar_ciudad(C) :- 
    retractall(ciudad(C)),
    retractall(conexion(C, _, _)),
    retractall(conexion(_, C, _)).

actualizar_distancia(O, D, NuevaD) :- 
    retractall(conexion(O, D, _)), 
    retractall(conexion(D, O, _)), 
    assertz(conexion(O, D, NuevaD)).

eliminar_conexion(O, D) :- 
    retractall(conexion(O, D, _)), 
    retractall(conexion(D, O, _)).
"""

    # Reescribir el archivo completo
    try:
        with open("conocimiento.pl", "w", encoding="utf-8") as file:
            file.write(":- dynamic ciudad/1.\n")
            file.write(":- dynamic conexion/3.\n\n")
            file.write("% ==========================================\n")
            file.write("% HECHOS DINÁMICOS INICIALES\n")
            file.write("% ==========================================\n")
            
            for c in ciudades:
                file.write(f"ciudad('{c['C']}').\n")
            file.write("\n")
            
            for conn in conexiones:
                file.write(f"conexion('{conn['O']}', '{conn['D']}', {conn['Dist']}).\n")
            file.write("\n")
            
            file.write(REGLAS_FIJAS)
            
        return True
    except Exception as e:
        print(f"Error escribiendo el archivo: {e}")
        return False