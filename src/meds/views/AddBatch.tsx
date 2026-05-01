import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedsContext } from '../context/MedsContext';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';
import { ArrowLeft, Save, Package } from 'lucide-react';

const AddBatch = () => {
  const { medId } = useParams();
  const navigate = useNavigate();
  const { state, addBatch } = useMedsContext();

  const med = state.medications.find(m => m.id === medId);
  
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(0);
  const [price, setPrice] = useState<number | ''>('');

  if (!med) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Medication not found.</p>
        <button onClick={() => navigate('/meds')} className="mt-4 text-blue-600">Back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBatch = {
      id: uuidv4(),
      medicationId: medId!,
      quantity,
      sizePerQuantity: size,
      dateAdded: formatISO(new Date(), { representation: 'date' }),
      price: price === '' ? undefined : Number(price)
    };

    addBatch(newBatch);
    navigate('/meds');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/meds')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add Stock</h2>
          <p className="text-slate-500 text-sm">{med.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-center py-6 text-blue-600">
            <Package size={64} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {med.baseUnit === 'unit/tablet' || med.baseUnit === 'mg' ? 'Number of Tablets' : 
                 med.baseUnit === 'ml' ? 'Number of Bottles' : 'Quantity'}
              </label>
              <input
                required
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
              <input
                required
                type="number"
                step="any"
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., 500 (${med.baseUnit})`}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Total added: <span className="font-bold text-slate-600">{(quantity * size).toFixed(1)} {med.baseUnit}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price Paid (Total)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-3 pl-8 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Add to Inventory
        </button>
      </form>
    </div>
  );
};

export default AddBatch;
