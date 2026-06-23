import React from 'react';

export default function MetricsPanel({ metrics }) {
  return (
    <div style={{
      marginTop: '20px', 
      padding: '15px', 
      background: 'var(--panel-bg)', 
      border: '1px solid var(--border)', 
      borderRadius: '8px', 
      borderLeft: '4px solid var(--primary)'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Métricas de Rendimiento</h4>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Nodos Explorados:</span>
        <strong style={{ fontSize: '1.1rem' }}>{metrics.nodes}</strong>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-muted)' }}>Tiempo de Ejecución:</span>
        <strong style={{ fontSize: '1.1rem' }}>{metrics.time} ms</strong>
      </div>
    </div>
  );
}