import React from 'react';

export default function MazeGrid({ grid, start, targets, exploredNodes, path, onCellClick, cellSize = '25px' }) {
  
  const targetSet = new Set((targets || []).map(t => `${t[0]},${t[1]}`));
  const exploredSet = new Set((exploredNodes || []).map(n => `${n[0]},${n[1]}`));
  const pathSet = new Set((path || []).map(p => `${p[0]},${p[1]}`));

  const isStart = (r, c) => start && start[0] === r && start[1] === c;
  const isTarget = (r, c) => targetSet.has(`${r},${c}`);
  const isExplored = (r, c) => exploredSet.has(`${r},${c}`);
  const isPath = (r, c) => pathSet.has(`${r},${c}`);

  return (
    <div className="maze-container" style={{ '--cell-size': cellSize }}>
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="maze-row">
          {row.map((cell, colIndex) => {
            let cellClass = "cell ";
            if (cell === 1) cellClass += "wall ";
            if (isStart(rowIndex, colIndex)) cellClass += "start ";
            else if (isTarget(rowIndex, colIndex)) cellClass += "target ";
            else if (isPath(rowIndex, colIndex)) cellClass += "path ";
            else if (isExplored(rowIndex, colIndex)) cellClass += "explored ";

            return (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                className={cellClass}
                onClick={() => onCellClick(rowIndex, colIndex)}
                style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
}