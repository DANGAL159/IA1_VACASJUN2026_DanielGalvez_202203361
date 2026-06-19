import React, { useState } from 'react';
import { loginAdmin, registrarUsuario } from '../api/api';
import Toast from '../components/Toast';

const SunIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

export default function Login({ onAuthSuccess, theme, toggleTheme }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        const response = await loginAdmin(form.username, form.password);
        showToast("Acceso concedido", "success");
        onAuthSuccess(response.rol);
      } else {
        await registrarUsuario(form.username, form.password);
        showToast("Usuario registrado. Ahora puedes iniciar sesion.", "success");
        setIsLoginView(true);
        setForm({ username: '', password: '' });
      }
    } catch (error) {
      showToast(error.response?.data?.detail || "Error en la autenticacion", "error");
    }
  };

  return (
    <div className="login-wrapper" style={{ position: 'relative' }}>
      <button 
        className="btn-icon" 
        onClick={toggleTheme} 
        title="Alternar Tema"
        style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px', background: 'var(--bg-muted)', borderRadius: '50%' }}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="crud-card" style={{ maxWidth: '400px', width: '100%', marginTop: '10vh' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '20px' }}>
          SmartInvoice
        </h2>
        <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
          <button className={`tab-btn ${isLoginView ? 'active' : ''}`} style={{flex: 1}} onClick={() => setIsLoginView(true)}>Ingresar</button>
          <button className={`tab-btn ${!isLoginView ? 'active' : ''}`} style={{flex: 1}} onClick={() => setIsLoginView(false)}>Registrarse</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-group">
          <div><label>Usuario</label><input className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required /></div>
          <div><label>Contraseña</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
            {isLoginView ? 'Iniciar Sesion' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}