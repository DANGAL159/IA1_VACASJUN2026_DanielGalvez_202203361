:- dynamic sintoma/1.
:- dynamic falla/2.
:- dynamic recomendacion/2.
:- dynamic regla_falla/2.
:- dynamic historial/5.

% --- SINTOMAS ---
sintoma('sobrecalentamiento').
sintoma('pantalla azul').
sintoma('usb no reconocido').
sintoma('fecha hora desconfigurada').
sintoma('ventilador muy ruidoso').
sintoma('equipo no enciende').
sintoma('pitidos cortos al arrancar').
sintoma('lentitud extrema').
sintoma('reinicios inesperados').
sintoma('ruidos extranos disco').
sintoma('no hay conexion red').
sintoma('sistema operativo no inicia').
sintoma('pantalla negra sin cursor').
sintoma('artifacts en pantalla').
sintoma('bateria no carga').
sintoma('teclado no responde').

% --- FALLAS ---
falla(1, 'Falla en la Memoria RAM').
falla(2, 'Falla en la Fuente de Poder').
falla(3, 'Falla en el Disco Duro').
falla(4, 'Falla en la Tarjeta de Video').
falla(5, 'Falla en la Bateria CMOS').
falla(6, 'Sistema Operativo Corrupto').
falla(7, 'Falla de Temperatura por Suciedad').
falla(8, 'Falla en la Tarjeta de Red').
falla(9, 'Falla en Controladora USB').
falla(10, 'Falla en la Bateria del Portatil').

% --- RECOMENDACIONES ---
recomendacion(1, 'Limpiar los contactos de la memoria RAM con goma de borrar y probar en otro slot. Si falla, reemplazar el modulo.').
recomendacion(2, 'Revisar cables de alimentacion y probar con un multimetro. Si no hay voltaje, cambiar la fuente de poder.').
recomendacion(3, 'Respaldar la informacion inmediatamente y reemplazar el disco por una unidad de estado solido (SSD).').
recomendacion(4, 'Reinstalar controladores graficos en modo seguro. Si persiste, revisar conexiones PCI o reemplazar la tarjeta.').
recomendacion(5, 'Reemplazar la bateria plana CR2032 de la placa base y reconfigurar la fecha en la BIOS.').
recomendacion(6, 'Reparar el inicio de Windows con una unidad USB booteable o realizar una instalacion limpia del sistema.').
recomendacion(7, 'Limpiar los ventiladores, remover el polvo interno y reemplazar la pasta termica del procesador.').
recomendacion(8, 'Reinstalar drivers de red o probar con un adaptador de red inalambrico USB.').
recomendacion(9, 'Actualizar los controladores del chipset desde la pagina del fabricante del equipo.').
recomendacion(10, 'Reemplazar la bateria por una original o compatible certificada para su modelo.').

% --- REGLAS DE FALLA ---
regla_falla(9, ['usb no reconocido']).
regla_falla(5, ['fecha hora desconfigurada']).
regla_falla(2, ['equipo no enciende']).
regla_falla(1, ['pantalla azul', 'pitidos cortos al arrancar']).
regla_falla(7, ['sobrecalentamiento', 'ventilador muy ruidoso', 'reinicios inesperados']).
regla_falla(3, ['ruidos extranos disco', 'lentitud extrema']).
regla_falla(8, ['no hay conexion red']).
regla_falla(6, ['sistema operativo no inicia', 'pantalla azul']).
regla_falla(4, ['artifacts en pantalla', 'pantalla negra sin cursor']).
regla_falla(10, ['bateria no carga']).

% --- HISTORIAL DE DIAGNOSTICOS ---
historial('2026-06-11 19:51:57', ['pantalla azul', 'pitidos cortos al arrancar'], 'Falla en la Memoria RAM', 'Limpiar los contactos de la memoria RAM con goma de borrar y probar en otro slot. Si falla, reemplazar el modulo.', 'Anonimo').
historial('2026-06-11 19:52:44', ['equipo no enciende'], 'Falla en la Fuente de Poder', 'Revisar cables de alimentacion y probar con un multimetro. Si no hay voltaje, cambiar la fuente de poder.', 'Anonimo').
historial('2026-06-11 19:56:24', ['no hay conexion red'], 'Falla en la Tarjeta de Red', 'Reinstalar drivers de red o probar con un adaptador de red inalambrico USB.', '@Light34T').
historial('2026-06-11 18:48:09', ['pitidos cortos al arrancar', 'pantalla azul'], 'Falla en la Memoria RAM', 'Limpiar los contactos de la memoria RAM con goma de borrar y probar en otro slot. Si falla, reemplazar el modulo.', 'Anonimo').
historial('2026-06-11 18:48:46', ['no hay conexion red'], 'Falla en la Tarjeta de Red', 'Reinstalar drivers de red o probar con un adaptador de red inalambrico USB.', 'Anonimo').
historial('2026-06-11 19:01:47', ['no hay conexion red', 'ruidos extranos disco', 'reinicios inesperados', 'pantalla negra sin cursor', 'artifacts en pantalla', 'bateria no carga', 'teclado no responde', 'sistema operativo no inicia', 'lentitud extrema'], 'Falla en el Disco Duro', 'Respaldar la informacion inmediatamente y reemplazar el disco por una unidad de estado solido (SSD).', 'Anonimo').
historial('2026-06-11 19:02:12', ['sistema operativo no inicia', 'no hay conexion red', 'ruidos extranos disco', 'reinicios inesperados', 'pantalla negra sin cursor', 'artifacts en pantalla', 'bateria no carga', 'teclado no responde'], 'Falla en la Tarjeta de Red', 'Reinstalar drivers de red o probar con un adaptador de red inalambrico USB.', 'Anonimo').
historial('2026-06-11 01:05:07', ['pantalla azul', 'pitidos cortos al arrancar'], 'Falla en la Memoria RAM', 'Limpiar los contactos de la memoria RAM con goma de borrar y probar en otro slot. Si falla, reemplazar el modulo.', 'Anonimo').
historial('2026-06-11 01:06:17', ['pantalla azul', 'pitidos cortos al arrancar'], 'Falla en la Memoria RAM', 'Limpiar los contactos de la memoria RAM con goma de borrar y probar en otro slot. Si falla, reemplazar el modulo.', 'Anonimo').
historial('2026-06-11 01:06:49', ['ruidos extranos disco'], 'Desconocida', 'No se pudo determinar una falla exacta. Se requiere revision manual.', 'Anonimo').
historial('2026-06-11 01:07:44', ['ruidos extranos disco'], 'Desconocida', 'No se pudo determinar una falla exacta. Se requiere revision manual.', 'Anonimo').
historial('2026-06-11 01:09:35', ['sintoma-nose'], 'falla-nose', 'gran vida a los gatos', 'Anonimo').

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
