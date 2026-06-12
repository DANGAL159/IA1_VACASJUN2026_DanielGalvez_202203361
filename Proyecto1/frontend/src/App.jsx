import React, { useState, useEffect } from 'react';
import {
  diagnosticarFalla, obtenerConocimiento, guardarConocimientoBD, obtenerHistorial,
  agregarSintoma, eliminarSintoma, actualizarSintoma,
  agregarFalla, eliminarFalla, actualizarFalla,
  agregarRecomendacion, eliminarRecomendacion,
  agregarRegla, eliminarRegla,
  obtenerConfiguracion, actualizarConfiguracion
} from './api/api';
import Toast from './components/Toast';
import './App.css';

const StethoscopeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>;
const SaveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const BellIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

export default function App() {
  const [vistaActiva, setVistaActiva] = useState('diagnostico');
  const [conocimiento, setConocimiento] = useState({ sintomas: [], fallas: [], recomendaciones: [], reglas: [] });
  const [datosHistorial, setDatosHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(() => localStorage.getItem('tema') === 'oscuro');

  // Estado para el Toast
  const [toast, setToast] = useState(null);

  // Estados Diagnostico
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState([]);
  const [resultadoDiagnostico, setResultadoDiagnostico] = useState(null);
  const [usuarioTelegram, setUsuarioTelegram] = useState('');

  // Estados CRUD
  const [nuevoSintoma, setNuevoSintoma] = useState('');
  const [nuevaFalla, setNuevaFalla] = useState('');
  const [fallaSeleccionadaParaRec, setFallaSeleccionadaParaRec] = useState('');
  const [textoRecomendacion, setTextoRecomendacion] = useState('');
  const [fallaSeleccionadaParaRegla, setFallaSeleccionadaParaRegla] = useState('');
  const [sintomasParaRegla, setSintomasParaRegla] = useState([]);

  // Edicion en linea
  const [editandoSintoma, setEditandoSintoma] = useState(null);
  const [editandoFalla, setEditandoFalla] = useState(null);

  // Filtros del historial
  const [filtroHistorial, setFiltroHistorial] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  const [botConfig, setBotConfig] = useState({
    TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '', TELEGRAM_GROUP_ID: '',
    BOT_ACTIVO: 'true', MENSAJE_EXITO: '', MENSAJE_FALLO: ''
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', temaOscuro ? 'oscuro' : 'claro');
    localStorage.setItem('tema', temaOscuro ? 'oscuro' : 'claro');
  }, [temaOscuro]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const cargarDatos = async () => {
    try {
      const data = await obtenerConocimiento();
      setConocimiento(data);
      const hist = await obtenerHistorial();
      setDatosHistorial(hist);

      const configData = await obtenerConfiguracion(); setBotConfig(configData);

    } catch (error) {
      showToast("Error al sincronizar la aplicacion con el servidor.", "error");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const generarNuevoIdFalla = () => {
    if (conocimiento.fallas.length === 0) return 1;
    return Math.max(...conocimiento.fallas.map(f => f.id)) + 1;
  };

  const ejecutarAccionCrud = async (accionPromesa, mensajeExito) => {
    try {
      await accionPromesa;
      showToast(mensajeExito, "success");
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.detail || "Error en la operacion.", "error");
    }
  };

  const ejecutarDiagnostico = async () => {
    if (sintomasSeleccionados.length === 0) {
      return showToast("Seleccione al menos un sintoma para realizar el diagnostico.", "warning");
    }
    setLoading(true);
    try {
      const resultado = await diagnosticarFalla(sintomasSeleccionados, usuarioTelegram);
      setResultadoDiagnostico(resultado);
      const hist = await obtenerHistorial();
      setDatosHistorial(hist);
      showToast("Diagnostico completado con exito.", "success");
    } catch (error) {
      showToast("Error al procesar el diagnostico.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar historial
  const historialFiltrado = datosHistorial.filter(reg => {
    const coincideFalla = filtroHistorial === '' || reg.falla.toLowerCase().includes(filtroHistorial.toLowerCase());
    const coincideUsuario = filtroUsuario === '' || reg.usuario.toLowerCase().includes(filtroUsuario.toLowerCase());
    return coincideFalla && coincideUsuario;
  });

  // Estadisticas del historial
  const totalDiagnosticos = datosHistorial.length;
  const diagnosticosExitosos = datosHistorial.filter(r => r.falla !== 'Desconocida').length;
  const usuariosUnicos = new Set(datosHistorial.map(r => r.usuario)).size;

  return (
    <div className="app-container">
      {/* Componente Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="app-header">
        <div className="header-top">
          <div className="header-title">
            <StethoscopeIcon />
            <h1>Doctor Byte</h1>
          </div>
          <button className="theme-toggle" onClick={() => setTemaOscuro(!temaOscuro)} title="Cambiar tema">
            {temaOscuro ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        <p>Sistema Experto de Diagnostico Informatico</p>
        <div className="tabs">
          <button className={`tab-btn ${vistaActiva === 'diagnostico' ? 'active' : ''}`} onClick={() => setVistaActiva('diagnostico')}>Diagnostico</button>
          <button className={`tab-btn ${vistaActiva === 'historial' ? 'active' : ''}`} onClick={() => setVistaActiva('historial')}>
            <HistoryIcon /> Historial
          </button>
          <button className={`tab-btn ${vistaActiva === 'admin' ? 'active' : ''}`} onClick={() => setVistaActiva('admin')}>Administracion</button>
        </div>
      </header>

      <main className="app-main">

        {/* ================= VISTA DIAGNOSTICO ================= */}
        {vistaActiva === 'diagnostico' && (
          <div className="diagnostico-view">
            <h2>Cuales problemas presenta su equipo?</h2>

            {conocimiento.sintomas.length === 0 ? (
              <div className="empty-list">No hay sintomas registrados. Agregue sintomas desde la seccion de Administracion.</div>
            ) : (
              <div className="sintomas-grid">
                {conocimiento.sintomas.map((s, idx) => (
                  <label key={idx} className="sintoma-card">
                    <input type="checkbox" checked={sintomasSeleccionados.includes(s.nombre)} onChange={() => {
                      setSintomasSeleccionados(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre]);
                    }} />
                    <span style={{ textTransform: 'capitalize' }}>{s.nombre}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="form-group" style={{ margin: '20px auto', maxWidth: '400px' }}>
              <label>Enviar copia a mi Telegram (Opcional):</label>
              <input className="form-input" placeholder="@tu_usuario" value={usuarioTelegram} onChange={e => setUsuarioTelegram(e.target.value)} />
              <small>Inicie el bot primero en Telegram para recibir el mensaje.</small>
            </div>

            <div className="acciones-diagnostico">
              <button className="btn btn-primary" onClick={ejecutarDiagnostico} disabled={loading}>
                {loading ? 'Analizando...' : 'Diagnosticar Equipo'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setSintomasSeleccionados([]); setResultadoDiagnostico(null); }}>Limpiar</button>
            </div>

            {resultadoDiagnostico && (
              <div className={`resultado-box ${resultadoDiagnostico.falla_id ? 'success' : 'warning'}`}>
                <h3>Resultados del Diagnostico</h3>
                <p><strong>Falla Detectada:</strong> {resultadoDiagnostico.falla}</p>
                <p><strong>Recomendacion:</strong> {resultadoDiagnostico.recomendacion}</p>
                <small className="resultado-notificacion"><BellIcon /> Reporte enviado al soporte tecnico.</small>
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA HISTORIAL ================= */}
        {vistaActiva === 'historial' && (
          <div className="historial-view">
            <div className="historial-header">
              <div>
                <h2>Historial de Diagnosticos</h2>
                <p className="historial-subtitle">Registro de auditoria de todas las consultas realizadas</p>
              </div>
              <button className="btn btn-secondary" onClick={() => {
                cargarDatos();
                showToast("Historial actualizado", "info");
              }} title="Actualizar historial">
                <RefreshIcon /> Actualizar
              </button>
            </div>

            {/* Tarjetas de estadisticas */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{totalDiagnosticos}</div>
                <div className="stat-label">Diagnosticos Totales</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-number">{diagnosticosExitosos}</div>
                <div className="stat-label">Diagnosticos Exitosos</div>
              </div>
              <div className="stat-card stat-info">
                <div className="stat-number">{usuariosUnicos}</div>
                <div className="stat-label">Usuarios Unicos</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="historial-filters">
              <div className="filter-group">
                <label>Buscar por falla:</label>
                <input
                  className="form-input"
                  placeholder="Ej: RAM, disco, pantalla..."
                  value={filtroHistorial}
                  onChange={e => setFiltroHistorial(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Buscar por usuario:</label>
                <input
                  className="form-input"
                  placeholder="Ej: @usuario"
                  value={filtroUsuario}
                  onChange={e => setFiltroUsuario(e.target.value)}
                />
              </div>
              {(filtroHistorial || filtroUsuario) && (
                <button
                  className="btn btn-secondary"
                  onClick={() => { setFiltroHistorial(''); setFiltroUsuario(''); }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Tabla de historial */}
            {historialFiltrado.length === 0 ? (
              <div className="empty-state">
                <HistoryIcon />
                <p>{datosHistorial.length === 0 ? 'No se registran diagnosticos en la base de conocimiento.' : 'No hay resultados que coincidan con los filtros.'}</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha y Hora</th>
                      <th>Usuario</th>
                      <th>Sintomas Evaluados</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialFiltrado.map((reg, idx) => (
                      <tr key={idx}>
                        <td className="td-numero">{idx + 1}</td>
                        <td className="td-fecha">{reg.fecha}</td>
                        <td className="td-usuario">
                          <span className="usuario-badge">{reg.usuario || 'Anonimo'}</span>
                        </td>
                        <td className="td-sintomas">
                          <div className="sintomas-tags">
                            {reg.sintomas.map((s, i) => (
                              <span key={i} className="sintoma-tag">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="td-resultado">
                          <span className={`resultado-badge ${reg.falla === 'Desconocida' ? 'badge-danger' : 'badge-success'}`}>
                            {reg.falla}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA ADMINISTRACION ================= */}
        {vistaActiva === 'admin' && (
          <div className="admin-view">
            <div className="admin-header">
              <h2>Panel de Control (CRUD)</h2>
              <button className="btn btn-success" onClick={() => ejecutarAccionCrud(guardarConocimientoBD(), "Guardado en disco.")}>
                <SaveIcon /> Guardar Cambios en Prolog
              </button>
            </div>

            <div className="crud-grid">
              {/* 1. GESTION DE SINTOMAS */}
              <div className="crud-card">
                <h3>1. Gestion de Sintomas</h3>
                <div className="lista-scroll">
                  {conocimiento.sintomas.length === 0 ? (
                    <div className="empty-list">No hay sintomas registrados</div>
                  ) : (
                    conocimiento.sintomas.map((s, idx) => (
                      <div key={idx} className="list-item">
                        {editandoSintoma?.viejo === s.nombre ? (
                          <div className="list-item-edit">
                            <input
                              className="form-input"
                              value={editandoSintoma.nuevo}
                              onChange={e => setEditandoSintoma({ ...editandoSintoma, nuevo: e.target.value })}
                              autoFocus
                            />
                            <button className="btn btn-primary btn-sm" onClick={() => {
                              ejecutarAccionCrud(actualizarSintoma(editandoSintoma.viejo, editandoSintoma.nuevo.trim().toLowerCase()), "Sintoma actualizado");
                              setEditandoSintoma(null);
                            }}>Ok</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditandoSintoma(null)}>X</button>
                          </div>
                        ) : (
                          <>
                            <span style={{ textTransform: 'capitalize' }}>{s.nombre}</span>
                            <div className="list-item-actions">
                              <button className="btn-icon" title="Editar" onClick={() => setEditandoSintoma({ viejo: s.nombre, nuevo: s.nombre })}>
                                <EditIcon />
                              </button>
                              <button className="btn-icon danger" title="Eliminar" onClick={() => ejecutarAccionCrud(eliminarSintoma(s.nombre), "Sintoma eliminado")}>
                                <TrashIcon />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="form-row mt-3">
                  <input
                    className="form-input"
                    placeholder="Nuevo sintoma (ej: pantalla rota)"
                    value={nuevoSintoma}
                    onChange={e => setNuevoSintoma(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && nuevoSintoma.trim()) {
                        ejecutarAccionCrud(agregarSintoma(nuevoSintoma.trim().toLowerCase()), "Sintoma agregado");
                        setNuevoSintoma('');
                      }
                    }}
                  />
                  <button className="btn btn-primary" onClick={() => {
                    if (nuevoSintoma.trim()) {
                      ejecutarAccionCrud(agregarSintoma(nuevoSintoma.trim().toLowerCase()), "Sintoma agregado");
                      setNuevoSintoma('');
                    } else {
                      showToast("El nombre del sintoma no puede estar vacio", "warning");
                    }
                  }}>Agregar</button>
                </div>
              </div>

              {/* 2. GESTION DE FALLAS */}
              <div className="crud-card">
                <h3>2. Gestion de Fallas</h3>
                <div className="lista-scroll">
                  {conocimiento.fallas.length === 0 ? (
                    <div className="empty-list">No hay fallas registradas</div>
                  ) : (
                    conocimiento.fallas.map((f) => (
                      <div key={f.id} className="list-item">
                        {editandoFalla?.id === f.id ? (
                          <div className="list-item-edit">
                            <input
                              className="form-input"
                              value={editandoFalla.nombre}
                              onChange={e => setEditandoFalla({ ...editandoFalla, nombre: e.target.value })}
                              autoFocus
                            />
                            <button className="btn btn-primary btn-sm" onClick={() => {
                              ejecutarAccionCrud(actualizarFalla(editandoFalla.id, editandoFalla.nombre.trim()), "Falla actualizada");
                              setEditandoFalla(null);
                            }}>Ok</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditandoFalla(null)}>X</button>
                          </div>
                        ) : (
                          <>
                            <span>{f.nombre}</span>
                            <div className="list-item-actions">
                              <button className="btn-icon" title="Editar" onClick={() => setEditandoFalla({ id: f.id, nombre: f.nombre })}>
                                <EditIcon />
                              </button>
                              <button className="btn-icon danger" title="Eliminar" onClick={() => ejecutarAccionCrud(eliminarFalla(f.id), "Falla eliminada")}>
                                <TrashIcon />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="form-row mt-3">
                  <input
                    className="form-input"
                    placeholder="Nombre de la nueva falla"
                    value={nuevaFalla}
                    onChange={e => setNuevaFalla(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && nuevaFalla.trim()) {
                        ejecutarAccionCrud(agregarFalla(generarNuevoIdFalla(), nuevaFalla.trim()), "Falla creada");
                        setNuevaFalla('');
                      }
                    }}
                  />
                  <button className="btn btn-primary" onClick={() => {
                    if (nuevaFalla.trim()) {
                      ejecutarAccionCrud(agregarFalla(generarNuevoIdFalla(), nuevaFalla.trim()), "Falla creada");
                      setNuevaFalla('');
                    } else {
                      showToast("El nombre de la falla no puede estar vacio", "warning");
                    }
                  }}>Crear</button>
                </div>
              </div>

              {/* 3. ASIGNAR RECOMENDACION */}
              <div className="crud-card">
                <h3>3. Asignar Recomendacion</h3>
                <div className="form-group">
                  <select
                    className="form-input"
                    value={fallaSeleccionadaParaRec}
                    onChange={e => {
                      const id = e.target.value;
                      setFallaSeleccionadaParaRec(id);
                      const recExiste = conocimiento.recomendaciones.find(r => r.id === parseInt(id));
                      setTextoRecomendacion(recExiste ? recExiste.texto : '');
                    }}
                  >
                    <option value="">-- Elija una Falla --</option>
                    {conocimiento.fallas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={textoRecomendacion}
                    onChange={e => setTextoRecomendacion(e.target.value)}
                    placeholder="Texto explicativo preventivo o correctivo..."
                  ></textarea>
                  <div className="btn-group">
                    <button className="btn btn-primary" onClick={() => {
                      if (fallaSeleccionadaParaRec && textoRecomendacion.trim()) {
                        ejecutarAccionCrud(agregarRecomendacion(fallaSeleccionadaParaRec, textoRecomendacion.trim()), "Recomendacion guardada exitosamente");
                      } else {
                        showToast("Asegurese de seleccionar una falla e ingresar un texto para la recomendacion", "warning");
                      }
                    }}>Guardar / Actualizar</button>
                    <button className="btn btn-danger" onClick={() => {
                      if (fallaSeleccionadaParaRec) {
                        ejecutarAccionCrud(eliminarRecomendacion(fallaSeleccionadaParaRec), "Recomendacion eliminada");
                        setFallaSeleccionadaParaRec('');
                        setTextoRecomendacion('');
                      } else {
                        showToast("Seleccione una falla para eliminar su recomendacion", "warning");
                      }
                    }}>Eliminar</button>
                  </div>
                </div>
              </div>

              {/* 4. ASIGNAR REGLA LOGICA */}
              <div className="crud-card">
                <h3>4. Asignar Regla Logica</h3>
                <div className="form-group">
                  <select
                    className="form-input"
                    value={fallaSeleccionadaParaRegla}
                    onChange={e => {
                      const id = e.target.value;
                      setFallaSeleccionadaParaRegla(id);
                      const reglaExiste = conocimiento.reglas.find(r => r.id_falla === parseInt(id));
                      setSintomasParaRegla(reglaExiste ? reglaExiste.sintomas : []);
                    }}
                  >
                    <option value="">-- Elija una Falla --</option>
                    {conocimiento.fallas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>

                  <div className="regla-checkbox-list">
                    {conocimiento.sintomas.length === 0 ? (
                      <div className="empty-list">No hay sintomas registrados</div>
                    ) : (
                      conocimiento.sintomas.map((s, idx) => (
                        <label key={idx} className="regla-checkbox-item">
                          <input
                            type="checkbox"
                            checked={sintomasParaRegla.includes(s.nombre)}
                            onChange={() => {
                              setSintomasParaRegla(prev =>
                                prev.includes(s.nombre)
                                  ? prev.filter(x => x !== s.nombre)
                                  : [...prev, s.nombre]
                              );
                            }}
                            disabled={!fallaSeleccionadaParaRegla}
                          />
                          <span>{s.nombre}</span>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="btn-group">
                    <button className="btn btn-primary" onClick={() => {
                      if (fallaSeleccionadaParaRegla && sintomasParaRegla.length > 0) {
                        ejecutarAccionCrud(agregarRegla(fallaSeleccionadaParaRegla, sintomasParaRegla), "Regla logica vinculada con exito");
                      } else {
                        showToast("Seleccione una falla y al menos un sintoma", "warning");
                      }
                    }}>Vincular Sintomas</button>
                    <button className="btn btn-danger" onClick={() => {
                      if (fallaSeleccionadaParaRegla) {
                        ejecutarAccionCrud(eliminarRegla(fallaSeleccionadaParaRegla), "Regla logica eliminada");
                        setSintomasParaRegla([]);
                        setFallaSeleccionadaParaRegla('');
                      } else {
                        showToast("Seleccione una falla para eliminar su regla", "warning");
                      }
                    }}>Eliminar Regla</button>
                  </div>
                </div>
              </div>

              {/* 5. CONFIGURACIÓN DEL SISTEMA (TELEGRAM) */}
              <div className="crud-card" style={{ gridColumn: '1 / -1' }}>
                <h3><SettingsIcon /> 5. Configuración del Sistema (Bot Telegram)</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Columna Izquierda: Credenciales */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={botConfig.BOT_ACTIVO === 'true'}
                        onChange={e => setBotConfig({ ...botConfig, BOT_ACTIVO: e.target.checked ? 'true' : 'false' })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <strong style={{ color: botConfig.BOT_ACTIVO === 'true' ? 'var(--success)' : 'var(--danger)' }}>
                        {botConfig.BOT_ACTIVO === 'true' ? 'BOT ACTIVO (Enviando Mensajes)' : 'BOT DESACTIVADO'}
                      </strong>
                    </label>

                    <label>Token del Bot:</label>
                    <input className="form-input" type="password" value={botConfig.TELEGRAM_BOT_TOKEN} onChange={e => setBotConfig({ ...botConfig, TELEGRAM_BOT_TOKEN: e.target.value })} />

                    <label>Chat ID Admin (Respaldo):</label>
                    <input className="form-input" value={botConfig.TELEGRAM_CHAT_ID} onChange={e => setBotConfig({ ...botConfig, TELEGRAM_CHAT_ID: e.target.value })} />

                    <label>Chat ID Grupo (Auditoría):</label>
                    <input className="form-input" value={botConfig.TELEGRAM_GROUP_ID} onChange={e => setBotConfig({ ...botConfig, TELEGRAM_GROUP_ID: e.target.value })} />
                  </div>

                  {/* Columna Derecha: Mensajes */}
                  <div className="form-group">
                    <label>Plantilla: Diagnóstico Exitoso</label>
                    <small>Variables disponibles: {'{falla}'}, {'{recomendacion}'}, {'{sintomas}'}</small>
                    <textarea className="form-input" rows="4" value={botConfig.MENSAJE_EXITO} onChange={e => setBotConfig({ ...botConfig, MENSAJE_EXITO: e.target.value })}></textarea>

                    <label style={{ marginTop: '10px' }}>Plantilla: Diagnóstico Fallido</label>
                    <small>Variables disponibles: {'{sintomas}'}</small>
                    <textarea className="form-input" rows="3" value={botConfig.MENSAJE_FALLO} onChange={e => setBotConfig({ ...botConfig, MENSAJE_FALLO: e.target.value })}></textarea>
                  </div>
                </div>

                <div className="form-row mt-3" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => ejecutarAccionCrud(actualizarConfiguracion(botConfig), "Configuración de Telegram guardada en .env exitosamente.")}>
                    Guardar Configuración
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}