import { useNavigate } from 'react-router-dom';

const eventoImgs = {
  'Baja Beach Fest': '/BajaB.jpeg',
  'Rosalía Lux Tour': '/Rosalia.jpeg',
  'Vans Warped Tour': '/VW.JPG',
  'Bruno Mars': '/BM.JPG',
  'Harry Styles': '/HS.JPG',
  'Enjambre Estadio GNP': '/Enjambre.webp',
};

function fmtMXN(n) {
  if (!n) return '—';
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MXN';
}

function fmtFecha(str) {
  if (!str) return '—';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function badgeClass(estado) {
  if (!estado) return 'badge-activo';
  return 'badge-' + estado.toLowerCase().replace(/ /g, '_');
}

export default function TicketCedidos({ cedidos }) {
  const navigate = useNavigate();

  if (cedidos.length === 0) {
    return (
      <div className="empty-state fade-up" style={{ gridColumn: '1 / -1' }}>
        <div className="empty-icon">🎟</div>
        <div className="empty-title">Sin cesiones activas</div>
        <p className="empty-sub">
          Aún no has listado ningún boleto. Usa el Marketplace para poner tu boleto
          a trabajar.
        </p>
        <button className="btn-volt" onClick={() => navigate('/')}>
          Ir al Marketplace →
        </button>
      </div>
    );
  }

  return (
    <>
      {cedidos.map((c, i) => {
        const img = eventoImgs[c.evento] || null;
        const estado = c.estado || 'Listado';
        const badge = badgeClass(estado);
        const enProceso = estado === 'En Proceso';

        return (
          <div key={c.id || i} className={`cedido-card fade-up d${Math.min(i + 1, 3)}`}>
            {img ? (
              <img
                src={img}
                alt={c.evento}
                className="cedido-img"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="cedido-img-placeholder">
                <span>{c.evento || 'FANDOM'}</span>
              </div>
            )}
            <div className={`ticket-status-badge ${badge}`} style={{ top: 8, right: 8 }}>
              {estado}
            </div>
            <div className="cedido-body">
              <div className="cedido-evento">{c.evento || '—'}</div>
              <div className="cedido-zona">
                {c.cantidad > 1 ? `${c.cantidad} boletos · ` : ''}
                {c.zona || 'Zona por confirmar'}
              </div>

              {estado === 'Listado' && (
                <div style={{ padding: '12px 0 4px', fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Tu boleto está publicado en el Marketplace. Te avisamos cuando
                  alguien lo tome.
                </div>
              )}

              {enProceso && (
                <div style={{ padding: '12px 0 4px', fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Hay un comprador activo pagando su plan. Tu dinero quedará
                  depositado al terminar el evento.
                </div>
              )}

              <div className="cedido-grid">
                <div className="cedido-cell">
                  <div className="cedido-cell-label">Precio listado</div>
                  <div className="cedido-cell-value">{fmtMXN(c.precioListado)}</div>
                </div>
                <div className="cedido-cell">
                  <div className="cedido-cell-label">Tú recibirás</div>
                  <div className="cedido-cell-value destacado">{fmtMXN(c.precioCedente)}</div>
                </div>
              </div>
            </div>
            <div className="ticket-perforation">
              <div className="ticket-perf-line" />
              <div className="ticket-perf-line" />
            </div>
            {c.fechaDeposito && (
              <div className="fecha-evento">
                <div className="fecha-icon">💸</div>
                <div className="fecha-text">
                  <div className="fecha-label">Fecha de depósito</div>
                  <div className="fecha-value">{fmtFecha(c.fechaDeposito)}</div>
                </div>
              </div>
            )}
            {c.fechaEvento && (
              <div className="fecha-evento">
                <div className="fecha-icon">📅</div>
                <div className="fecha-text">
                  <div className="fecha-label">Fecha del evento</div>
                  <div className="fecha-value">{fmtFecha(c.fechaEvento)}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}