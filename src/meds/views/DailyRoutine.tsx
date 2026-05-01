import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedsContext } from '../context/MedsContext';
import { ArrowLeft, Sun, Moon, Clock, AlarmClock, Coffee, CloudSun, Bed } from 'lucide-react';

const DailyRoutine = () => {
  const { state } = useMedsContext();
  const navigate = useNavigate();

  const routine = useMemo(() => {
    const wakeup = state.medications.filter(m => (m.scheduleDose.wakeup || 0) > 0);
    const morning = state.medications.filter(m => (m.scheduleDose.morning || 0) > 0);
    const midday = state.medications.filter(m => (m.scheduleDose.midday || 0) > 0);
    const afternoon = state.medications.filter(m => (m.scheduleDose.afternoon || 0) > 0);
    const night = state.medications.filter(m => (m.scheduleDose.night || 0) > 0);
    const beforeBed = state.medications.filter(m => (m.scheduleDose.beforeBed || 0) > 0);

    return { wakeup, morning, midday, afternoon, night, beforeBed };
  }, [state.medications]);

  const Section = ({ title, icon: Icon, meds, timeLabel, colorClass }: {
    title: string,
    icon: any,
    meds: typeof state.medications,
    timeLabel: keyof typeof state.medications[0]['scheduleDose'],
    colorClass: string
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`p-4 flex items-center gap-3 ${colorClass} text-white`}>
        <Icon size={24} />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {meds.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-2">No medications scheduled.</p>
        ) : (
          meds.map(med => (
            <div key={med.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="font-medium text-slate-700">{med.name}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold text-slate-600">
                {med.scheduleDose[timeLabel]} {med.baseUnit}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/meds')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Routine</h2>
          <p className="text-slate-500 text-sm">Medication Schedule Summary</p>
        </div>
      </div>

      <div className="space-y-4">
        {routine.wakeup.length > 0 && (
          <Section
            title="Wake-up"
            icon={AlarmClock}
            meds={routine.wakeup}
            timeLabel="wakeup"
            colorClass="bg-sky-500"
          />
        )}
        {routine.morning.length > 0 && (
          <Section
            title="Morning"
            icon={Coffee}
            meds={routine.morning}
            timeLabel="morning"
            colorClass="bg-amber-500"
          />
        )}
        {routine.midday.length > 0 && (
          <Section
            title="Midday"
            icon={Sun}
            meds={routine.midday}
            timeLabel="midday"
            colorClass="bg-orange-500"
          />
        )}
        {routine.afternoon.length > 0 && (
          <Section
            title="Afternoon"
            icon={CloudSun}
            meds={routine.afternoon}
            timeLabel="afternoon"
            colorClass="bg-orange-600"
          />
        )}
        {routine.night.length > 0 && (
          <Section
            title="Night"
            icon={Moon}
            meds={routine.night}
            timeLabel="night"
            colorClass="bg-indigo-900"
          />
        )}
        {routine.beforeBed.length > 0 && (
          <Section
            title="Before Bed"
            icon={Bed}
            meds={routine.beforeBed}
            timeLabel="beforeBed"
            colorClass="bg-slate-900"
          />
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Clock className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <p className="text-xs text-blue-800 leading-relaxed">
          This summary shows your active medication schedule. Inventory is automatically deducted each day based on these amounts.
        </p>
      </div>
    </div>
  );
};

export default DailyRoutine;
