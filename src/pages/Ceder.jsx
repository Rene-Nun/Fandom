import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMISION_FANDOM } from '../data/cederData.js';
import Step1Boleto from '../components/ceder/Step1Boleto.jsx';
import Step2Cuenta from '../components/ceder/Step2Cuenta.jsx';
import Step3Confirmar from '../components/ceder/Step3Confirmar.jsx';
import CesionModal from '../components/ceder/CesionModal.jsx';

export default function Ceder() {
  const navigate = useNavigate();

  // Sesión (lazy para evitar flash de redirect)
  const [celular] = useState(() => localStorage.getItem('yunus_celular') || '');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    evento: '',
    fechaEvento: '',
    zona: '',
    cantidad: 1,
    precio: '',
    clabe: '',
  });
  const [imgs, setImgs] = useState({
    screenshot: null,
    ineFrente: null,
    ineReverso: null,
    selfie: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedClabe, setSavedClabe] = useState(null);
  const [useNewClabe, setUseNewClabe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cesionModalOpen, setCesionModalOpen] = useState(false);

  // Título de la página
  useEffect(() => {
    const prev = document.title;
    document.title = 'Fandom — Ceder boleto';
    return () => { document.title = prev; };
  }, []);

  // Redirect si no hay sesión
  useEffect(() => {
    if (!celular) navigate('/', { replace: true });
  }, [celular, navigate]);

  // Verificar KYC
  useEffect(() => {
    if (!celular) return;
    (async () => {
      try {
        const res = await fetch(`/api/verificar-kyc?celular=${encodeURIComponent(celular)}`);
        const data = await res.json();
        if (data.kycCompletado && data.clabeExistente) {
          setSavedClabe(data.clabeExistente);
          setFormData((prev) => ({ ...prev, clabe: data.clabeExistente }));
        }
      } catch {
        // Silencioso: se pedirá CLABE manual
      }
    })();
  }, [celular]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setStepError = (stepKey, msg) => {
    setErrors((prev) => ({ ...prev, [stepKey]: msg }));
  };

  // ─── Validaciones ───
  const validateStep1 = () => {
    if (!formData.evento) return 'Selecciona el evento.';
    if (!formData.fechaEvento) return 'Selecciona la fecha.';
    if (!formData.zona.trim()) return 'Indica la zona o tipo de boleto.';
    if (!formData.precio || parseFloat(formData.precio) <= 0) return 'Ingresa el precio de venta.';
    if (!imgs.screenshot) return 'Sube el comprobante de compra.';
    return null;
  };
  const validateStep2 = () => {
    if (formData.clabe.trim().length !== 18) return 'La CLABE debe tener exactamente 18 dígitos.';
    return null;
  };
  const validateStep3 = () => {
    if (!termsAccepted) return 'Debes aceptar los términos para continuar.';
    return null;
  };

  // ─── Navegación ───
  const handleContinue = async () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) return setStepError('step1', err);
      setErrors({});
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setStepError('step2', err);
      setErrors({});
      setStep(3);
      window.scrollTo(0, 0);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) return setStepError('step3', err);
      await submitSolicitud();
    }
  };

  const handleBack = () => {
    if (success) {
      navigate('/', { replace: true });
      return;
    }
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  };

  // ─── Submit ───
  const submitSolicitud = async () => {
    setSubmitting(true);
    setStepError('step3', '');

    const precio = parseFloat(formData.precio);
    const listado = Math.round(precio * (1 + COMISION_FANDOM));

    const payload = {
      celular,
      evento: formData.evento,
      fechaEvento: formData.fechaEvento,
      zona: formData.zona.trim(),
      precioCedente: precio,
      precioListado: listado,
      clabe: formData.clabe.trim(),
      screenshot: imgs.screenshot,
      ineFrente: imgs.ineFrente,
      ineReverso: imgs.ineReverso,
      selfie: imgs.selfie,
      cantidad: formData.cantidad,
    };

    try {
      const res = await fetch('/api/ceder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStepError('step3', data.error || 'Error al enviar. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      setStepError('step3', 'Error de conexión. Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  const handleClabeOption = (useNew) => {
    setUseNewClabe(useNew);
    setFormData((prev) => ({
      ...prev,
      clabe: useNew ? '' : savedClabe || '',
    }));
  };

  // ─── Pantalla de éxito ───
  if (success) {
    return (
      <div className="ceder-page">
        <header className="ceder-header">
          <div className="ceder-header-inner">
            <button className="btn-back" onClick={handleBack} aria-label="Volver">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 5 5 12 12 19" />
              </svg>
            </button>
            <span className="header-step-label">Paso 3 de 3</span>
          </div>
        </header>

        <div className="progress-steps">
          <div className="progress-step done" />
          <div className="progress-step done" />
          <div className="progress-step active" />
        </div>

        <div className="ceder-success">
          <div className="exito-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="exito-title">
            Boleto<br />enviado
          </div>
          <p className="exito-sub">
            Recibimos tu solicitud. Fandom revisará tu boleto y comprobante en las
            próximas horas.
          </p>
          <div className="exito-pasos">
            <div className="exito-paso">
              <span className="exito-paso-n">01</span>
              <span className="exito-paso-t">Fandom verifica tu boleto y comprobante de compra.</span>
            </div>
            <div className="exito-paso">
              <span className="exito-paso-n">02</span>
              <span className="exito-paso-t">Si todo está en orden, tu boleto aparece en el Marketplace.</span>
            </div>
            <div className="exito-paso">
              <span className="exito-paso-n">03</span>
              <span className="exito-paso-t">Cuando haya un comprador, te contactamos para coordinar la transferencia en Ticketmaster.</span>
            </div>
            <div className="exito-paso">
              <span className="exito-paso-n">04</span>
              <span className="exito-paso-t">Recibes el pago completo a tu CLABE dentro de los 3 días hábiles posteriores al evento.</span>
            </div>
          </div>
          <button className="btn-ir-marketplace" onClick={() => navigate('/')}>
            Volver al Marketplace →
          </button>
        </div>
      </div>
    );
  }

  // ─── Wizard ───
  return (
    <div className="ceder-page">
      <header className="ceder-header">
        <div className="ceder-header-inner">
          <button className="btn-back" onClick={handleBack} aria-label="Volver">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
          </button>
          <span className="header-step-label">Paso {step} de 3</span>
        </div>
      </header>

      <div className="progress-steps">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`progress-step ${i < step ? 'done' : i === step ? 'active' : ''}`}
          />
        ))}
      </div>

      <main className="ceder-main">
        {step === 1 && (
          <Step1Boleto
            formData={formData}
            updateField={updateField}
            imgs={imgs}
            setImgs={setImgs}
            error={errors.step1}
          />
        )}
        {step === 2 && (
          <Step2Cuenta
            formData={formData}
            updateField={updateField}
            savedClabe={savedClabe}
            useNewClabe={useNewClabe}
            onClabeOptionChange={handleClabeOption}
            error={errors.step2}
          />
        )}
        {step === 3 && (
          <Step3Confirmar
            formData={formData}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            onOpenTerms={() => setCesionModalOpen(true)}
            error={errors.step3}
          />
        )}
      </main>

      <div className="step-footer">
        <div className="step-footer-inner">
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : step < 3 ? 'Continuar →' : 'Enviar solicitud →'}
          </button>
        </div>
      </div>

      {cesionModalOpen && <CesionModal onClose={() => setCesionModalOpen(false)} />}
    </div>
  );
}