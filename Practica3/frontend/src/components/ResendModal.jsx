import React, { useState } from 'react';

export default function ResendModal({ isOpen, onClose, onSend }) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'var(--bg)', padding: '24px', borderRadius: '8px',
        width: '400px', maxWidth: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Reenviar Reporte</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>
          Ingrese la dirección de correo electrónico a la que desea enviar el documento CSV:
        </p>
        <input 
          type="email" 
          className="form-input" 
          placeholder="correo@ejemplo.com"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          autoFocus 
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onSend(email); setEmail(''); }}>
            Enviar Correo
          </button>
        </div>
      </div>
    </div>
  );
}