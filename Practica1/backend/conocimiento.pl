:- dynamic ciudad/1.
:- dynamic conexion/3.

% ==========================================
% HECHOS DINÁMICOS INICIALES
% ==========================================
ciudad('guatemala').
ciudad('el progreso').
ciudad('antigua').
ciudad('chimaltenango').
ciudad('escuintla').
ciudad('santa rosa').
ciudad('solola').
ciudad('totonicapan').
ciudad('quetzaltenango').
ciudad('mazatenango').
ciudad('retalhuleu').
ciudad('san marcos').
ciudad('huehuetenango').
ciudad('quiche').
ciudad('baja verapaz').
ciudad('coban').
ciudad('flores').
ciudad('puerto barrios').
ciudad('zacapa').
ciudad('chiquimula').
ciudad('jalapa').
ciudad('jutiapa').

conexion('guatemala', 'el progreso', 50).
conexion('guatemala', 'antigua', 40).
conexion('guatemala', 'escuintla', 65).
conexion('guatemala', 'baja verapaz', 90).
conexion('guatemala', 'coban', 130).
conexion('guatemala', 'jalapa', 70).
conexion('el progreso', 'zacapa', 90).
conexion('antigua', 'chimaltenango', 25).
conexion('chimaltenango', 'solola', 40).
conexion('chimaltenango', 'quetzaltenango', 80).
conexion('baja verapaz', 'quiche', 60).
conexion('baja verapaz', 'coban', 80).
conexion('solola', 'quiche', 70).
conexion('solola', 'totonicapan', 50).
conexion('totonicapan', 'quetzaltenango', 20).
conexion('totonicapan', 'san marcos', 60).
conexion('quetzaltenango', 'huehuetenango', 100).
conexion('quetzaltenango', 'retalhuleu', 60).
conexion('quetzaltenango', 'san marcos', 40).
conexion('san marcos', 'huehuetenango', 80).
conexion('san marcos', 'retalhuleu', 50).
conexion('retalhuleu', 'mazatenango', 40).
conexion('escuintla', 'mazatenango', 80).
conexion('escuintla', 'santa rosa', 50).
conexion('escuintla', 'jutiapa', 100).
conexion('jalapa', 'escuintla', 100).
conexion('santa rosa', 'jalapa', 60).
conexion('santa rosa', 'jutiapa', 70).
conexion('jutiapa', 'chiquimula', 90).
conexion('jalapa', 'chiquimula', 80).
conexion('jalapa', 'zacapa', 70).
conexion('chiquimula', 'zacapa', 50).
conexion('coban', 'flores', 250).
conexion('coban', 'puerto barrios', 180).


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
