export default function Step2Cuenta({
  formData,
  updateField,
  savedClabe,
  useNewClabe,
  onClabeOptionChange,
  error,
}) {
  const showInput = !savedClabe || useNewClabe;

  return (
    <div className="step-body fade-up">
      <div className="step-title">Tu cuenta</div>
      <p className="step-sub">
        Aquí recibirás el pago cuando pase el evento. Solo necesitamos tu CLABE.
      </p>

      <div className="form-group">
        <label className="form-label">CLABE interbancaria (18 dígitos)</label>

        {savedClabe && (
          <div style={{ marginBottom: 12 }}>
            <div
              className="terms-wrap"
              style={{ background: '#f0f0f0', borderColor: useNewClabe ? 'var(--border)' : 'var(--ink)' }}
            >
              <input
                type="radio"
                name="clabeOption"
                checked={!useNewClabe}
                onChange={() => onClabeOptionChange(false)}
              />
              <label
                onClick={() => onClabeOptionChange(false)}
                style={{ color: useNewClabe ? 'var(--muted)' : 'var(--ink)' }}
              >
                Usar CLABE guardada (***{savedClabe.slice(-4)})
              </label>
            </div>
            <div
              className="terms-wrap"
              style={{ marginTop: 8, borderColor: useNewClabe ? 'var(--ink)' : 'var(--border)' }}
            >
              <input
                type="radio"
                name="clabeOption"
                checked={useNewClabe}
                onChange={() => onClabeOptionChange(true)}
              />
              <label onClick={() => onClabeOptionChange(true)}>
                Usar otra cuenta diferente
              </label>
            </div>
          </div>
        )}

        {showInput && (
          <input
            type="tel"
            className="form-input"
            placeholder="000000000000000000"
            maxLength={18}
            inputMode="numeric"
            value={formData.clabe}
            onChange={(e) => updateField('clabe', e.target.value.replace(/\D/g, ''))}
          />
        )}
      </div>

      {error && <div className="form-error" style={{ display: 'block' }}>{error}</div>}
    </div>
  );
}