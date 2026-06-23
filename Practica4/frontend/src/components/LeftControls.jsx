import React from 'react';

export default function LeftControls({
  mazeRows, setMazeRows, mazeCols, setMazeCols,
  handleCreateEmpty, handleGenerate, handleDownloadJSON, 
  fileInputRef, isRacing, isSolving, paintMode, setPaintMode,
  cargarLaberintoPredefinido // <-- Recibe la funcion desde el orquestador
}) {
  return (
    <aside className="controls-panel-left">
      
      <h3>Selector de Laberintos</h3>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Laberintos Predefinidos</label>
        <select 
          style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '4px' }}
          onChange={(e) => cargarLaberintoPredefinido(e.target.value)}
          disabled={isRacing || isSolving}
        >
          <option value="maze_1">Laberinto 1</option>
          <option value="maze_2">Laberinto 2</option>
          <option value="maze_3">Laberinto 3</option>
          <option value="maze_4">Laberinto 4</option>
          <option value="maze_5">Laberinto 5</option>
        </select>
      </div>

      <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

      <h3>Creador de Laberintos</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filas</label>
          <input type="number" value={mazeRows} onChange={e => setMazeRows(Number(e.target.value))} style={{ width: '100%', padding: '5px' }} min="3" max="50" disabled={isRacing || isSolving} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Columnas</label>
          <input type="number" value={mazeCols} onChange={e => setMazeCols(Number(e.target.value))} style={{ width: '100%', padding: '5px' }} min="3" max="50" disabled={isRacing || isSolving} />
        </div>
      </div>
      
      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleCreateEmpty} disabled={isRacing || isSolving}>Crear Vacia</button>
        <button className="btn btn-secondary" onClick={handleGenerate} disabled={isRacing || isSolving}>Generar Aleatorio</button>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn" style={{flex: 1}} onClick={handleDownloadJSON}>Descargar</button>
          <button className="btn" style={{flex: 1}} onClick={() => fileInputRef.current.click()} disabled={isRacing || isSolving}>Subir</button>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

      <h4>Modo de Edicion</h4>
      <div className="button-group">
        <button className={`btn ${paintMode === 'wall' ? 'active' : ''}`} onClick={() => setPaintMode('wall')} disabled={isRacing}>Pintar Obstaculos</button>
        <button className={`btn ${paintMode === 'eraser' ? 'active' : ''}`} onClick={() => setPaintMode('eraser')} disabled={isRacing}>Borrador</button>
        <button className={`btn ${paintMode === 'start' ? 'active' : ''}`} onClick={() => setPaintMode('start')} disabled={isRacing}>Punto Inicial</button>
        <button className={`btn ${paintMode === 'target' ? 'active' : ''}`} onClick={() => setPaintMode('target')} disabled={isRacing}>Puntos Objetivo</button>
      </div>
    </aside>
  );
}