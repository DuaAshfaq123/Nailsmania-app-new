import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';
import {debugError} from '../utils/debugLog';

const ConfirmContext = createContext(null);

// Global confirmation-dialog host — mounted once at the app root, mirroring ToastProvider,
// so any screen or hook can raise a themed confirm dialog without prop-drilling. This
// replaces React Native's Alert.alert, whose OS-rendered box can't be themed and looks
// foreign in both light and dark mode.
export const ConfirmProvider = ({children}) => {
  const [dialog, setDialog] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  // Holds the promise resolver for the currently open dialog. A ref (not state) because
  // it's read inside callbacks that must not re-create on every render.
  const resolverRef = useRef(null);

  // Settles the open dialog exactly once. Guards against double-settle (e.g. a backdrop
  // tap racing the cancel button), which would otherwise leave a dangling resolver.
  const settle = useCallback(result => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    setIsRunning(false);
    if (resolve) {
      resolve(result);
    }
  }, []);

  // Opens a dialog and resolves to true/false once the user chooses.
  //
  // Pass an async `onConfirm` when the confirmed action takes time (account deletion):
  // the dialog stays open showing a spinner on the confirm button until it settles, so
  // the feedback appears where the user tapped. Without it the dialog just closes and
  // the caller drives its own loading state.
  const confirm = useCallback(options => {
    return new Promise(resolve => {
      resolverRef.current = resolve;
      setIsRunning(false);
      setDialog(options);
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (isRunning) {
      return;
    }
    settle(false);
  }, [isRunning, settle]);

  const handleConfirm = useCallback(async () => {
    const action = dialog?.onConfirm;
    if (!action) {
      settle(true);
      return;
    }

    setIsRunning(true);
    try {
      await action();
    } catch (error) {
      // The action owns its own error reporting (toast etc.). Swallowing here keeps a
      // rejected action from becoming an unhandled rejection and leaving the dialog
      // stuck open with a permanent spinner.
      debugError('ConfirmContext', 'Confirmed action failed', error);
    } finally {
      settle(true);
    }
  }, [dialog, settle]);

  const value = useMemo(() => ({confirm}), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        visible={dialog != null}
        title={dialog?.title}
        message={dialog?.message}
        confirmLabel={dialog?.confirmLabel}
        cancelLabel={dialog?.cancelLabel}
        destructive={dialog?.destructive}
        icon={dialog?.icon}
        loading={isRunning}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext must be used within ConfirmProvider');
  }
  return context;
};
