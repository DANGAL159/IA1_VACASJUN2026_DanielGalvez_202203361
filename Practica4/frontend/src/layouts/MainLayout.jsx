import React from 'react';

export default function MainLayout({ children, theme, toggleTheme }) {
  return (
    <div className="app-container">
      <header className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>RoboMaze - IA 1</h2>
        <button className="btn btn-outline" onClick={toggleTheme}>
          {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
        </button>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>Laboratorio de Ciencias y Sistemas - USAC</p>
      </footer>
    </div>
  );
}