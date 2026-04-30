import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-slate-900 text-white p-4 rounded-xl shadow-xl z-50 flex flex-col space-y-3">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm">New app update available!</p>
        <button onClick={close} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <button 
        onClick={() => updateServiceWorker(true)}
        className="w-full py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} /> Reload to Update
      </button>
    </div>
  );
}
