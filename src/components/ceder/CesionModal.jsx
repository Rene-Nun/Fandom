import { useEffect } from 'react';
import { CESION_TERMS_HTML } from '../../data/cederData.js';

export default function CesionModal({ onClose }) {
  // Bloqueo de scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="cesion-modal-bg"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cesion-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cesion-modal-header">
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>
            Términos de Cesión
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 22, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>
        <div
          className="cesion-modal-content"
          dangerouslySetInnerHTML={{ __html: CESION_TERMS_HTML }}
        />
        <div className="cesion-modal-footer">
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--ink)',
              color: '#fff',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: 'none',
              padding: 14,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}