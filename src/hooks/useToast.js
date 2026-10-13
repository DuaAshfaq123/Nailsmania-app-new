import {useToastContext} from '../context/ToastContext';

// Public API: useToast().show('Message', {type: 'success' | 'error' | 'info'})
const useToast = () => useToastContext();

export default useToast;
