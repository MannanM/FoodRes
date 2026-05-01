import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedsContext } from '../context/MedsContext';
import { calculateMedsMetrics } from '../lib/medStorage';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Plus, Trash2, Package, Clock, ShieldCheck } from 'lucide-react';

const MedicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, deleteBatch, deleteMedication } = useMedsContext();

  const med = state.medications.find(m => m.id === id);
  const batches = useMemo(() => state.batches.filter(b => b.medicationId === id), [state.batches, id]);

  const metrics = useMemo(() => {
    if (!med) return null;
    return calculateMedsMetrics(med, batches);
  }, [med, batches]);

  if (!med || !metrics) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Medication not found.</p>
        <button onClick={() => navigate('/meds')} className="mt-4 text-blue-600 font-medium">Back to Meds</button>
      </div>
    );
  }

  const handleDeleteMedication = () => {
    if (window.confirm('Are you sure you want to delete this medication and all its history?')) {
      deleteMedication(id!);
      navigate('/meds');
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    if (window.confirm('Delete this stock entry?')) {
      deleteBatch(batchId);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/meds')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">{med.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/meds/edit/${med.id}`)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Edit size={24} />
          </button>
          <button
            onClick={handleDeleteMedication}
            className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Medication"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Estimated Stock</p>
          <p className="text-xl font-bold text-slate-800">
            {metrics.currentEstimatedInventory.toFixed(1)} <span className="text-sm font-normal text-slate-500">{med.baseUnit}</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Run-Out Date</p>
          <p className="text-xl font-bold text-slate-800">
            {metrics.runOutDate ? format(metrics.runOutDate, 'MMM d, yyyy') : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">{Math.round(metrics.daysRemaining)} days left</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-600" />
          Active Schedule
        </h3>
        <div className="flex justify-between text-sm">
          <div className="text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Morning</p>
            <p className="font-bold text-slate-700">{med.scheduleDose.morning} {med.baseUnit}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Midday</p>
            <p className="font-bold text-slate-700">{med.scheduleDose.midday} {med.baseUnit}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Night</p>
            <p className="font-bold text-slate-700">{med.scheduleDose.night} {med.baseUnit}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            Stock History
          </h3>
          <button
            onClick={() => navigate(`/meds/add-batch/${med.id}`)}
            className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Add Packet
          </button>
        </div>

        <div className="space-y-2">
          {batches.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm italic bg-white rounded-2xl border border-dashed border-slate-200">
              No stock history recorded.
            </p>
          ) : (
            [...batches].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map(batch => (
              <div key={batch.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <Package size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">
                      {batch.quantity} × {batch.sizePerQuantity} {med.baseUnit}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      ADDED: {format(new Date(batch.dateAdded), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {batch.price && <span className="text-sm font-bold text-slate-600">${batch.price.toFixed(2)}</span>}
                  <button
                    onClick={() => handleDeleteBatch(batch.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-600" />
          Last Stock Take
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The current estimated inventory is calculated based on the stock take performed on 
          <span className="font-bold text-slate-700 ml-1">{format(new Date(med.lastStockTakeDate), 'MMMM d, yyyy')}</span>. 
          Modify the dosage schedule if you need to perform a new physical stock take.
        </p>
      </div>
    </div>
  );
};

export default MedicationDetail;
