import {useConfirmContext} from '../context/ConfirmContext';

// Public API: const confirm = useConfirm();
//   const ok = await confirm({title, message, confirmLabel, destructive});
// or, when the confirmed action is slow and should show its spinner in the dialog:
//   confirm({title, message, onConfirm: async () => { ... }});
const useConfirm = () => useConfirmContext().confirm;

export default useConfirm;
