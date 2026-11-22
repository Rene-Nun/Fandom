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

function diasRestantes(str) {
  if (!str) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ev = new Date(str + 'T12:00:00'); ev.setHours(0, 0, 0, 0);
  return Math.ceil((ev - hoy) / (1000 * 60 * 60 * 24));
}

function badgeClass(estado) {
  if (!estado) return 'badge-activo';
  return 'badge-' + estado.toLowerCase().replace(/ /g, '_');
}

export default function TicketCompras({ compras, onAbrirPago, onAbrirReventa }) {
  const navigate = useNavigate();

  if (compras.length === 0) {
    return (
      <div className="empty-state fade-up" style={{ gridColumn: '1 / -1' }}>
        <div className="empty-icon">🎟</div>
        <div className="empty-title">Bóveda vacía</div>
        <p className="empty-sub">
          Aún no tienes boletos financiados. Explora los eventos disponibles en el
          Marketplace y asegura tu lugar hoy mismo.
        </p>
        <button className="btn-volt" onClick={() => navigate('/')}>
          Ver eventos disponibles →
        </button>
      </div>
    );
  }

  return (
    <>
      {compras.map((c, i) => {
        const pagadas = c.cuotasPagadas || 0;
        const total = c.totalCuotas || 1;
        const pct = Math.min(100, Math.round((pagadas / total) * 100));
        const dias = diasRestantes(c.fechaEvento);
        const img = eventoImgs[c.evento] || null;
        const estado = c.estado || 'Activo';
        const badge = badgeClass(estado);
        const cantidad = c.cantidad || 1;
        const cantLabel = cantidad > 1 ? `${cantidad} boletos` : '1 boleto';

        return (
          <div key={c.id || i} className={`ticket-card fade-up d${Math.min(i + 1, 3)}`}>
            {img ? (
              <img
                src={img}
                alt={c.evento}
                className="ticket-img"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="ticket-img-placeholder">
                <span>{c.evento || 'FANDOM'}</span>
              </div>
            )}
            <div className={`ticket-status-badge ${badge}`}>{estado}</div>
            <div className="ticket-body">
              <div className="ticket-evento">{c.evento || '—'}</div>
              <div className="ticket-zona">
                {cantLabel} · {c.zona || 'Zona por confirmar'}
              </div>

              <div className="progress-wrap">
                <div className="progress-header">
                  <span className="progress-label">Pagos completados</span>
                  <span className="progress-count">
                    {pagadas} / {total} quincenas
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="ticket-grid">
                <div className="ticket-cell">
                  <div className="ticket-cell-label">Total del plan</div>
                  <div className="ticket-cell-value">{fmtMXN(c.precioTotal)}</div>
                </div>
                <div className="ticket-cell">
                  <div className="ticket-cell-label">Cuota quincenal</div>
                  <div className="ticket-cell-value destacado">{fmtMXN(c.cuotaQuincenal)}</div>
                </div>
                <div className="ticket-cell">
                  <div className="ticket-cell-label">Enganche pagado</div>
                  <div className="ticket-cell-value">{fmtMXN(c.enganche)}</div>
                </div>
                <div className="ticket-cell">
                  <div className="ticket-cell-label">Avance</div>
                  <div className="ticket-cell-value destacado">{pct}%</div>
                </div>
              </div>

              {(estado === 'Pendiente' || estado === 'Activo') && (
                <button
                  className="btn-revender"
                  style={{ borderColor: 'var(--ink)', color: 'var(--ink)', marginBottom: 6 }}
                  onClick={() => onAbrirPago(c.evento, c.enganche || 0)}
                >
                  Ver instrucciones de pago →
                </button>
              )}

              {estado !== 'En Reventa' && estado !== 'Completado' && estado !== 'Pendiente' && (
                <button
                  className="btn-revender"
                  onClick={() => onAbrirReventa(c.id, c.evento)}
                >
                  Revender este boleto
                </button>
              )}
            </div>

            <div className="ticket-perforation">
              <div className="ticket-perf-line" />
              <div className="ticket-perf-line" />
            </div>

            {c.fechaEntregaBoleto && (
              <div className="fecha-evento">
                <div className="fecha-icon">🎟</div>
                <div className="fecha-text">
                  <div className="fecha-label">Entrega del boleto</div>
                  <div className="fecha-value">{fmtFecha(c.fechaEntregaBoleto)}</div>
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
                {dias !== null && (
                  <div className="dias-restantes">
                    {dias > 0 ? dias : '¡Hoy!'}
                    <span>{dias > 0 ? 'días' : ''}</span>
                  </div>
                )}
              </div>
            )}

            {c.proximoPago && (
              <div className="proximo-pago">
                <span className="pp-label">Próximo pago</span>
                <span className="pp-value">{fmtFecha(c.proximoPago)}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}