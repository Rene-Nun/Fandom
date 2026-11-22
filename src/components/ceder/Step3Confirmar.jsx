import { FECHAS_EVENTOS, EVENTO_IMGS, COMISION_FANDOM } from '../../data/cederData.js';

function fmtMXN(n) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MXN';
}

export default function Step3Confirmar({
  formData,
  termsAccepted,
  setTermsAccepted,
  onOpenTerms,
  error,
}) {
  const precio = parseFloat(formData.precio) || 0;
  const listado = Math.round(precio * (1 + COMISION_FANDOM));
  const comision = listado - precio;
  const img = EVENTO_IMGS[formData.evento] || null;
  const fechaLabel =
    (FECHAS_EVENTOS[formData.evento] || []).find((f) => f.value === formData.fechaEvento)
      ?.label || '';

  return (
    <div className="step-body fade-up">
      <div className="step-title">Confirmar</div>
      <p className="step-sub">Revisa que todo esté correcto antes de enviar.</p>

      <div className="resumen-card">
        {img ? (
          <img
            src={img}
            alt={formData.evento}
            className="resumen-evento-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="resumen-evento-img-placeholder">
            <span>{formData.evento}</span>
          </div>
        )}
        <div className="resumen-body">
          <div className="resumen-evento-nombre">{formData.evento}</div>
          <div className="resumen-meta">
            {formData.cantidad} boleto{formData.cantidad > 1 ? 's' : ''} · {formData.zona} · {fechaLabel}
          </div>
          <div className="resumen-grid">
            <div className="resumen-cell">
              <div className="resumen-cell-label">Tú recibes</div>
              <div className="resumen-cell-val destacado">{fmtMXN(precio)}</div>
            </div>
            <div className="resumen-cell">
              <div className="resumen-cell-label">Precio en marketplace</div>
              <div className="resumen-cell-val">{fmtMXN(listado)}</div>
            </div>
            <div className="resumen-cell">
              <div className="resumen-cell-label">Comisión Fandom</div>
              <div className="resumen-cell-val">{fmtMXN(comision)}</div>
            </div>
            <div className="resumen-cell">
              <div className="resumen-cell-label">CLABE</div>
              <div className="resumen-cell-val" style={{ fontSize: 11, letterSpacing: '0.04em' }}>
                ···{formData.clabe.slice(-4)}
              </div>
            </div>
            <div className="resumen-cell">
              <div className="resumen-cell-label">Cantidad</div>
              <div className="resumen-cell-val">
                {formData.cantidad} boleto{formData.cantidad > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="aviso-pago" style={{ marginTop: 8, borderLeftColor: '#6b6b6b' }}>
        <strong>Fecha de pago:</strong><br />
        El depósito a tu CLABE se realiza dentro de los <strong>5 días hábiles posteriores al evento</strong>, una vez confirmada la entrega del boleto al comprador.
      </div>

      <div className="terms-wrap">
        <input
          type="checkbox"
          id="s3_terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <label htmlFor="s3_terms">
          Confirmo que el boleto me pertenece, que el precio listado no supera el
          precio original de compra, y acepto los{' '}
          <span
            onClick={onOpenTerms}
            style={{
              color: 'var(--ink)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            Términos de Cesión de Fandom
          </span>
          .
        </label>
      </div>

      {error && <div className="form-error" style={{ display: 'block' }}>{error}</div>}
    </div>
  );
}