import React from 'react';
import MazeGrid from './MazeGrid';

export default function RacingBoard({ raceData, grid, start, targets, dynamicCellSize }) {
  return (
    <div style={{ display: 'flex', gap: '20px', minWidth: 'fit-content' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>BFS</h4>
        <MazeGrid grid={grid} start={start} targets={targets} exploredNodes={raceData.bfs.explored} path={raceData.bfs.path} onCellClick={() => { }} cellSize={dynamicCellSize} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>DFS</h4>
        <MazeGrid grid={grid} start={start} targets={targets} exploredNodes={raceData.dfs.explored} path={raceData.dfs.path} onCellClick={() => { }} cellSize={dynamicCellSize} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent)' }}>A*</h4>
        <MazeGrid grid={grid} start={start} targets={targets} exploredNodes={raceData.astar.explored} path={raceData.astar.path} onCellClick={() => { }} cellSize={dynamicCellSize} />
      </div>
    </div>
  );
}