import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Boveda from './pages/Boveda.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/boveda" element={<Boveda />} />

      {/* Ruta 404 — por ahora simple, la puliremos luego */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <p className="mt-4 text-lg text-gray-600">
                Página no encontrada en Fandoom.
              </p>
              <a
                href="/"
                className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;