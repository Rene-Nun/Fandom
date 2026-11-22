import { useEffect, useState } from 'react';
import { useApp } from '../context/AppProvider.jsx';

export default function AuthModal() {
  const { authOpen, closeAuth, login, onAuthSuccess } = useApp();
  const [view, setView] = useState('login');

  // Login state
  const [loginCel, setLoginCel] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regNombre, setRegNombre] = useState('');
  const [regCel, setRegCel] = useState('');
  const [regEdad, setRegEdad] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { openLegal } = useApp();

  // Reset al abrir
  useEffect(() => {
    if (authOpen) {
      setView('login');
      setLoginCel('');
      setLoginError('');
      setRegNombre('');
      setRegCel('');
      setRegEdad('');
      setRegTerms(false);
      setRegError('');
      setLoginLoading(false);
      setRegLoading(false);
    }
  }, [authOpen]);

  // Bloqueo de scroll del body
  useEffect(() => {
    if (authOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [authOpen]);

  if (!authOpen) return null;

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    if (loginCel.length !== 10) {
      setLoginError('Ingresa 10 dígitos válidos.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    const numero = '+52' + loginCel;
    try {
      const res = await fetch('/api/historial?celular=' + encodeURIComponent(numero));
      if (res.status === 404) {
        setLoginError('Número no registrado. Crea tu cuenta primero.');
        setLoginLoading(false);
        return;
      }
      login(numero);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('yunus_historial', JSON.stringify(data.historial || []));
      }
      setLoginLoading(false);
      onAuthSuccess();
    } catch {
      // Optimista ante fallo de red
      login(numero);
      setLoginLoading(false);
      onAuthSuccess();
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    if (!regNombre || regCel.length !== 10 || !regEdad || parseInt(regEdad) < 18) {
      setRegError('Completa todos los campos. Debes ser mayor de 18 años.');
      return;
    }
    if (!regTerms) {
      setRegError('Debes aceptar los términos para continuar.');
      return;
    }
    setRegError('');
    setRegLoading(true);

    const payload = {
      celular: '+52' + regCel,
      Nombre_completo: regNombre,
      Edad: regEdad,
      Entidad_federativa: '',
      Codigo_postal: '',
      Ingreso_mensual: '',
      Marca_celular: '',
      Gastos_celular: '',
      Gastos_vivienda: '',
      Gastos_automovil: '',
      Dependientes: '',
      Historial_crediticio: '',
      Otras_deudas: '',
    };

    try {
      const res = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Error al crear la cuenta.');
        setRegLoading(false);
        return;
      }
      login('+52' + regCel);
      localStorage.setItem('yunus_historial', JSON.stringify([]));
      setRegLoading(false);
      onAuthSuccess();
    } catch {
      setRegError('Error de conexión. Intenta de nuevo.');
      setRegLoading(false);
    }
  };

  return (
    <div
      id="authModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuth();
      }}
    >
      <div className="auth-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="auth-handle">
          <div className="auth-handle-bar" />
        </div>
        <div className="auth-body">
          {view === 'login' ? (
            <>
              <div className="auth-title">Iniciar sesión</div>
              <div className="auth-sub">Ingresa tu número para continuar.</div>
              <div className="input-row-acc">
                <span className="prefix-acc">+52</span>
                <input
                  className="input-acc"
                  type="tel"
                  placeholder="10 dígitos"
                  maxLength={10}
                  inputMode="numeric"
                  value={loginCel}
                  onChange={(e) => setLoginCel(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <button
                className="btn-acc-primary"
                onClick={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? 'Verificando...' : 'Entrar →'}
              </button>
              {loginError && <div className="acc-error">{loginError}</div>}
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 20,
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                ¿Sin cuenta?{' '}
                <span
                  onClick={() => setView('register')}
                  style={{
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                >
                  Regístrate aquí
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="auth-title">Crear cuenta</div>
              <div className="auth-sub">
                Solo lo esencial. Sin buró, sin complicaciones.
              </div>
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Celular</label>
                <div className="prefix-wrap">
                  <span className="prefix-tag">+52</span>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10 dígitos"
                    maxLength={10}
                    inputMode="numeric"
                    value={regCel}
                    onChange={(e) => setRegCel(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Edad</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ej. 25"
                  min={18}
                  max={99}
                  value={regEdad}
                  onChange={(e) => setRegEdad(e.target.value)}
                />
              </div>
              <div className="terms-wrap">
                <input
                  type="checkbox"
                  id="auth_terms"
                  checked={regTerms}
                  onChange={(e) => setRegTerms(e.target.checked)}
                />
                <label htmlFor="auth_terms">
                  Acepto los{' '}
                  <span
                    onClick={() => openLegal('terms')}
                    style={{
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Términos
                  </span>{' '}
                  y la{' '}
                  <span
                    onClick={() => openLegal('privacy')}
                    style={{
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Política de privacidad
                  </span>
                </label>
              </div>
              {regError && <div className="acc-error">{regError}</div>}
              <button
                className="btn-acc-primary"
                onClick={handleRegister}
                disabled={regLoading}
                style={{ marginTop: 14 }}
              >
                {regLoading ? 'Creando cuenta...' : 'Crear cuenta →'}
              </button>
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 16,
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                ¿Ya tienes cuenta?{' '}
                <span
                  onClick={() => setView('login')}
                  style={{
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                >
                  Inicia sesión
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}