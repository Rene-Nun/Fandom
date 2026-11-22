import { useApp } from '../context/AppProvider.jsx';
import { legalTexts } from '../data/legalTexts.js';

export default function LegalModal() {
  const { legalOpen, legalType, closeLegal } = useApp();

  if (!legalOpen) return null;

  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLegal();
      }}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {legalType === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
          </span>
          <button className="modal-close" onClick={closeLegal}>
            ×
          </button>
        </div>
        <div
          className="legal-content"
          dangerouslySetInnerHTML={{ __html: legalTexts[legalType] }}
        />
        <div className="modal-footer">
          <button
            style={{
              width: '100%',
              background: 'var(--ink)',
              color: 'var(--paper)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: 'none',
              padding: 14,
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={closeLegal}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}