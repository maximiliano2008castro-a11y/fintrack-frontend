import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Solo importamos los dos archivos que sí existen y nos importan
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Cuando el usuario entra a la app, lo mandamos directo a nuestro nuevo Login */}
        <Route path="/" element={<Login />} />
        
        {/* La ruta protegida de la Fortaleza */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;