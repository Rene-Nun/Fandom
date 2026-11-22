import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppProvider.jsx';
import { openLegal } from './_shared'; // helper abajo

// ⚠️ Nota: para evitar dependencias circulares, recibe openLegal vía contexto
// en lugar de import directo. Reemplaza la línea anterior si prefieres.

export default function EventosPanel({ evento, onClose }) {
  const { isLoggedIn, openAuth } = useApp();
  const [step, setStep] = useState(0); // 0=fechas, 1=boletos, 2=plan, 3=checkout
  const [fecha, setFecha] = useState(null);
  const [boleto, setBoleto] = useState(null);
  const [plan, setPlan] = useState(2);
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(null); // payload tras checkout

  const { openLegal: openLegalCtx } = useApp();

  // Reset al abrir nuevo evento
  useEffect(() => {
    if (!evento) return;
    const opciones = [2, 3, 4].filter((q) => q <= (evento.maxQuincenas || 4));
    setPlan(opciones[0]);
    setStep(0);
    setFecha(null);
    setBoleto(null);
    setBoletos([]);
    setTerminos(false);
    setError('');
    setPagoExitoso(null);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [evento]);

  // Fetch de boletos al abrir
  const cargarBoletos = useCallback(async () => {
    if (!evento) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace');
      const data = await res.json();
      const todos = data.boletos || [];
      const filtrados = todos.filter(
        (b) =>
          b.evento &&
          b.evento.toLowerCase().includes(evento.apiKey.toLowerCase().split(' ')[0])
      );
      setBoletos(filtrados);
      return filtrados;
    } catch {
      setBoletos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [evento]);

  useEffect(() => {
    if (!evento) return;
    (async () => {
      const filtrados = await cargarBoletos();
      // Festival sin fechas: ir directo a la lista
      if (!evento.fechas || evento.fechas.length === 0) {
        setStep(1);
      } else {
        setStep(0);
      }
      // cache para selector de fechas
      void filtrados;
    })();
  }, [evento, cargarBoletos]);

  if (!evento) return null;

  const opciones = [2, 3, 4].filter((q) => q <= (evento.maxQuincenas || 4));
  const maxQ = evento.maxQuincenas || 4;
  const mesesLabel = { 2: '1 mes', 3: '~1.5 meses', 4: '2 meses' };

  const formatFecha = (str) => {
    if (!str) return '';
    const d = new Date(str + 'T12:00:00');
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fmt = (n) =>
    Math.round(n).toLocaleString('es-MX', { maximumFractionDigits: 0 });

  const precioTotal = boleto ? parseFloat(boleto.precioReventa) || 0 : 0;
  const enganche = precioTotal * 0.15;
  const cuota = (precioTotal * 0.85) / plan;

  const volver = () => {
    if (step === 1) {
      if (evento.fechas && evento.fechas.length > 0) {
        setStep(0);
        setFecha(null);
        setBoleto(null);
      } else {
        onClose();
      }
    } else if (step === 2) {
      setStep(1);
      setBoleto(null);
    } else if (step === 3) {
      if (!pagoExitoso) setStep(2);
    }
  };

  const continuarPlan = () => {
    if (!isLoggedIn) {
      openAuth('checkout', () => {
        setStep(3);
      });
      return;
    }
    setStep(3);
  };

  const submitCheckout = async () => {
    if (!terminos) {
      setError('Debes aceptar los términos para continuar.');
      return;
    }
    setError('');
    setEnviando(true);

    const celular = localStorage.getItem('yunus_celular') || '';
    const nombre = localStorage.getItem('yunus_nombre') || celular;

    const payload = {
      celular,
      nombre,
      evento: evento.name,
      zona: boleto.zona || 'General',
      fechaEvento: fecha,
      precioTotal,
      enganche: Math.round(enganche),
      totalCuotas: plan,
      cuotaQuincenal: Math.round(cuota),
      cantidad: boleto.cantidad || 1,
      boletoId: boleto.id || null,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setPagoExitoso({ enganche: Math.round(enganche) });
    } catch {
      // Modo demo: si backend no responde, mostramos la pantalla de pago igual
      setPagoExitoso({ enganche: Math.round(enganche) });
    } finally {
      setEnviando(false);
    }
  };

  // ─── Renders de cada paso ───

  const renderPasoFechas = () => (
    <>
      <div className="panel-section-label" style={{ marginTop: 4 }}>
        Selecciona la fecha
      </div>
      {evento.fechas.map((f) => {
        const disponibles = boletos.filter((b) => b.fechaEvento === f).length;
        return (
          <div
            key={f}
            className="boleto-item"
            onClick={() => {
              setFecha(f);
              setStep(1);
            }}
          >
            <div>
              <div className="boleto-item-zona">{formatFecha(f)}</div>
              <div className="boleto-item-detalle">
                {disponibles > 0
                  ? `${disponibles} listado(s) disponible(s)`
                  : 'Sin boletos listados aún'}{' '}
                · {evento.ciudad}
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        );
      })}
    </>
  );

  const renderPasoBoletos = () => {
    const filtrados = fecha ? boletos.filter((b) => b.fechaEvento === fecha) : boletos;
    return (
      <>
        <div className="panel-section-label" style={{ marginTop: 4 }}>
          Recinto · {evento.ciudad}
        </div>
        <div className="recinto-map">
          {evento.mapaImg ? (
            <img src={evento.mapaImg} alt={`Mapa ${evento.name}`} />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Mapa próximamente
              </span>
            </div>
          )}
        </div>
        <div className="panel-section-label">
          Boletos disponibles{' '}
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              padding: '2px 8px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: '1px solid var(--ink)',
            }}
          >
            {filtrados.length}
          </span>
        </div>
        {filtrados.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon">🎟</div>
            <div className="panel-empty-title">Sin boletos aún</div>
            <p className="panel-empty-sub">
              No hay boletos listados para este evento todavía.
              <br />
              ¿Tienes uno? Ponlo a trabajar.
            </p>
          </div>
        ) : (
          filtrados.map((b) => {
            const cant = b.cantidad || 1;
            return (
              <div
                key={b.id}
                className="boleto-item"
                onClick={() => {
                  setBoleto(b);
                  setStep(2);
                }}
              >
                <div>
                  <div className="boleto-item-zona">
                    {cant > 1 ? `${cant} boletos` : '1 boleto'} ·{' '}
                    {b.zona || 'Zona general'}
                  </div>
                  <div className="boleto-item-detalle">
                    {cant > 1 ? 'Se venden juntos · ' : ''}
                    {b.notas || ''}
                  </div>
                </div>
                <div>
                  <div className="boleto-item-precio">
                    ${fmt(b.precioReventa || 0)} MXN
                  </div>
                  <div className="boleto-item-sub">
                    {cant > 1 ? 'precio total del bundle' : 'precio total'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </>
    );
  };

  const renderPasoPlan = () => (
    <>
      <div className="panel-section-label" style={{ marginTop: 4 }}>
        Opciones de pago
      </div>
      <div className="plan-selector">
        {opciones.map((q) => (
          <div
            key={q}
            className={`plan-opcion ${plan === q ? 'activa' : ''}`}
            onClick={() => setPlan(q)}
          >
            <div className="plan-opcion-num">{q}</div>
            <div className="plan-opcion-label">Quincenas</div>
            <div className="plan-opcion-sub">{mesesLabel[q] || ''}</div>
          </div>
        ))}
      </div>
      <div className="panel-section-label">Desglose</div>
      <div className="plan-desglose">
        <div className="desglose-row">
          <span>Precio total</span>
          <span className="desglose-val">${fmt(precioTotal)}</span>
        </div>
        <div className="desglose-row">
          <span>Enganche (15%)</span>
          <span className="desglose-val">${fmt(enganche)}</span>
        </div>
        <div className="desglose-row">
          <span>{plan} quincenas de</span>
          <span className="desglose-val">${fmt(cuota)} c/u</span>
        </div>
        <div className="desglose-row">
          <span>Total a pagar</span>
          <span className="desglose-val">${fmt(precioTotal)}</span>
        </div>
      </div>
      <button className="btn-ver-boletos" onClick={continuarPlan}>
        Continuar →
      </button>
    </>
  );

  const renderPasoCheckout = () => {
    if (pagoExitoso) {
      return (
        <>
          <div className="solicitud-ok" style={{ padding: 0, textAlign: 'left' }}>
            <div
              style={{
                background: '#fafafa',
                border: '1px solid var(--border)',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 4,
                }}
              >
                Total a pagar ahora
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 32,
                  color: 'var(--ink)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                ${fmt(pagoExitoso.enganche)} MXN
              </div>
              <div
                style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}
              >
                Enganche del 15% · {evento.name}
              </div>
            </div>

            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              Elige cómo pagar{' '}
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--border)',
                  display: 'block',
                }}
              />
            </div>

            <PaymentOption
              title="SPEI"
              subtitle="Depósito inmediato · Sin comisión"
              bg="var(--ink)"
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 8,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 4,
                }}
              >
                CLABE
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  color: 'var(--ink)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: 10,
                }}
              >
                7211 8010 0037 0012 23
              </div>
              <CopyButton text="721180100037001223" label="Copiar CLABE" />
            </PaymentOption>

            <PaymentOption
              title="Efectivo en Soriana"
              subtitle="Depósito en 1 hr. · $12 comisión"
              bg="#3a3a3a"
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  lineHeight: 1.65,
                  marginBottom: 12,
                }}
              >
                En caja dile al cajero:{' '}
                <strong style={{ color: 'var(--ink)' }}>
                  "Depósito en control bancario Dappay"
                </strong>{' '}
                y solicita que digite <strong style={{ color: 'var(--ink)' }}>CB</strong>.
              </div>
              <div
                style={{
                  border: '1px solid var(--border)',
                  padding: 14,
                  background: '#fafafa',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 6,
                  }}
                >
                  Número de referencia
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 22,
                    color: 'var(--ink)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  028890581575
                </div>
              </div>
              <CopyButton text="028890581575" label="Copiar referencia" />
            </PaymentOption>

            <PaymentOption
              title="Efectivo en otros comercios"
              subtitle="Depósito en 1 hr. · $10–$15 comisión"
              bg="#3a3a3a"
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  lineHeight: 1.65,
                  marginBottom: 12,
                }}
              >
                Disponible en{' '}
                <strong style={{ color: 'var(--ink)' }}>
                  Walmart, Walmart Express, Bodega Aurrera, Sam's Club, Farmacias del Ahorro
                </strong>{' '}
                y más. En caja solicita un{' '}
                <strong style={{ color: 'var(--ink)' }}>Pago de servicio PESPay</strong>.
              </div>
              <div
                style={{
                  border: '1px solid var(--border)',
                  padding: 14,
                  background: '#fafafa',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: 6,
                  }}
                >
                  Número de referencia (20 dígitos)
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 16,
                    color: 'var(--ink)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    wordBreak: 'break-all',
                  }}
                >
                  10036314159276640833
                </div>
              </div>
              <CopyButton text="10036314159276640833" label="Copiar referencia" />
            </PaymentOption>

            <div
              style={{
                border: '1px solid var(--border)',
                padding: 16,
                marginBottom: 20,
                background: '#fafafa',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                Paso final
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink)',
                  lineHeight: 1.7,
                  marginBottom: 12,
                }}
              >
                Una vez que pagues, <strong>manda el comprobante</strong> (screenshot o
                recibo) al WhatsApp de Fandom. Activamos tu reserva en menos de 24 horas.
              </div>
              <a
                href={`https://wa.me/526563161314?text=Hola%2C%20aquí%20mi%20comprobante%20de%20enganche%20para%20${encodeURIComponent(
                  evento.name
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: 14,
                  background: '#25D366',
                  color: '#fff',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Enviar comprobante
              </a>
            </div>

            <button className="btn-ver-boletos" onClick={onClose}>
              Volver al marketplace
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="checkout-resumen">
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 8,
            }}
          >
            Resumen de tu orden
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 24,
              color: 'var(--ink)',
              lineHeight: 1,
            }}
          >
            {evento.name}
          </div>
          <div
            style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 12px' }}
          >
            {boleto.zona || 'Zona General'} · {boleto.cantidad || 1} boleto
            {(boleto.cantidad || 1) > 1 ? 's' : ''} ·{' '}
            {fecha ? formatFecha(fecha) : evento.fecha} · {evento.ciudad}
          </div>
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: 'var(--muted)',
              }}
            >
              <span>Total</span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: 'var(--ink)',
                }}
              >
                ${fmt(precioTotal)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: 'var(--muted)',
              }}
            >
              <span>Enganche hoy (15%)</span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: 'var(--ink)',
                }}
              >
                ${fmt(enganche)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                borderTop: '1px solid var(--border)',
                paddingTop: 10,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>Plan</span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: 'var(--ink)',
                  fontWeight: 600,
                }}
              >
                {plan} × ${fmt(cuota)}
              </span>
            </div>
          </div>
        </div>

        <div className="terms-wrap" style={{ marginBottom: 16 }}>
          <input
            type="checkbox"
            id="chk_terminos"
            checked={terminos}
            onChange={(e) => setTerminos(e.target.checked)}
          />
          <label htmlFor="chk_terminos">
            Acepto los{' '}
            <span
              onClick={() => openLegalCtx('terms')}
              style={{
                color: 'var(--ink)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Términos y Condiciones
            </span>{' '}
            y reconozco que, al apartar este boleto, si incumplo con los pagos
            quincenales, se aplicará una pena convencional equivalente al{' '}
            <strong style={{ color: 'var(--ink)' }}>30% del monto total abonado</strong>{' '}
            por concepto de daños y perjuicios al vendedor y a la plataforma.
          </label>
        </div>
        {error && <div className="acc-error">{error}</div>}
        <button
          className="btn-ver-boletos"
          onClick={submitCheckout}
          disabled={enviando}
          style={{ marginTop: 16 }}
        >
          {enviando ? 'Procesando...' : 'Confirmar reserva →'}
        </button>
      </>
    );
  };

  const headerClass = step > 0 && step < 3 && !pagoExitoso ? 'panel-header has-back' : 'panel-header';
  const titulo =
    step === 2
      ? 'Elegir plan'
      : step === 3
      ? pagoExitoso
        ? 'Pagar enganche'
        : 'Confirmar'
      : evento.name;
  const meta =
    step === 2 && boleto
      ? `${boleto.zona || 'Zona General'} · ${evento.ciudad}`
      : step === 3
      ? pagoExitoso
        ? 'Instrucciones de pago'
        : 'Confirmar reserva'
      : fecha
      ? `${formatFecha(fecha)} · ${evento.ciudad}`
      : `${evento.tag} · ${evento.ciudad}`;

  return (
    <div
      className="panel-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="panel-handle">
          <div className="panel-handle-bar" />
        </div>
        <div className={headerClass}>
          <button className="panel-back" onClick={volver}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="panel-evento-nombre">{titulo}</div>
          <div className="panel-evento-meta">{meta}</div>
          <button className="panel-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="panel-body">
          {loading ? (
            <div className="panel-loading">
              <div className="spinner-sm" />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Cargando...
              </span>
            </div>
          ) : (
            <>
              {step === 0 && renderPasoFechas()}
              {step === 1 && renderPasoBoletos()}
              {step === 2 && renderPasoPlan()}
              {step === 3 && renderPasoCheckout()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes pequeños para el checkout ───

function PaymentOption({ title, subtitle, bg, children }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: bg,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      style={{
        width: '100%',
        padding: 11,
        background: 'transparent',
        color: 'var(--ink)',
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        border: '1px solid var(--ink)',
        cursor: 'pointer',
      }}
    >
      {copied ? '✓ Copiada' : label}
    </button>
  );
}