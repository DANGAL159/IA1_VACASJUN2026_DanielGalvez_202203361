import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';
import Toast from './components/Toast';
import './App.css';

const API_URL = 'http://127.0.0.1:8000';

const nodeWidth = 180;
const nodeHeight = 40;

// Motor gráfico blindado: NUNCA colapsará aunque falten datos
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  try {
    if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

    // 1. Registrar nodos
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // 2. Registrar aristas SOLO si ambos nodos existen (Evita el crash de Dagre)
    edges.forEach((edge) => {
      if (nodes.some(n => n.id === edge.source) && nodes.some(n => n.id === edge.target)) {
        dagreGraph.setEdge(edge.source, edge.target);
      }
    });

    dagre.layout(dagreGraph);

    // 3. Asignar posiciones de forma segura
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      // Si Dagre falla al posicionar un nodo, le damos una posición por defecto (0,0) en lugar de colapsar
      if (!nodeWithPosition) {
        return { ...node, position: { x: 0, y: 0 } };
      }

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error("Error en Dagre, aplicando diseño de respaldo:", error);
    // Diseño de respaldo en cuadrícula para mantener la app viva
    const fallbackNodes = nodes.map((node, i) => ({
      ...node,
      position: { x: (i % 4) * 200, y: Math.floor(i / 4) * 100 }
    }));
    return { nodes: fallbackNodes, edges };
  }
};

// Iconos SVG simples
const Icons = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  map: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  route: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></svg>,
};

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Estados Búsqueda
  const [origenBusqueda, setOrigenBusqueda] = useState('');
  const [destinoBusqueda, setDestinoBusqueda] = useState('');
  const [resultado, setResultado] = useState(null);
  const [todasLasRutas, setTodasLasRutas] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeRouteIndex, setActiveRouteIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados CRUD
  const [nuevaCiudad, setNuevaCiudad] = useState('');
  const [ciudadEliminar, setCiudadEliminar] = useState('');
  const [nuevaConexion, setNuevaConexion] = useState({ origen: '', destino: '', distancia: '' });
  const [actConexion, setActConexion] = useState({ origen: '', destino: '', distancia: '' });
  const [elimConexion, setElimConexion] = useState({ origen: '', destino: '' });

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const validarCiudades = (origen, destino) => {
    const origenExiste = nodes.some(n => n.id.toLowerCase() === origen.trim().toLowerCase());
    const destinoExiste = nodes.some(n => n.id.toLowerCase() === destino.trim().toLowerCase());

    if (!origenExiste || !destinoExiste) {
      showToast("Una o ambas ciudades no existen en el grafo.", "error");
      return false;
    }
    return true;
  };

  const limpiarBusqueda = () => {
    setOrigenBusqueda('');
    setDestinoBusqueda('');
    setResultado(null);
    setTodasLasRutas(null);
    setEstadisticas(null);
    setActiveRouteIndex(null);

    setEdges((eds) => eds.map(edge => ({
      ...edge,
      animated: false,
      style: { stroke: 'var(--text-muted)', strokeWidth: 1 }
    })));
    showToast("Búsqueda reiniciada", "info");
  };

  // --- OBTENER DATOS CON SEGURIDAD ---
  const cargarGrafo = async () => {
    try {
      const response = await axios.get(`${API_URL}/grafo/`);
      const ciudades = response.data?.ciudades || [];
      const conexiones = response.data?.conexiones || [];

      // Mapeo seguro de nodos (Ignorar valores vacíos)
      const uniqueNodesMap = new Map();
      ciudades.forEach(c => {
        if (!c.C) return;
        const id = String(c.C).toLowerCase().trim();
        uniqueNodesMap.set(id, {
          id: id,
          data: { label: String(c.C).toUpperCase() }
        });
      });
      const mappedNodes = Array.from(uniqueNodesMap.values());

      // Mapeo seguro de conexiones (Solo nodos que existen en uniqueNodesMap)
      const validEdges = conexiones
        .filter(conn => uniqueNodesMap.has(String(conn.Origen).toLowerCase().trim()) && uniqueNodesMap.has(String(conn.Destino).toLowerCase().trim()))
        .map((conn, index) => ({
          id: `e-${conn.Origen}-${conn.Destino}-${index}`,
          source: String(conn.Origen).toLowerCase().trim(),
          target: String(conn.Destino).toLowerCase().trim(),
          label: `${conn.Distancia} km`,
          animated: false,
          style: { stroke: 'var(--text-muted)', strokeWidth: 1 }
        }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mappedNodes, validEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      if (reactFlowInstance) {
        setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 100);
      }
    } catch (error) {
      showToast("Error al cargar el grafo. Verifica el servidor.", "error");
    }
  };

  useEffect(() => {
    cargarGrafo();
  }, [reactFlowInstance]); // Se carga de nuevo al inicializar el lienzo

  // --- BÚSQUEDA DE RUTAS ---
  const buscarRutaCorta = async (e) => {
    e.preventDefault();
    if (!validarCiudades(origenBusqueda, destinoBusqueda)) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rutas/optima`, {
        params: { origen: origenBusqueda, destino: destinoBusqueda }
      });

      const { ruta, distancia_total } = response.data;
      setResultado({ tipo: 'corta', ruta, distancia_total });
      setTodasLasRutas(null);
      setActiveRouteIndex(null);
      resaltarRuta(ruta);
      showToast("Ruta óptima encontrada", "success");
    } catch (error) {
      showToast(error.response?.data?.detail || "No se pudo encontrar una ruta", "error");
    } finally {
      setLoading(false);
    }
  };

  const buscarTodasLasRutas = async () => {
    if (!validarCiudades(origenBusqueda, destinoBusqueda)) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rutas/todas`, {
        params: { origen: origenBusqueda, destino: destinoBusqueda }
      });

      const rutas = response.data.rutas;
      setTodasLasRutas(rutas);
      setResultado(null);
      setActiveRouteIndex(null);

      if (rutas && rutas.length > 0) {
        const masCorta = rutas[0].distancia_total;
        const masLarga = rutas[rutas.length - 1].distancia_total;
        const promedio = (rutas.reduce((acc, curr) => acc + curr.distancia_total, 0) / rutas.length).toFixed(2);

        setEstadisticas({ total_rutas: rutas.length, mas_corta: masCorta, mas_larga: masLarga, promedio });
      }
      showToast(`Se encontraron ${rutas.length} rutas`, "success");
    } catch (error) {
      showToast(error.response?.data?.detail || "No se encontraron rutas", "error");
    } finally {
      setLoading(false);
    }
  };

  const verEnMapa = (ruta, index) => {
    resaltarRuta(ruta);
    setActiveRouteIndex(index);
    setTimeout(() => {
      if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, 100);
  };

  const resaltarRuta = (rutaArreglo) => {
    const idsRuta = rutaArreglo.map(r => String(r).toLowerCase().trim());
    setEdges((eds) => eds.map((edge) => {
      const esParteDeRuta = idsRuta.some((nodo, i) => {
        if (i === idsRuta.length - 1) return false;
        const siguiente = idsRuta[i + 1];
        return (edge.source === nodo && edge.target === siguiente) || (edge.source === siguiente && edge.target === nodo);
      });
      return {
        ...edge,
        animated: esParteDeRuta,
        style: {
          stroke: esParteDeRuta ? '#ef4444' : 'var(--text-muted)',
          strokeWidth: esParteDeRuta ? 3 : 1
        }
      };
    }));
  };

  // --- FUNCIONALIDADES CRUD ---
  const ejecutarPeticion = async (metodo, url, data = null, mensajeExito, callbackReset) => {
    try {
      if (metodo === 'post') await axios.post(url, data);
      if (metodo === 'put') await axios.put(url, data);
      if (metodo === 'delete') await axios.delete(url);

      showToast(mensajeExito, "success");
      if (callbackReset) callbackReset();
      cargarGrafo();
    } catch (error) {
      showToast(error.response?.data?.detail || "Error en la operación", "error");
    }
  };

  const guardarCambiosBD = () => {
    ejecutarPeticion('post', `${API_URL}/grafo/guardar`, null, "Base de conocimiento guardada en disco");
  };

  return (
    <div className="app-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sidebar">
        {/* HEADER */}
        <div className="sidebar-header">
          <h2>Sistema de Rutas</h2>
          <button onClick={guardarCambiosBD} className="btn btn-success btn-sm" title="Guardar en disco">
            {Icons.save}
          </button>
        </div>

        {/* SECCION: BUSCAR RUTAS */}
        <div className="section">
          <h3 className="section-title">{Icons.search} Buscar Rutas</h3>
          <form onSubmit={buscarRutaCorta} className="form-group">
            <input
              className="form-input"
              placeholder="Ciudad de origen"
              value={origenBusqueda}
              onChange={e => setOrigenBusqueda(e.target.value)}
              required
            />
            <input
              className="form-input"
              placeholder="Ciudad de destino"
              value={destinoBusqueda}
              onChange={e => setDestinoBusqueda(e.target.value)}
              required
            />
            <div className="button-row">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '...' : 'Óptima'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={buscarTodasLasRutas} disabled={loading}>
                Todas
              </button>
              <button type="button" className="btn btn-outline" onClick={limpiarBusqueda}>
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* RESULTADO: RUTA OPTIMA */}
        {resultado && (
          <div className="section">
            <div className="result-card result-card-success">
              <h3>{Icons.route} Ruta Recomendada</h3>
              <p><strong>Distancia total:</strong> {resultado.distancia_total} km</p>
              <p><strong>Recorrido:</strong></p>
              <div className="route-path">{resultado.ruta.join(' → ')}</div>
            </div>
          </div>
        )}

        {/* RESULTADO: TODAS LAS RUTAS */}
        {todasLasRutas && (
          <div className="section">
            <div className="all-routes-container">
              <h3 className="section-title">{Icons.map} Estadísticas</h3>
              {estadisticas && (
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{estadisticas.total_rutas}</span>
                    <span className="stat-label">Total rutas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{estadisticas.mas_corta}</span>
                    <span className="stat-label">Min (km)</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{estadisticas.mas_larga}</span>
                    <span className="stat-label">Max (km)</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{estadisticas.promedio}</span>
                    <span className="stat-label">Prom (km)</span>
                  </div>
                </div>
              )}
              <h3 className="section-title">Rutas Disponibles</h3>
              <div className="routes-scroll-container">
                {todasLasRutas.map((r, index) => (
                  <div key={index} className={`result-card route-item ${activeRouteIndex === index ? 'route-item-active' : ''}`}>
                    <div className="route-item-header">
                      <strong>Opción {index + 1}</strong>
                      <span className="route-distance-badge">{r.distancia_total} km</span>
                    </div>
                    <div className="route-path">{r.ruta.join(' → ')}</div>
                    <button
                      onClick={() => verEnMapa(r.ruta, index)}
                      className={`btn btn-sm ${activeRouteIndex === index ? 'btn-primary' : 'btn-info'}`}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {activeRouteIndex === index ? 'Viendo esta ruta' : 'Ver en mapa'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCION: GESTION DE CIUDADES */}
        <div className="section">
          <h3 className="section-title">{Icons.map} Gestión de Ciudades</h3>
          <div className="form-group">
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Nombre de nueva ciudad"
                value={nuevaCiudad}
                onChange={e => setNuevaCiudad(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={() => {
                  if (!nuevaCiudad.trim()) return showToast("El nombre no puede estar vacío", "warning");
                  ejecutarPeticion('post', `${API_URL}/grafo/ciudad`, { nombre: nuevaCiudad.trim() }, "Ciudad agregada", () => setNuevaCiudad(''));
                }}
              >
                {Icons.plus}
              </button>
            </div>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Ciudad a eliminar"
                value={ciudadEliminar}
                onChange={e => setCiudadEliminar(e.target.value)}
              />
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (!ciudadEliminar.trim()) return showToast("Ingrese una ciudad a eliminar", "warning");
                  ejecutarPeticion('delete', `${API_URL}/grafo/ciudad/${encodeURIComponent(ciudadEliminar.trim())}`, null, "Ciudad eliminada", () => setCiudadEliminar(''));
                }}
              >
                {Icons.trash}
              </button>
            </div>
          </div>
        </div>

        {/* SECCION: GESTION DE CONEXIONES */}
        <div className="section">
          <h3 className="section-title">{Icons.link} Gestión de Conexiones</h3>
          <div className="form-group">

            {/* Agregar Conexion */}
            <form onSubmit={e => { e.preventDefault(); ejecutarPeticion('post', `${API_URL}/grafo/conexion`, { origen: nuevaConexion.origen.trim(), destino: nuevaConexion.destino.trim(), distancia: nuevaConexion.distancia }, "Conexión agregada", () => setNuevaConexion({ origen: '', destino: '', distancia: '' })); }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Agregar conexión</p>
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <input className="form-input" placeholder="Origen" value={nuevaConexion.origen} onChange={e => setNuevaConexion({ ...nuevaConexion, origen: e.target.value })} required />
                <input className="form-input" placeholder="Destino" value={nuevaConexion.destino} onChange={e => setNuevaConexion({ ...nuevaConexion, destino: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="number" className="form-input" placeholder="Distancia (km)" value={nuevaConexion.distancia} onChange={e => setNuevaConexion({ ...nuevaConexion, distancia: parseInt(e.target.value) || '' })} required />
                <button type="submit" className="btn btn-success btn-sm">{Icons.plus}</button>
              </div>
            </form>

            <hr className="divider" />

            {/* Actualizar Conexion */}
            <form onSubmit={e => { e.preventDefault(); ejecutarPeticion('put', `${API_URL}/grafo/conexion/${encodeURIComponent(actConexion.origen.trim())}/${encodeURIComponent(actConexion.destino.trim())}`, { distancia: actConexion.distancia }, "Distancia actualizada", () => setActConexion({ origen: '', destino: '', distancia: '' })); }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actualizar distancia</p>
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <input className="form-input" placeholder="Origen" value={actConexion.origen} onChange={e => setActConexion({ ...actConexion, origen: e.target.value })} required />
                <input className="form-input" placeholder="Destino" value={actConexion.destino} onChange={e => setActConexion({ ...actConexion, destino: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="number" className="form-input" placeholder="Nueva distancia" value={actConexion.distancia} onChange={e => setActConexion({ ...actConexion, distancia: parseInt(e.target.value) || '' })} required />
                <button type="submit" className="btn btn-primary btn-sm">{Icons.edit}</button>
              </div>
            </form>

            <hr className="divider" />

            {/* Eliminar Conexion */}
            <form onSubmit={e => { e.preventDefault(); ejecutarPeticion('delete', `${API_URL}/grafo/conexion/${encodeURIComponent(elimConexion.origen.trim())}/${encodeURIComponent(elimConexion.destino.trim())}`, null, "Conexión eliminada", () => setElimConexion({ origen: '', destino: '' })); }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Eliminar conexión</p>
              <div className="form-row">
                <input className="form-input" placeholder="Origen" value={elimConexion.origen} onChange={e => setElimConexion({ ...elimConexion, origen: e.target.value })} required />
                <input className="form-input" placeholder="Destino" value={elimConexion.destino} onChange={e => setElimConexion({ ...elimConexion, destino: e.target.value })} required />
                <button type="submit" className="btn btn-danger btn-sm">{Icons.trash}</button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* CANVAS */}
      <div className="canvas-container">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? Icons.sun : Icons.moon}
          {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setReactFlowInstance}
          fitView
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="var(--border-color)" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}