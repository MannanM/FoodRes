import type { FC } from 'react';
import { useZxing } from 'react-zxing';

interface ScannerProps {
  onResult: (result: string) => void;
  onCancel: () => void;
}

export const Scanner: FC<ScannerProps> = ({ onResult, onCancel }) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.getText());
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative">
        <video ref={ref} className="w-full h-full object-cover" />
        <div className="absolute inset-0 border-4 border-primary/50 m-12 rounded-xl pointer-events-none"></div>
      </div>
      <div className="bg-black p-6 pb-safe text-center">
        <p className="text-white mb-4">Position barcode within the frame</p>
        <button 
          onClick={onCancel}
          className="px-6 py-2 bg-slate-800 text-white rounded-full font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
