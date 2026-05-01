import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedsContext } from '../context/MedsContext';
import { calculateMedsMetrics } from '../lib/medStorage';
import { format, isPast } from 'date-fns';
import { Pill, Plus, Calendar, AlertTriangle, Clock, List } from 'lucide-react';

const MedsDashboard = () => {
  const { state } = useMedsContext();
  const navigate = useNavigate();

  const medList = useMemo(() => {
    return state.medications.map(med => {
      const metrics = calculateMedsMetrics(med, state.batches);
      return {
        ...med,
        metrics
      };
    }).sort((a, b) => a.metrics.daysRemaining - b.metrics.daysRemaining);
  }, [state]);

  const getStatusColor = (days: number) => {
    if (days < 14) return 'text-red-600 bg-red-50 border-red-100';
    if (days < 30) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-green-600 bg-green-50 border-green-100';
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Pill className="text-blue-600" />
          Meds
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/meds/routine')}
            className="bg-white text-blue-600 border border-blue-100 p-2 rounded-full shadow-sm hover:bg-blue-50 transition-colors"
            title="View Daily Routine"
          >
            <List size={24} />
          </button>
          <button
            onClick={() => navigate('/meds/add')}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {medList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
            <Pill className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">No medications tracked yet.</p>
            <button
              onClick={() => navigate('/meds/add')}
              className="mt-4 text-blue-600 font-medium"
            >
              Add your first medication
            </button>
          </div>
        ) : (
          medList.map(med => (
            <div
              key={med.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div onClick={() => navigate(`/meds/detail/${med.id}`)} className="cursor-pointer flex-1">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                    {med.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Clock size={14} />
                      {med.scheduleDose.wakeup ? `${med.scheduleDose.wakeup}${med.baseUnit} WU ` : ''}
                      {med.scheduleDose.morning ? `${med.scheduleDose.morning}${med.baseUnit} AM ` : ''}
                      {med.scheduleDose.midday ? `${med.scheduleDose.midday}${med.baseUnit} Mid ` : ''}
                      {med.scheduleDose.afternoon ? `${med.scheduleDose.afternoon}${med.baseUnit} PM ` : ''}
                      {med.scheduleDose.night ? `${med.scheduleDose.night}${med.baseUnit} Night ` : ''}
                      {med.scheduleDose.beforeBed ? `${med.scheduleDose.beforeBed}${med.baseUnit} Bed` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/meds/add-batch/${med.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Packet"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Stock</p>
                  <p className="text-lg font-bold text-slate-700">
                    {med.metrics.daysRemaining === Infinity ? '0.0' : med.metrics.daysRemaining.toFixed(1)} <span className="text-xs font-normal text-slate-500">doses</span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${getStatusColor(med.metrics.daysRemaining)}`}>
                  <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Estimated Run-Out</p>
                  <p className="text-lg font-bold">
                    {med.metrics.runOutDate ? format(med.metrics.runOutDate, 'MMM d') : 'N/A'}
                    <span className="text-xs font-normal opacity-70 ml-1">
                      ({Math.round(med.metrics.daysRemaining)}d)
                    </span>
                  </p>
                </div>
              </div>

              {med.scriptExpiryDate && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} />
                  Script Expires: {format(new Date(med.scriptExpiryDate), 'MMM d, yyyy')}
                  {isPast(new Date(med.scriptExpiryDate)) && (
                    <span className="text-red-500 font-bold flex items-center gap-1">
                      <AlertTriangle size={12} /> EXPIRED
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedsDashboard;
