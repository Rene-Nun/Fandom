export default function EventCard({ evento, index = 0, onClick }) {
  const { desactivado } = evento;
  const delayClass = `d${Math.min(index + 1, 6)}`;

  return (
    <div
      className={`evento-card fade-up ${delayClass} ${desactivado ? 'desactivado' : ''}`}
      onClick={!desactivado ? onClick : undefined}
    >
      <div className="evento-img-wrap">
        <img
          src={evento.img}
          alt={evento.name}
          className="evento-img"
          onError={(e) => {
            e.currentTarget.parentElement.style.background = '#f5f5f5';
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="evento-precio-badge">
          {desactivado ? 'Próximamente' : evento.precio}
        </div>
      </div>
      <div className="evento-body">
        <div className="evento-nombre">{evento.name}</div>
        <button className="btn-ver-boletos" disabled={desactivado} style={{ marginTop: 'auto' }}>
          {desactivado ? (
            'Próximamente'
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              Ver boletos disponibles
            </>
          )}
        </button>
      </div>
    </div>
  );
}