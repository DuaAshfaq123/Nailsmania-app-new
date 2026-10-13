import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);
const ToastStateContext = createContext(null);
const DEFAULT_DURATION_MS = 3000;

// Global toast host — mounted once at the app root (above Routing) so any screen
// can trigger a themed toast via useToast() without prop-drilling or a portal library.
export const ToastProvider = ({children}) => {
  const [toast, setToast] = useState(null);
  const dismissTimerRef = useRef(null);
  const nextIdRef = useRef(0);

  const hide = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setToast(null);
  }, []);

  // `action` is an optional {label, onPress} shown as a trailing button — used for
  // reversible operations (e.g. "Removed from Saved" + Undo) so a destructive-feeling
  // action needs no confirmation dialog up front.
  const show = useCallback((message, options = {}) => {
    const {type = 'info', duration = DEFAULT_DURATION_MS, action} = options;
    nextIdRef.current += 1;
    const id = nextIdRef.current;

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    setToast({id, message, type, action});
    dismissTimerRef.current = setTimeout(() => {
      // Only clear if this timer's toast is still the one showing (a newer show()
      // call may have already replaced it and armed its own timer).
      setToast(current => (current?.id === id ? null : current));
      dismissTimerRef.current = null;
    }, duration);
  }, []);

  const value = useMemo(() => ({show, hide}), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      <ToastStateContext.Provider value={toast}>
        {children}
        <Toast toast={toast} onDismiss={hide} />
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

export const useToastState = () => useContext(ToastStateContext);
