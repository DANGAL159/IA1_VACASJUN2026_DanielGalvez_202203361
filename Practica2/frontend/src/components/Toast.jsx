import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Iconos simples en SVG para evitar dependencias externas
  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    )
  };

  const bgStyles = {
    success: { background: 'var(--success-bg, #d4edda)', color: 'var(--success-text, #155724)', border: '1px solid var(--success-text, #c3e6cb)' },
    error: { background: 'var(--error-bg, #f8d7da)', color: 'var(--error-text, #721c24)', border: '1px solid var(--error-text, #f5c6cb)' },
    warning: { background: 'var(--warning-bg, #fff3cd)', color: 'var(--warning-text, #856404)', border: '1px solid var(--warning-text, #ffeeba)' },
    info: { background: 'var(--sidebar-bg, #d1ecf1)', color: 'var(--text-color, #0c5460)', border: '1px solid var(--border-color, #bee5eb)' }
  };

  return (
    <div 
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '14px 20px',
        borderRadius: '8px',
        boxShadow: 'var(--card-shadow, 0 4px 6px rgba(0,0,0,0.1))',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '280px',
        maxWidth: '400px',
        ...bgStyles[type]
      }}
    >
      <span style={{ flexShrink: 0 }}>{icons[type] || icons.info}</span>
      <span style={{ fontWeight: 500, flexGrow: 1 }}>{message}</span>
      <button 
        onClick={onClose} 
        aria-label="Cerrar notificación"
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '24px', 
          color: 'inherit',
          flexShrink: 0,
          padding: '0 4px',
          lineHeight: 1,
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        &times;
      </button>
    </div>
  );
}