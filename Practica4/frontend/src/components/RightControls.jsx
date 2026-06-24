import React from 'react';
import MetricsPanel from './MetricsPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RightControls({
  isRacing, isSolving, handleExitRacingMode, handleStop, handleSolve,
  runSimultaneousComparison, exportToCSV, exportToExcel, exportToPDF,
  metrics, comparison, chartData, maxNodes
}) {
  return (
    <aside className="controls-panel-right">
      {isRacing && (
        <div style={{ marginBottom: '15px' }}>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', width: '100%' }} onClick={handleExitRacingMode}>
            Volver a Edicion (1 Cuadricula)
          </button>
        </div>
      )}

      {isSolving && !isRacing && (
        <div style={{ marginBottom: '15px' }}>
          <button className="btn" style={{ background: '#ef4444', color: 'white', width: '100%' }} onClick={handleStop}>
            Detener Animacion
          </button>
        </div>
      )}

      <h4>Ejecucion Individual</h4>
      <div className="button-group">
        <button className="btn btn-primary" onClick={() => handleSolve('bfs')} disabled={isSolving}>Ejecutar BFS</button>
        <button className="btn btn-primary" onClick={() => handleSolve('dfs')} disabled={isSolving}>Ejecutar DFS</button>
        <button className="btn btn-accent" onClick={() => handleSolve('astar')} disabled={isSolving}>Ejecutar A*</button>
      </div>

      {!isRacing && <MetricsPanel metrics={metrics} />}

      <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />
      
      <h4>Carrera y Graficas</h4>
      <div className="button-group">
        <button className="btn btn-accent" onClick={runSimultaneousComparison} disabled={isSolving}>Animar BFS vs DFS vs A*</button>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={exportToCSV} disabled={isSolving}>CSV</button>
          <button className="btn" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={exportToExcel} disabled={isSolving}>EXCEL</button>
          <button className="btn" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={exportToPDF} disabled={isSolving}>PDF</button>
        </div>
      </div>

      {comparison && (
        <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Grafica de Rendimiento</p>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis yAxisId="left" orientation="left" stroke="var(--primary)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--accent)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border)', color: 'var(--text-main)' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="nodos" name="Nodos Explorados" fill="var(--primary)" />
                <Bar yAxisId="right" dataKey="tiempo" name="Tiempo (ms)" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </aside>
  );
}