import { useRef } from 'react';
import { FECHAS_EVENTOS, COMISION_FANDOM } from '../../data/cederData.js';
import { compressImage } from '../../utils/imageCompression.js';

function fmtMXN(n) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MXN';
}

export default function Step1Boleto({ formData, updateField, imgs, setImgs, error }) {
  const fileInputRef = useRef(null);

  const fechas = FECHAS_EVENTOS[formData.evento] || [];
  const fechaDisabled = fechas.length === 0;

  const precioNum = parseFloat(formData.precio);
  const showPreview = !isNaN(precioNum) && precioNum > 0;
  const listado = showPreview ? Math.round(precioNum * (1 + COMISION_FANDOM)) : 0;
  const comision = showPreview ? listado - precioNum : 0;

  const handleEventoChange = (e) => {
    updateField('evento', e.target.value);
    updateField('fechaEvento', '');
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    setImgs((prev) => ({ ...prev, screenshot: base64 }));
    e.target.value = '';
  };

  return (
    <div className="step-body fade-up">
      <div className="step-title">Tu boleto</div>
      <p className="step-sub">
        ¿Tienes un boleto que ya no puedes usar? Ponlo aquí y ayuda a otro fan a vivir
        el momento.
      </p>

      <div className="form-group">
        <label className="form-label">Evento</label>
        <select className="form-input" value={formData.evento} onChange={handleEventoChange}>
          <option value="">Selecciona el evento</option>
          <option value="Harry Styles">Harry Styles</option>
          <option value="Enjambre Estadio GNP">Enjambre Estadio GNP</option>
          <option value="Bruno Mars">Bruno Mars</option>
          <option value="Rosalía: Lux Tour">Rosalía: Lux Tour</option>
          <option value="Vans Warped Tour">Vans Warped Tour</option>
          <option value="Baja Beach Fest">Baja Beach Fest</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Fecha del evento</label>
        <select
          className="form-input"
          value={formData.fechaEvento}
          onChange={(e) => updateField('fechaEvento', e.target.value)}
          disabled={fechaDisabled}
        >
          {fechas.length === 0 ? (
            <option value="">{formData.evento ? 'Sin fechas disponibles' : 'Primero selecciona el evento'}</option>
          ) : (
            <>
              <option value="">Selecciona la fecha</option>
              {fechas.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Zona / tipo de boleto</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ej. Floor General, Gradería Alta, VIP..."
          value={formData.zona}
          onChange={(e) => updateField('zona', e.target.value)}
        />
        <div className="field-hint">
          Para conciertos en recintos, incluye zona, fila y lugar si aplica.<br />
          <code>Ej. Gradería Norte · Fila 12 · Asiento 34</code>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">¿Cuántos boletos?</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="qty-option"
              onClick={() => updateField('cantidad', n)}
              style={{
                borderColor: formData.cantidad === n ? 'var(--ink)' : 'var(--border)',
                background: formData.cantidad === n ? '#f0f0f0' : '#fafafa',
              }}
            >
              <div className="qty-num">{n}</div>
              <div className="qty-label">{n === 1 ? 'boleto' : 'boletos'}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 'clamp(10px, 2vw, 12px)', color: 'var(--muted)', lineHeight: 1.6 }}>
          Si son más de uno, se venden juntos como un solo listado.
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Precio al que quieres vender (MXN)</label>
        <input
          type="number"
          className="form-input"
          placeholder="Ej. 3500"
          min="1"
          inputMode="numeric"
          value={formData.precio}
          onChange={(e) => updateField('precio', e.target.value)}
        />
        <div className="precio-aviso">
          El precio no puede ser mayor al que pagaste originalmente. Fandom lo
          verificará con tu comprobante de compra.
        </div>
        {showPreview && (
          <div className="precio-preview visible">
            <div className="precio-preview-row">
              <span className="precio-preview-label">Tú recibirás</span>
              <span className="precio-preview-val destacado">{fmtMXN(precioNum)}</span>
            </div>
            <div className="precio-preview-row">
              <span className="precio-preview-label">Precio en marketplace</span>
              <span className="precio-preview-val">{fmtMXN(listado)}</span>
            </div>
            <div className="precio-preview-row">
              <span className="precio-preview-label">Comisión Fandom (6%)</span>
              <span className="precio-preview-val">{fmtMXN(comision)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Comprobante de compra</label>
        <div
          className={`upload-area-full ${imgs.screenshot ? 'has-img' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleScreenshotChange}
          />
          {imgs.screenshot && <img src={imgs.screenshot} alt="Preview" className="preview" />}
          {imgs.screenshot && (
            <div className="upload-check">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <polyline points="8.5 10 12 6.5 15.5 10" />
            <line x1="12" y1="6.5" x2="12" y2="17.5" />
          </svg>
          <span className="upload-area-label">
            {imgs.screenshot ? 'Comprobante cargado ✓' : 'Screenshot del recibo de compra'}
          </span>
        </div>
      </div>

      {error && <div className="form-error" style={{ display: 'block' }}>{error}</div>}
    </div>
  );
}