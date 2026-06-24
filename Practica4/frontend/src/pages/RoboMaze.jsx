import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import MazeGrid from '../components/MazeGrid';
import LeftControls from '../components/LeftControls';
import RightControls from '../components/RightControls';
import RacingBoard from '../components/RacingBoard';
import Toast from '../components/Toast';
import { obtenerLaberinto, generarLaberinto, resolverLaberinto } from '../api/api';

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function RoboMaze({ theme, toggleTheme }) {
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState(null);
  const [targets, setTargets] = useState([]);
  const [exploredNodes, setExploredNodes] = useState([]);
  const [path, setPath] = useState([]);

  const [mazeRows, setMazeRows] = useState(15);
  const [mazeCols, setMazeCols] = useState(20);

  const [metrics, setMetrics] = useState({ time: 0, nodes: 0 });
  const [comparison, setComparison] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [paintMode, setPaintMode] = useState('wall');

  const [isRacing, setIsRacing] = useState(false);
  const [raceData, setRaceData] = useState({
    bfs: { explored: [], path: [] },
    dfs: { explored: [], path: [] },
    astar: { explored: [], path: [] }
  });

  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const currentAlgorithm = useRef(null);
  const animationInterval = useRef(null);
  const currentHead = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarLaberintoPredefinido('maze_1');
    return () => clearInterval(animationInterval.current);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3500);
  };

  const handleStop = () => {
    clearInterval(animationInterval.current);
    setIsSolving(false);
    showToast('Animacion detenida manualmente', 'warning');
  };

  const handleExitRacingMode = () => {
    handleClearAnimation();
    showToast('Modo edicion restaurado', 'info');
  };

  const cargarLaberintoPredefinido = async (id) => {
    handleClearAnimation();
    try {
      const data = await obtenerLaberinto(id);
      setGrid(data.grid);
      setStart(data.start);
      setTargets(data.targets);
      setMazeRows(data.grid.length);
      setMazeCols(data.grid[0].length);
      showToast('Laberinto cargado', 'success');
    } catch (error) {
      showToast('Laberinto no encontrado', 'error');
    }
  };

  const handleGenerate = async () => {
    handleClearAnimation();
    try {
      const data = await generarLaberinto(mazeRows, mazeCols);
      setGrid(data.grid);
      setStart(data.start);
      setTargets(data.targets);
      showToast('Laberinto generado', 'info');
    } catch (error) {
      showToast('Error al generar', 'error');
    }
  };

  const handleCreateEmpty = () => {
    handleClearAnimation();
    const newGrid = Array(mazeRows).fill().map(() => Array(mazeCols).fill(0));
    setGrid(newGrid);
    setStart(null);
    setTargets([]);
  };

  const handleClearAnimation = () => {
    clearInterval(animationInterval.current);
    setExploredNodes([]);
    setPath([]);
    setMetrics({ time: 0, nodes: 0 });
    setComparison(null);
    setIsSolving(false);
    setIsRacing(false);
    setRaceData({
      bfs: { explored: [], path: [] }, dfs: { explored: [], path: [] }, astar: { explored: [], path: [] }
    });
  };

  const handleCellClick = async (r, c) => {
    if (isRacing) return;

    if (paintMode === 'start') {
      setStart([r, c]);
      if (isSolving && currentAlgorithm.current && !isRacing) {
        clearInterval(animationInterval.current);
        showToast('Inicio movido, recalculando...', 'info');
        handleSolve(currentAlgorithm.current, [r, c], false, grid, targets);
      } else {
        handleClearAnimation();
      }
    } else if (paintMode === 'target') {
      const isAlreadyTarget = targets.some(t => t[0] === r && t[1] === c);
      let newTargets = [...targets];
      if (isAlreadyTarget) {
        newTargets = targets.filter(t => t[0] !== r || t[1] !== c);
      } else {
        newTargets.push([r, c]);
      }
      setTargets(newTargets);

      // En lugar de limpiar, comprobamos si esta resolviendo para actualizar la ruta en vivo
      if (isSolving && currentAlgorithm.current && !isRacing) {
        clearInterval(animationInterval.current);
        showToast('Objetivo modificado, recalculando...', 'info');
        handleSolve(currentAlgorithm.current, start, false, grid, newTargets);
      } else if (!isSolving) {
        handleClearAnimation();
      }
    } else if (paintMode === 'wall') {
      const newGrid = [...grid];
      newGrid[r] = [...newGrid[r]];
      newGrid[r][c] = 1;
      setGrid(newGrid);

      if (isSolving && currentAlgorithm.current && !isRacing) {
        clearInterval(animationInterval.current);
        showToast('Recalculando ruta...', 'warning');
        // Recalculamos desde el inicio (start) para asegurar trazabilidad correcta del path visual
        handleSolve(currentAlgorithm.current, start, false, newGrid, targets);
      }
    } else if (paintMode === 'eraser') {
      const newGrid = [...grid];
      newGrid[r] = [...newGrid[r]];
      newGrid[r][c] = 0;
      setGrid(newGrid);
      
      let newStart = start;
      if (start && start[0] === r && start[1] === c) {
        newStart = null;
        setStart(null);
      }
      const newTargets = targets.filter(t => t[0] !== r || t[1] !== c);
      setTargets(newTargets);

      if (isSolving && currentAlgorithm.current && !isRacing && newStart && newTargets.length > 0) {
        clearInterval(animationInterval.current);
        showToast('Ruta despejada, recalculando...', 'info');
        handleSolve(currentAlgorithm.current, newStart, false, newGrid, newTargets);
      }
    }
  };

  const handleSolve = async (algorithm, startingPoint = start, isRecalculation = false, dynamicGrid = null, dynamicTargets = null) => {
    const activeTargets = dynamicTargets || targets;
    if (!startingPoint || activeTargets.length === 0) return showToast('Defina inicio y objetivo', 'error');

    if (!isRecalculation) handleClearAnimation();
    setIsSolving(true);
    currentAlgorithm.current = algorithm;

    let currentStart = startingPoint;
    let combinedExplored = [];
    let combinedPath = [];
    let totalTimeMs = 0;
    let hasSolution = true;

    const activeGrid = dynamicGrid || grid;

    for (let i = 0; i < activeTargets.length; i++) {
      try {
        const result = await resolverLaberinto(activeGrid, currentStart, [activeTargets[i]], algorithm);
        if (result.path.length === 0) {
          showToast(`Sin solucion para alcanzar el objetivo ${i + 1}`, 'error');
          hasSolution = false;
          break;
        }
        const pathToAdd = i === 0 ? result.path : result.path.slice(1);
        combinedPath = [...combinedPath, ...pathToAdd];
        combinedExplored = [...combinedExplored, ...result.explored_nodes];
        totalTimeMs += result.time_ms;
        currentStart = activeTargets[i];
      } catch (error) {
        showToast('Error de conexion', 'error');
        setIsSolving(false);
        return;
      }
    }

    if (hasSolution && combinedPath.length > 0) {
      setMetrics({ time: totalTimeMs.toFixed(2), nodes: combinedExplored.length });
      animarBusqueda(combinedExplored, combinedPath, isRecalculation ? exploredNodes : []);
    } else {
      setIsSolving(false);
    }
  };

  const animarBusqueda = (explored, finalPath, previousExplored) => {
    let index = 0;
    animationInterval.current = setInterval(() => {
      if (index <= explored.length) {
        const slice = explored.slice(0, index);
        setExploredNodes([...previousExplored, ...slice]);
        if (slice.length > 0) currentHead.current = slice[slice.length - 1];
        index++;
      } else {
        clearInterval(animationInterval.current);
        setPath(finalPath);
        setIsSolving(false);
        showToast('Laberinto resuelto', 'success');
      }
    }, 35);
  };

  const handleDownloadJSON = () => {
    if (!start || targets.length === 0) return showToast('Establezca inicio y objetivo', 'error');
    const data = { grid, start, targets, mazeRows, mazeCols };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robomaze_${Date.now()}.json`;
    a.click();
    showToast('Archivo JSON descargado', 'success');
  };

  const handleUploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        handleClearAnimation();
        setGrid(data.grid);
        setStart(data.start);
        setTargets(data.targets);
        setMazeRows(data.grid.length);
        setMazeCols(data.grid[0].length);
        showToast('Laberinto cargado', 'success');
      } catch (err) { showToast('Formato invalido', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const runSimultaneousComparison = async () => {
    if (!start || targets.length === 0) return showToast('Defina inicio y objetivo', 'error');
    try {
      handleClearAnimation();
      setIsSolving(true);
      setIsRacing(true);
      showToast('Iniciando carrera...', 'info');

      const target = targets[0];
      const resBFS = await resolverLaberinto(grid, start, [target], 'bfs');
      const resDFS = await resolverLaberinto(grid, start, [target], 'dfs');
      const resASTAR = await resolverLaberinto(grid, start, [target], 'astar');

      if (resBFS.path.length === 0) {
        setIsSolving(false);
        setIsRacing(false);
        return showToast('Sin solucion posible', 'error');
      }

      setComparison({ bfs: resBFS, dfs: resDFS, astar: resASTAR });
      let index = 0;
      const maxLen = Math.max(resBFS.explored_nodes.length, resDFS.explored_nodes.length, resASTAR.explored_nodes.length);

      animationInterval.current = setInterval(() => {
        if (index <= maxLen) {
          setRaceData({
            bfs: { explored: resBFS.explored_nodes.slice(0, index), path: [] },
            dfs: { explored: resDFS.explored_nodes.slice(0, index), path: [] },
            astar: { explored: resASTAR.explored_nodes.slice(0, index), path: [] }
          });
          index += 2;
        } else {
          clearInterval(animationInterval.current);
          setRaceData({
            bfs: { explored: resBFS.explored_nodes, path: resBFS.path },
            dfs: { explored: resDFS.explored_nodes, path: resDFS.path },
            astar: { explored: resASTAR.explored_nodes, path: resASTAR.path }
          });
          setIsSolving(false);
          showToast('Carrera finalizada', 'success');
        }
      }, 35);
    } catch (e) {
      setIsSolving(false); setIsRacing(false); showToast('Error al procesar', 'error');
    }
  };

  const prepareExportData = () => {
    if (comparison) {
      return [
        { Algoritmo: 'BFS', Tiempo_ms: parseFloat(comparison.bfs.time_ms.toFixed(2)), Nodos_Explorados: comparison.bfs.explored_nodes.length },
        { Algoritmo: 'DFS', Tiempo_ms: parseFloat(comparison.dfs.time_ms.toFixed(2)), Nodos_Explorados: comparison.dfs.explored_nodes.length },
        { Algoritmo: 'A*', Tiempo_ms: parseFloat(comparison.astar.time_ms.toFixed(2)), Nodos_Explorados: comparison.astar.explored_nodes.length }
      ];
    } else {
      return [
        { Algoritmo: currentAlgorithm.current ? currentAlgorithm.current.toUpperCase() : 'N/A', Tiempo_ms: parseFloat(metrics.time), Nodos_Explorados: metrics.nodes }
      ];
    }
  };

  const exportToCSV = () => {
    const data = prepareExportData();
    let content = "Algoritmo,Tiempo_ms,Nodos_Explorados\n";
    data.forEach(row => { content += `${row.Algoritmo},${row.Tiempo_ms},${row.Nodos_Explorados}\n`; });

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'robomaze_metricas.csv'; a.click();
    showToast('Reporte CSV descargado', 'success');
  };

  const exportToExcel = () => {
    const data = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metricas");
    XLSX.writeFile(workbook, "robomaze_metricas.xlsx");
    showToast('Reporte EXCEL descargado', 'success');
  };

  const exportToPDF = () => {
    const data = prepareExportData();
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Rendimiento - RoboMaze", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de generacion: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Algoritmo", "Tiempo de Ejecucion (ms)", "Nodos Explorados"];
    const tableRows = data.map(item => [item.Algoritmo, item.Tiempo_ms, item.Nodos_Explorados]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save("robomaze_metricas.pdf");
    showToast('Reporte PDF descargado', 'success');
  };

  let dynamicCellSize = '25px';
  if (isRacing) {
    dynamicCellSize = mazeCols > 30 ? '8px' : (mazeCols > 20 ? '10px' : '14px');
  } else {
    dynamicCellSize = mazeCols > 40 ? '15px' : '25px';
  }

  const toastStyle = {
    position: 'fixed', bottom: '30px', right: '30px', padding: '15px 25px', borderRadius: '8px',
    color: '#fff', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transform: toast.visible ? 'translateY(0)' : 'translateY(100px)', opacity: toast.visible ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    background: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : toast.type === 'success' ? '#10b981' : '#3b82f6'
  };

  const chartData = comparison ? [
    { name: 'BFS', nodos: comparison.bfs.explored_nodes.length, tiempo: parseFloat(comparison.bfs.time_ms.toFixed(2)) },
    { name: 'DFS', nodos: comparison.dfs.explored_nodes.length, tiempo: parseFloat(comparison.dfs.time_ms.toFixed(2)) },
    { name: 'A*', nodos: comparison.astar.explored_nodes.length, tiempo: parseFloat(comparison.astar.time_ms.toFixed(2)) }
  ] : [];

  const maxNodes = mazeRows * mazeCols;

  return (
    <MainLayout theme={theme} toggleTheme={toggleTheme}>
      <Toast toast={toast} />
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadJSON} />

      <div className="robomaze-container">
        
        <LeftControls 
          mazeRows={mazeRows} setMazeRows={setMazeRows}
          mazeCols={mazeCols} setMazeCols={setMazeCols}
          handleCreateEmpty={handleCreateEmpty}
          handleGenerate={handleGenerate}
          handleDownloadJSON={handleDownloadJSON}
          fileInputRef={fileInputRef}
          isRacing={isRacing} isSolving={isSolving}
          paintMode={paintMode} setPaintMode={setPaintMode}
          cargarLaberintoPredefinido={cargarLaberintoPredefinido}
        />

        <section className="maze-display">
          {isRacing && Array.isArray(grid) && grid.length > 0 ? (
            <RacingBoard raceData={raceData} grid={grid} start={start} targets={targets} dynamicCellSize={dynamicCellSize} />
          ) : (
            Array.isArray(grid) && grid.length > 0 && (
              <MazeGrid grid={grid} start={start} targets={targets} exploredNodes={exploredNodes} path={path} onCellClick={handleCellClick} cellSize={dynamicCellSize} />
            )
          )}
        </section>

        <RightControls 
          isRacing={isRacing} isSolving={isSolving}
          handleExitRacingMode={handleExitRacingMode} handleStop={handleStop}
          handleSolve={handleSolve} runSimultaneousComparison={runSimultaneousComparison}
          exportToCSV={exportToCSV} exportToExcel={exportToExcel} exportToPDF={exportToPDF}
          metrics={metrics} comparison={comparison} chartData={chartData} maxNodes={maxNodes}
        />

      </div>
    </MainLayout>
  );
}