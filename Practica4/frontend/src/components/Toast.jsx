import React from 'react';

export default function Toast({ toast }) {
  const toastStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '15px 25px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transform: toast.visible ? 'translateY(0)' : 'translateY(100px)',
    opacity: toast.visible ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    background: toast.type === 'error' ? '#ef4444' : 
                toast.type === 'warning' ? '#f59e0b' : 
                toast.type === 'success' ? '#10b981' : '#3b82f6'
  };

  return (
    <div style={toastStyle}>
      {toast.message}
    </div>
  );
}