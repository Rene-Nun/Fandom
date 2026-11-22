import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppProvider.jsx';
import TicketCompras from '../components/boveda/TicketCompras.jsx';
import TicketCedidos from '../components/boveda/TicketCedidos.jsx';
import ReventaSheet from '../components/boveda/ReventaSheet.jsx';
import PagoSheet from '../components/boveda/PagoSheet.jsx';

export default function Boveda() {
  const { celular, logout } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [cedidos, setCedidos] = useState([]);
  const [tab, setTab] = useState('compras');
  const [welcomeSub, setWelcomeSub] = useState('Cargando tu bóveda...');

  const [reventaModal, setReventaModal] = useState({ isOpen: false, id: null, evento: '' });
  const [pagoModal, setPagoModal] = useState({ isOpen: false, evento: '', enganche: 0 });

  // Redirige si no hay sesión
  useEffect(() => {
    if (!celular) navigate('/', { replace: true });
  }, [celular, navigate]);

  // Carga datos
  useEffect(() => {
    if (!celular) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/boveda?celular=' + encodeURIComponent(celular));
        const data = await res.json();
        if (cancelled) return;

        const comprasData = data.compras || [];
        const cedidosData = data.cedidos || [];
        setCompras(comprasData);
        setCedidos(cedidosData);

        const total = comprasData.length + cedidosData.length;
        setWelcomeSub(
          total === 0 ? 'Sin actividad aún'
          : total === 1 ? '1 boleto en bóveda'
          : `${total} boletos en bóveda`
        );
      } catch {
        if (cancelled) return;
        setCompras([]);
        setCedidos([]);
        setWelcomeSub('Sin actividad aún');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [celular]);

  const handleCerrarSesion = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleConfirmarReventa = async () => {
    if (!reventaModal.id) return;
    try {
      const res = await fetch('/api/revender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reventaModal.id }),
      });
      if (!res.ok) throw new Error();
      // Recargar
      const r2 = await fetch('/api/boveda?celular=' + encodeURIComponent(celular));
      const d2 = await r2.json();
      setCompras(d2.compras || []);
      setCedidos(d2.cedidos || []);
      setReventaModal({ isOpen: false, id: null, evento: '' });
    } catch {
      alert('Error al procesar. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="boveda-page">
        <header className="boveda-header">
          <div className="boveda-header-inner">
            <div className="boveda-logo">
              <img src="/logo.PNG" alt="Fandom" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="boveda-title">Mi Bóveda</div>
          </div>
        </header>
        <main className="boveda-main">
          <div className="boveda-loading">
            <div className="boveda-spinner" />
            <div className="loading-text">Cargando tu bóveda...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="boveda-page">
      <header className="boveda-header">
        <div className="boveda-header-inner">
          <div className="boveda-logo">
            <img src="/logo.PNG" alt="Fandom" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <div className="boveda-title">Mi Bóveda</div>
          <div className="boveda-actions">
            <button className="btn-chat-circle" onClick={() => navigate('/')} aria-label="Marketplace">
              <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="1" y1="1" x2="17" y2="1" />
                <line x1="1" y1="7" x2="17" y2="7" />
                <line x1="1" y1="13" x2="17" y2="13" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="boveda-main">
        <div className="welcome-bar fade-up d1">
          <div className="welcome-sub">{welcomeSub}</div>
        </div>

        <div className="toggle-wrap fade-up d2">
          <div className="toggle-pill">
            <button
              className={`toggle-btn ${tab === 'compras' ? 'active' : ''}`}
              onClick={() => setTab('compras')}
            >
              Mis boletos
            </button>
            {cedidos.length > 0 && (
              <button
                className={`toggle-btn ${tab === 'cedidos' ? 'active' : ''}`}
                onClick={() => setTab('cedidos')}
              >
                Mis cedidos
              </button>
            )}
          </div>
        </div>

        {tab === 'compras' ? (
          <div className="cards-grid fade-up d3">
            <TicketCompras
              compras={compras}
              onAbrirPago={(evt, eng) => setPagoModal({ isOpen: true, evento: evt, enganche: eng })}
              onAbrirReventa={(id, evt) => setReventaModal({ isOpen: true, id, evento: evt })}
            />
          </div>
        ) : (
          <div className="cards-grid fade-up d3">
            <TicketCedidos cedidos={cedidos} />
          </div>
        )}

        <button className="btn-salir-bottom" onClick={handleCerrarSesion}>
          Cerrar sesión
        </button>
      </main>

      {reventaModal.isOpen && (
        <ReventaSheet
          evento={reventaModal.evento}
          onConfirm={handleConfirmarReventa}
          onCancel={() => setReventaModal({ isOpen: false, id: null, evento: '' })}
        />
      )}

      {pagoModal.isOpen && (
        <PagoSheet
          evento={pagoModal.evento}
          enganche={pagoModal.enganche}
          onClose={() => setPagoModal({ isOpen: false, evento: '', enganche: 0 })}
        />
      )}
    </div>
  );
}