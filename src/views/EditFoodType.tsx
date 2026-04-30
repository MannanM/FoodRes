import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import type { FoodType } from '../lib/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const EditFoodType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateFoodType, deleteFoodType } = useStateContext();
  
  const [foodType, setFoodType] = useState<FoodType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [consumptionRate, setConsumptionRate] = useState<number | ''>('');
  const [consumptionPeriod, setConsumptionPeriod] = useState<'week'|'month'|'year'>('week');

  useEffect(() => {
    const found = state.foodTypes.find(ft => ft.id === id);
    if (found) {
      setFoodType(found);
      setName(found.name);
      setTags(found.tags.join(', '));
      
      // Determine best display for consumption rate
      const weekly = found.weeklyConsumptionRate;
      if (weekly < 1) {
        setConsumptionRate(Number((weekly * (365 / 12 / 7)).toFixed(2)));
        setConsumptionPeriod('month');
      } else {
        setConsumptionRate(weekly);
        setConsumptionPeriod('week');
      }
    }
  }, [state.foodTypes, id]);

  if (!foodType) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">Food Type not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium">Go Back</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let weeklyRate = Number(consumptionRate);
    if (consumptionPeriod === 'month') weeklyRate = Number(consumptionRate) / (365 / 12 / 7);
    if (consumptionPeriod === 'year') weeklyRate = Number(consumptionRate) / 52.14;

    const updated: FoodType = {
      ...foodType,
      name,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      weeklyConsumptionRate: weeklyRate
    };

    updateFoodType(updated);
    navigate(-1);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this Food Type and ALL its items?')) {
      deleteFoodType(foodType.id);
      navigate('/');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 flex-1">Edit Food Type</h2>
        <button onClick={handleDelete} className="p-2 rounded-full text-danger hover:bg-red-50" title="Delete Food Type">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              placeholder="Pantry, Snacks, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Consumption Rate (Units)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={consumptionRate}
                onChange={(e) => setConsumptionRate(Number(e.target.value))}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
                required
              />
              <span className="flex items-center text-slate-500 px-2">per</span>
              <select 
                value={consumptionPeriod}
                onChange={(e) => setConsumptionPeriod(e.target.value as any)}
                className="w-32 rounded-lg border-slate-300 border p-2 bg-white focus:ring-primary focus:border-primary"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1">Used to calculate survival days.</p>
          </div>

          <button 
            type="submit"
            className="w-full py-4 mt-6 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFoodType;
