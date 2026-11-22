import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppProvider.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, openAuth } = useApp();

  const handleSession = () => {
    if (isLoggedIn) {
      navigate('/boveda');
    } else {
      openAuth('general');
    }
  };

  const handleCeder = () => {
    if (isLoggedIn) {
      navigate('/ceder');
    } else {
      openAuth('ceder', () => navigate('/ceder'));
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <button
            className="btn-session"
            aria-label={isLoggedIn ? 'Mi Bóveda' : 'Iniciar sesión'}
            onClick={handleSession}
          >
            {isLoggedIn ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
          <img
            src="/icon.PNG"
            alt="Fandom"
            className="header-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <button className="btn-ceder" onClick={handleCeder}>
          Ceder boleto
        </button>
      </div>
    </header>
  );
}