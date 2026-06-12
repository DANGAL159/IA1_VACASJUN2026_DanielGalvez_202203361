import React, { useState, useEffect, useRef } from 'react';
import {
  loginAdmin,
  obtenerCategorias, crearCategoria, eliminarCategoria, actualizarCategoria,
  obtenerPreguntas, crearPregunta, actualizarPregunta, eliminarPregunta,
  obtenerConfiguracionBot, actualizarConfiguracionBot,
  obtenerHistorialConsultas, obtenerResumenEstadisticas
} from './api/api';
import Toast from './components/Toast';
import './App.css';

// Iconos SVG
const BotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function App() {
  const [toast, setToast] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('preguntas');

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('smartbot-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smartbot-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Ref para hacer scroll al formulario de preguntas cuando se edita
  const formPreguntaRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ total_consultas: 0, usuarios_unicos: 0 });
  const [configBot, setConfigBot] = useState({ telegram_bot_token: '', telegram_group_id: '', bot_activo: false });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editCategoria, setEditCategoria] = useState(null);
  const [formPregunta, setFormPregunta] = useState({ id: null, pregunta: '', respuesta: '', categoria_id: '' });

  const showToast = (message, type = 'info') => setToast({ message, type });

  const cargarDatosAdmin = async () => {
    try {
      const [cats, faqs, config, hist, stats] = await Promise.all([
        obtenerCategorias(), obtenerPreguntas(), obtenerConfiguracionBot(),
        obtenerHistorialConsultas(), obtenerResumenEstadisticas()
      ]);
      setCategorias(cats); setPreguntas(faqs); setConfigBot(config);
      setHistorial(hist); setEstadisticas(stats);
    } catch (error) {
      showToast("Error al cargar datos del servidor.", "error");
    }
  };

  useEffect(() => { if (isAuthenticated) cargarDatosAdmin(); }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginAdmin(loginForm.username, loginForm.password);
      setIsAuthenticated(true);
      showToast("Sesion iniciada correctamente", "success");
    } catch (error) { showToast("Credenciales incorrectas", "error"); }
  };

  const handleAccion = async (promesa, msjExito) => {
    try {
      await promesa;
      showToast(msjExito, "success");
      cargarDatosAdmin();
    } catch (error) {
      showToast(error.response?.data?.detail || "Error en la operacion", "error");
    }
  };

  // NUEVO: Función para cargar datos en el formulario Y hacer scroll
  const editarPregunta = (p) => {
    setFormPregunta({
      id: p.id,
      pregunta: p.pregunta,
      respuesta: p.respuesta,
      categoria_id: p.categoria_id
    });
    // Scroll suave al formulario para que el usuario vea que está editando
    setTimeout(() => {
      formPreguntaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelarEdicionPregunta = () => {
    setFormPregunta({ id: null, pregunta: '', respuesta: '', categoria_id: '' });
  };

  const guardarPregunta = () => {
    if (!formPregunta.pregunta || !formPregunta.respuesta || !formPregunta.categoria_id) {
      return showToast("Todos los campos son obligatorios", "warning");
    }
    const payload = { ...formPregunta, categoria_id: parseInt(formPregunta.categoria_id) };
    if (formPregunta.id) {
      handleAccion(actualizarPregunta(formPregunta.id, payload), "Pregunta actualizada");
    } else {
      handleAccion(crearPregunta(payload), "Pregunta creada");
    }
    setFormPregunta({ id: null, pregunta: '', respuesta: '', categoria_id: '' });
  };

  const formatearFecha = (fechaISO) => {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaISO).toLocaleDateString('es-GT', opciones);
  };

  // Variables para el estilo dinámico del formulario según el modo
  const esModoEdicion = !!formPregunta.id;
  const formBoxStyle = {
    marginBottom: '24px',
    padding: '20px',
    borderRadius: 'var(--radius)',
    background: esModoEdicion ? 'var(--warning-soft)' : 'var(--bg-muted)',
    borderLeft: `4px solid ${esModoEdicion ? 'var(--warning)' : 'var(--primary)'}`,
    transition: 'background 0.25s ease, border-color 0.25s ease'
  };

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <div className="crud-card" style={{ maxWidth: '420px', width: '100%', marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <BotIcon /> SmartBot Login
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Acceso al panel administrativo</p>
          <form onSubmit={handleLogin} className="form-group">
            <div>
              <label>Usuario</label>
              <input className="form-input" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
            </div>
            <div>
              <label>Contraseña</label>
              <input className="form-input" type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Ingresar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="app-header">
        <div className="header-top">
          <div>
            <div className="header-title"><BotIcon /><h1>SmartBot</h1></div>
            <p>Panel Administrativo - Gestion de Conocimiento</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>
        </div>
        <div className="tabs">
          <button className={`tab-btn ${vistaActiva === 'preguntas' ? 'active' : ''}`} onClick={() => setVistaActiva('preguntas')}>Preguntas FAQ</button>
          <button className={`tab-btn ${vistaActiva === 'categorias' ? 'active' : ''}`} onClick={() => setVistaActiva('categorias')}>Categorias</button>
          <button className={`tab-btn ${vistaActiva === 'config' ? 'active' : ''}`} onClick={() => setVistaActiva('config')}>Configuracion</button>
          <button className={`tab-btn ${vistaActiva === 'historial' ? 'active' : ''}`} onClick={() => setVistaActiva('historial')}>Auditoria</button>
        </div>
      </header>

      <main className="app-main">
        {vistaActiva === 'preguntas' && (
          <div className="crud-grid">
            <div className="crud-card">
              {/* TÍTULO DINÁMICO: cambia según si estamos creando o editando */}
              <h3 className="form-title">
                {esModoEdicion ? (
                  <>
                    <EditIcon />
                    <span>Editar Pregunta</span>
                    <span className="mode-badge mode-edit">
                      #{formPregunta.id}
                    </span>
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    <span>Nueva Pregunta</span>
                    <span className="mode-badge mode-create">Crear</span>
                  </>
                )}
              </h3>

              {/* FORMULARIO CON ESTILO DINÁMICO Y REF PARA SCROLL */}
              <div className="form-group" style={formBoxStyle} ref={formPreguntaRef}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label>Categoria</label>
                    <select className="form-input" value={formPregunta.categoria_id} onChange={e => setFormPregunta({ ...formPregunta, categoria_id: e.target.value })}>
                      <option value="">-- Seleccionar Categoria --</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Pregunta del Usuario</label>
                    <input className="form-input" value={formPregunta.pregunta} onChange={e => setFormPregunta({ ...formPregunta, pregunta: e.target.value })} placeholder="Ej: Cuales son los requisitos?" />
                  </div>
                </div>
                <div>
                  <label>Respuesta del Bot</label>
                  <textarea className="form-input" rows="3" value={formPregunta.respuesta} onChange={e => setFormPregunta({ ...formPregunta, respuesta: e.target.value })} placeholder="Escriba la respuesta detallada..."></textarea>
                </div>
                <div className="form-row" style={{ justifyContent: 'flex-end' }}>
                  {esModoEdicion && (
                    <button className="btn btn-secondary" onClick={cancelarEdicionPregunta}>
                      Cancelar Edicion
                    </button>
                  )}
                  <button className={`btn ${esModoEdicion ? 'btn-warning' : 'btn-primary'}`} onClick={guardarPregunta}>
                    {esModoEdicion ? 'Guardar Cambios' : 'Crear Pregunta'}
                  </button>
                </div>
              </div>

              <h3>Listado de Preguntas</h3>
              <div className="table-container">
                <table className="historial-table">
                  <thead>
                    <tr><th>ID</th><th>Categoria</th><th>Pregunta</th><th>Respuesta</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {preguntas.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No hay preguntas registradas</td></tr>
                    )}
                    {preguntas.map(p => (
                      <tr key={p.id} className={formPregunta.id === p.id ? 'tr-editing' : ''}>
                        <td className="td-numero">{p.id}</td>
                        <td><span className="usuario-badge">{p.categoria_nombre}</span></td>
                        <td>{p.pregunta}</td>
                        <td><div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.respuesta}</div></td>
                        <td>
                          <div className="list-item-actions">
                            <button
                              className="btn-icon"
                              onClick={() => editarPregunta(p)}
                              title="Editar pregunta"
                            >
                              <EditIcon />
                            </button>
                            <button className="btn-icon danger" onClick={() => handleAccion(eliminarPregunta(p.id), "Pregunta eliminada")}><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'categorias' && (
          <div className="crud-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3>Gestion de Categorias</h3>
            <div className="form-row" style={{ marginBottom: '20px' }}>
              <input className="form-input" placeholder="Nueva categoria (Ej: Horarios, Requisitos)" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => {
                if (nuevaCategoria.trim()) { handleAccion(crearCategoria(nuevaCategoria.trim()), "Categoria creada"); setNuevaCategoria(''); }
              }}>Agregar</button>
            </div>
            <div className="lista-scroll">
              {categorias.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay categorias registradas</div>}
              {categorias.map(c => (
                <div key={c.id} className="list-item">
                  {editCategoria?.id === c.id ? (
                    <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
                      <input className="form-input" value={editCategoria.nombre} onChange={e => setEditCategoria({ ...editCategoria, nombre: e.target.value })} style={{ flex: 1, padding: '4px 8px' }} autoFocus />
                      <button className="btn btn-primary btn-sm" onClick={() => { handleAccion(actualizarCategoria(c.id, editCategoria.nombre), "Categoria actualizada"); setEditCategoria(null); }}>Ok</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditCategoria(null)}>X</button>
                    </div>
                  ) : (
                    <>
                      <span>{c.nombre}</span>
                      <div className="list-item-actions">
                        <button className="btn-icon" onClick={() => setEditCategoria({ id: c.id, nombre: c.nombre })}><EditIcon /></button>
                        <button className="btn-icon danger" onClick={() => handleAccion(eliminarCategoria(c.id), "Categoria eliminada")}><TrashIcon /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {vistaActiva === 'config' && (
          <div className="crud-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3>Configuracion del Bot de Telegram</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: configBot.bot_activo ? 'var(--success-soft)' : 'var(--danger-soft)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="checkbox" checked={configBot.bot_activo} onChange={e => setConfigBot({ ...configBot, bot_activo: e.target.checked })} />
                <strong style={{ color: configBot.bot_activo ? 'var(--success)' : 'var(--danger)', fontSize: '14px' }}>
                  {configBot.bot_activo ? 'BOT ACTIVO — Escuchando mensajes' : 'BOT APAGADO'}
                </strong>
              </label>
              <div>
                <label>Token del Bot de Telegram</label>
                <input className="form-input" type="password" value={configBot.telegram_bot_token} onChange={e => setConfigBot({ ...configBot, telegram_bot_token: e.target.value })} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
              </div>
              <div>
                <label>ID del Grupo de Respaldo (Opcional)</label>
                <input className="form-input" value={configBot.telegram_group_id} onChange={e => setConfigBot({ ...configBot, telegram_group_id: e.target.value })} placeholder="-1001234567890" />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                  ID numerico del grupo donde se respaldaran las consultas. El bot debe estar agregado al grupo.
                </p>
              </div>
              <div className="form-row" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-primary" onClick={() => handleAccion(actualizarConfiguracionBot(configBot), "Configuracion guardada")}>Guardar Configuracion</button>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'historial' && (
          <div className="historial-view">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{estadisticas.total_consultas}</div>
                <div className="stat-label">Consultas Totales</div>
              </div>
              <div className="stat-card stat-info">
                <div className="stat-number">{estadisticas.usuarios_unicos}</div>
                <div className="stat-label">Usuarios Unicos</div>
              </div>
            </div>

            <div className="crud-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Ultimas Consultas Registradas</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => { cargarDatosAdmin(); showToast("Auditoria actualizada", "info"); }}>
                  <RefreshIcon /> Actualizar Historial
                </button>
              </div>

              <div className="table-container">
                <table className="historial-table">
                  <thead><tr><th>Fecha</th><th>Usuario</th><th>Consulta</th><th>Respuesta</th></tr></thead>
                  <tbody>
                    {historial.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No hay consultas registradas</td></tr>
                    )}
                    {historial.map(h => (
                      <tr key={h.id}>
                        <td className="td-fecha" style={{ whiteSpace: 'nowrap' }}>{formatearFecha(h.fecha_hora)}</td>
                        <td className="td-usuario"><span className="usuario-badge">@{h.usuario_telegram}</span></td>
                        <td>{h.consulta_realizada}</td>
                        <td><div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.respuesta_proporcionada}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}