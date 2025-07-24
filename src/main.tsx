import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suprimir avisos do React DevTools
if (import.meta.env.PROD) {
  console.log = () => {};
} else {
  // Suprimir aviso do React DevTools em desenvolvimento
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

// Suprimir erro de runtime.lastError (extensão do navegador)
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('runtime.lastError')) {
    event.preventDefault();
    return false;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
