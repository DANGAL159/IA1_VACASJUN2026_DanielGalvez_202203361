import React, { useState, useEffect } from 'react';
import RoboMaze from './pages/RoboMaze';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');

  // Inyectar el tema en el nodo principal de HTML para que el CSS lo detecte
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return <RoboMaze theme={theme} toggleTheme={toggleTheme} />;
}

export default App;