import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import { calculateSurvival, formatBaseAmount, getExpirationStatus, getTagColor } from '../lib/utils';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import type { Item } from '../lib/types';

const Dashboard = () => {
  const { state } = useStateContext();
  const navigate = useNavigate();
  const [tagFilter, setTagFilter] = useState<string>('');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    state.foodTypes.forEach(ft => ft.tags.forEach(t => tags.add(t)));
    const sortedTags = Array.from(tags).sort();
    return [...sortedTags, 'Missing Items'];
  }, [state.foodTypes]);

  const dashboardData = useMemo(() => {
    const allMapped = state.foodTypes
      .map(ft => {
        const items = state.items.filter(item => item.foodTypeId === ft.id && item.quantity > 0);
        
        const totalBaseAmount = items.reduce((sum, item) => sum + (item.baseAmount * item.quantity), 0);
        const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        
        const survival = calculateSurvival(totalBaseAmount, ft.weeklyConsumptionRate);
        
        let worstStatus: string = 'GREEN';
        items.forEach(item => {
          const status = getExpirationStatus(item.useByDate, item.bestBeforeDate);
          if (status === 'RED') worstStatus = 'RED';
          else if (status === 'YELLOW' && worstStatus !== 'RED') worstStatus = 'YELLOW';
        });

        const unit = items.length > 0 ? items[0].unitType : 'unit';

        return {
          ...ft,
          totalBaseAmount,
          unit,
          totalValue,
          survival,
          worstStatus,
          itemCount: items.length
        };
      });

    // Handle orphan items (only for "All Tags" view)
    if (!tagFilter) {
      const validFoodTypeIds = new Set(state.foodTypes.map(ft => ft.id));
      const orphanItems = state.items.filter(item => item.quantity > 0 && !validFoodTypeIds.has(item.foodTypeId));
      
      if (orphanItems.length > 0) {
        const orphansGrouped = new Map<string, Item[]>();
        orphanItems.forEach(item => {
          const arr = orphansGrouped.get(item.foodTypeId) || [];
          arr.push(item);
          orphansGrouped.set(item.foodTypeId, arr);
        });
        
        orphansGrouped.forEach((items, foodTypeId) => {
          const totalBaseAmount = items.reduce((sum, item) => sum + (item.baseAmount * item.quantity), 0);
          const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
          let worstStatus = 'GREEN';
          items.forEach(item => {
            const status = getExpirationStatus(item.useByDate, item.bestBeforeDate);
            if (status === 'RED') worstStatus = 'RED';
            else if (status === 'YELLOW' && worstStatus !== 'RED') worstStatus = 'YELLOW';
          });

          allMapped.push({
            id: foodTypeId,
            name: items[0].name + " (Uncategorized)",
            tags: ["Uncategorized"],
            weeklyConsumptionRate: 0,
            totalBaseAmount,
            unit: items[0].unitType,
            totalValue,
            survival: null,
            worstStatus,
            itemCount: items.length
          } as any);
        });
      }
    }

    let filtered = allMapped;
    if (tagFilter === 'Missing Items') {
      filtered = allMapped.filter(data => data.itemCount === 0 && data.id !== 'Uncategorized');
    } else if (tagFilter) {
      filtered = allMapped.filter(data => data.itemCount > 0 && data.tags.includes(tagFilter));
    } else {
      filtered = allMapped.filter(data => data.itemCount > 0);
    }

    return filtered.sort((a, b) => {
      const daysA = a.survival?.days ?? Infinity;
      const daysB = b.survival?.days ?? Infinity;
      return daysA - daysB;
    });
  }, [state, tagFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Tag</label>
        <select 
          className="w-full rounded-lg border-slate-300 border p-2 focus:ring-primary focus:border-primary"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {dashboardData.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500">{tagFilter === 'Missing Items' ? 'No missing items found.' : 'No stock found.'}</p>
          </div>
        ) : (
          dashboardData.map(data => (
            <div 
              key={data.id}
              onClick={() => navigate(`/food/${data.id}`)}
              className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform flex flex-col relative overflow-hidden"
            >
              {data.worstStatus === 'RED' && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-danger"></div>
              )}
              {data.worstStatus === 'YELLOW' && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-warning"></div>
              )}

              <div className="flex justify-between items-center pr-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {data.name}
                      {data.survival && <span className="text-primary ml-1.5">— {data.survival.label}</span>}
                    </h3>
                    {data.worstStatus !== 'GREEN' && (
                      <AlertTriangle size={14} className={data.worstStatus === 'RED' ? 'text-danger' : 'text-warning'} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.tags.map(tag => {
                      const colors = getTagColor(tag);
                      return (
                        <span key={tag} className={`px-1.5 py-0 text-[10px] rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatBaseAmount(data.totalBaseAmount, data.unit)}</div>
                    {data.totalValue > 0 && (
                      <div className="text-[11px] text-slate-500">${data.totalValue.toFixed(2)}</div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
