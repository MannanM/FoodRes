import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedsContext } from '../context/MedsContext';
import type { MedicationProfile, MedBaseUnit } from '../lib/types';
import { calculateMedsMetrics } from '../lib/medStorage';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const AddEditMedication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addMedication, deleteMedication, overwriteMedsState } = useMedsContext();

  const isEdit = Boolean(id);
  const existingMed = state.medications.find(m => m.id === id);

  const [name, setName] = useState('');
  const [baseUnit, setBaseUnit] = useState<MedBaseUnit>('mg');
  const [wakeup, setWakeup] = useState(0);
  const [morning, setMorning] = useState(0);
  const [midday, setMidday] = useState(0);
  const [afternoon, setAfternoon] = useState(0);
  const [night, setNight] = useState(0);
  const [beforeBed, setBeforeBed] = useState(0);
  const [repeats, setRepeats] = useState<number | ''>('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    if (isEdit && existingMed) {
      setName(existingMed.name);
      setBaseUnit(existingMed.baseUnit);
      setWakeup(existingMed.scheduleDose.wakeup || 0);
      setMorning(existingMed.scheduleDose.morning || 0);
      setMidday(existingMed.scheduleDose.midday || 0);
      setAfternoon(existingMed.scheduleDose.afternoon || 0);
      setNight(existingMed.scheduleDose.night || 0);
      setBeforeBed(existingMed.scheduleDose.beforeBed || 0);
      setRepeats(existingMed.scriptRepeatsRemaining ?? '');
      setExpiry(existingMed.scriptExpiryDate ? existingMed.scriptExpiryDate.split('T')[0] : '');
    }
  }, [isEdit, existingMed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleChanged = isEdit && existingMed && (
      (existingMed.scheduleDose.wakeup || 0) !== wakeup ||
      (existingMed.scheduleDose.morning || 0) !== morning ||
      (existingMed.scheduleDose.midday || 0) !== midday ||
      (existingMed.scheduleDose.afternoon || 0) !== afternoon ||
      (existingMed.scheduleDose.night || 0) !== night ||
      (existingMed.scheduleDose.beforeBed || 0) !== beforeBed
    );

    const today = formatISO(new Date(), { representation: 'date' });
    let finalBatches = [...state.batches];
    let lastStockTakeDate = existingMed?.lastStockTakeDate || today;

    if (scheduleChanged && existingMed) {
      // 1. Calculate estimated inventory based on OLD schedule
      const { currentEstimatedInventory } = calculateMedsMetrics(existingMed, state.batches);
      
      // 2. Clear old batches for this medication
      finalBatches = state.batches.filter(b => b.medicationId !== id);
      
      // 3. Create a new consolidated batch representing the current estimated stock
      if (currentEstimatedInventory > 0) {
        finalBatches.push({
          id: uuidv4(),
          medicationId: id!,
          quantity: 1,
          sizePerQuantity: currentEstimatedInventory,
          dateAdded: today
        });
      }
      
      // 4. Update stock take date to today to reset passive deduction
      lastStockTakeDate = today;
    }

    const medData: MedicationProfile = {
      id: id || uuidv4(),
      name,
      baseUnit,
      scheduleDose: { wakeup, morning, midday, afternoon, night, beforeBed },
      scriptRepeatsRemaining: repeats === '' ? undefined : Number(repeats),
      scriptExpiryDate: expiry ? new Date(expiry).toISOString() : undefined,
      lastStockTakeDate
    };

    if (isEdit) {
      overwriteMedsState({
        ...state,
        medications: state.medications.map(m => m.id === id ? medData : m),
        batches: finalBatches
      });
    } else {
      addMedication(medData);
    }

    navigate('/meds');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this medication and all its history?')) {
      deleteMedication(id!);
      navigate('/meds');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/meds')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Medication' : 'Add Medication'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Low-dose Naltrexone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Base Unit</label>
            <select
              value={baseUnit}
              onChange={e => setBaseUnit(e.target.value as MedBaseUnit)}
              className="w-full p-3 rounded-xl border border-slate-200 outline-none bg-white"
            >
              <option value="mg">mg (milligrams)</option>
              <option value="g">g (grams)</option>
              <option value="ml">ml (milliliters)</option>
              <option value="unit/tablet">unit/tablet</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Daily Dosage Schedule</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Wake-up</label>
              <input
                type="number"
                step="any"
                value={wakeup}
                onChange={e => setWakeup(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Morning</label>
              <input
                type="number"
                step="any"
                value={morning}
                onChange={e => setMorning(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Midday</label>
              <input
                type="number"
                step="any"
                value={midday}
                onChange={e => setMidday(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Afternoon</label>
              <input
                type="number"
                step="any"
                value={afternoon}
                onChange={e => setAfternoon(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Night</label>
              <input
                type="number"
                step="any"
                value={night}
                onChange={e => setNight(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Before Bed</label>
              <input
                type="number"
                step="any"
                value={beforeBed}
                onChange={e => setBeforeBed(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Amount per dose in {baseUnit}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800">Prescription Details (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Repeats Left</label>
              <input
                type="number"
                value={repeats}
                onChange={e => setRepeats(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isEdit ? 'Update Medication' : 'Save Medication'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditMedication;
