import { useState } from 'react';

export default function ReventaSheet({ evento, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet-container">
        <div className="sheet-warning">⚠ Acción irreversible</div>
        <div className="sheet-title">Revender — {evento}</div>
        <p className="sheet-body">
          Tu boleto será publicado en el Marketplace de Fandom. Una vez confirmado,
          Fandom gestionará la venta y liquidará tu deuda pendiente. Esta acción no
          puede deshacerse.
        </p>
        <div className="sheet-actions">
          <button className="btn-confirmar" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar reventa →'}
          </button>
          <button className="btn-cancelar" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}