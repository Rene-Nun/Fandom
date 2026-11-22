import { useState } from 'react';

export default function PagoSheet({ evento, enganche, onClose }) {
  const [copied, setCopied] = useState({ clabe: false, soriana: false, pespay: false });

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 2000);
    });
  };

  const waLink = `https://wa.me/526563161314?text=Hola%2C%20aquí%20mi%20comprobante%20de%20pago%20para%20${encodeURIComponent(evento)}`;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-container">
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Pendiente de pago
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 4 }}>
          {evento}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 20 }}>
          ${Number(enganche).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN enganche
        </div>

        {/* SPEI */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
          Opción 1 — SPEI · Sin comisión
        </div>
        <div style={{ border: '1px solid var(--border)', padding: 14, background: '#fafafa', marginBottom: 6 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
            CLABE
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: 'var(--ink)', fontWeight: 700, letterSpacing: '0.04em' }}>
            7211 8010 0037 0012 23
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Beneficiario</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Christian Nuñez</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Banco</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Albo</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => copy('721180100037001223', 'clabe')}
          style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--ink)', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--ink)', cursor: 'pointer', marginBottom: 20 }}
        >
          {copied.clabe ? '✓ Copiada' : 'Copiar CLABE'}
        </button>

        {/* Soriana */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
          Opción 2 — Soriana en efectivo · $12 comisión
        </div>
        <div style={{ border: '1px solid var(--border)', padding: 14, background: '#fafafa', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
            Referencia Dapp · dile al cajero "CB"
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, color: 'var(--ink)', fontWeight: 700 }}>
            028890581575
          </div>
        </div>
        <button
          onClick={() => copy('028890581575', 'soriana')}
          style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--ink)', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--ink)', cursor: 'pointer', marginBottom: 20 }}
        >
          {copied.soriana ? '✓ Copiada' : 'Copiar referencia'}
        </button>

        {/* PESPay */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
          Opción 3 — Walmart, Bodega, Sam's, Farmacias del Ahorro · $10–$15 comisión
        </div>
        <div style={{ border: '1px solid var(--border)', padding: 14, background: '#fafafa', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
            Referencia PESPay · 20 dígitos
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: 'var(--ink)', fontWeight: 700, wordBreak: 'break-all', letterSpacing: '0.04em' }}>
            10036314159276640833
          </div>
        </div>
        <button
          onClick={() => copy('10036314159276640833', 'pespay')}
          style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--ink)', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--ink)', cursor: 'pointer', marginBottom: 20 }}
        >
          {copied.pespay ? '✓ Copiada' : 'Copiar referencia'}
        </button>

        <div style={{ border: '1px solid rgba(239,68,68,0.3)', padding: 14, background: 'rgba(239,68,68,0.04)', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>
            Si tu pago no se refleja en un máximo de{' '}
            <strong style={{ color: '#ef4444' }}>12 horas</strong>, tu reserva será
            cancelada y el boleto quedará disponible para otros fans.
          </div>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, background: '#25D366', color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: 10 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar comprobante por WhatsApp
        </a>

        <button
          onClick={onClose}
          style={{ width: '100%', padding: 12, background: 'transparent', color: 'var(--muted)', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          Cerrar
        </button>
      </div>
    </>
  );
}