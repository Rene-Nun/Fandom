import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [celular, setCelular] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState('terms');

  // Hidratar sesión al montar
  useEffect(() => {
    const stored = localStorage.getItem('yunus_celular');
    if (stored) setCelular(stored);
  }, []);

  const login = useCallback((cel) => {
    localStorage.setItem('yunus_celular', cel);
    setCelular(cel);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('yunus_celular');
    localStorage.removeItem('yunus_historial');
    setCelular(null);
  }, []);

  const openAuth = useCallback((action, onSuccess) => {
    setPendingAction({ action: action || 'general', onSuccess });
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPendingAction(null);
  }, []);

  // Se llama cuando AuthModal termina con éxito (login o registro)
  const onAuthSuccess = useCallback(() => {
    const action = pendingAction;
    setAuthOpen(false);
    setPendingAction(null);
    if (action?.onSuccess) action.onSuccess();
    return action?.action;
  }, [pendingAction]);

  const openLegal = useCallback((type) => {
    setLegalType(type);
    setLegalOpen(true);
  }, []);

  const closeLegal = useCallback(() => setLegalOpen(false), []);

  const value = {
    celular,
    isLoggedIn: !!celular,
    login,
    logout,
    authOpen,
    openAuth,
    closeAuth,
    onAuthSuccess,
    pendingAction,
    legalOpen,
    legalType,
    openLegal,
    closeLegal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}