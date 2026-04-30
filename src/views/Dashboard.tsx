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
    return Array.from(tags).sort();
  }, [state.foodTypes]);

  const dashboardData = useMemo(() => {
    const mappedFoodTypes = state.foodTypes
      .filter(ft => !tagFilter || ft.tags.includes(tagFilter))
      .map(ft => {
        const items = state.items.filter(item => item.foodTypeId === ft.id && item.quantity > 0);
        
        const totalBaseAmount = items.reduce((sum, item) => sum + (item.baseAmount * item.quantity), 0);
        const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const survival = calculateSurvival(totalBaseAmount, ft.weeklyConsumptionRate);
        
        // Find best before range
        let soonestExp = Infinity;
        let latestExp = -Infinity;
        let hasExp = false;
        
        // Determine worst case expiration status
        let worstStatus: string = 'GREEN';

        items.forEach(item => {
          const expDate = item.useByDate || item.bestBeforeDate;
          if (expDate) {
            hasExp = true;
            const t = new Date(expDate).getTime();
            if (t < soonestExp) soonestExp = t;
            if (t > latestExp) latestExp = t;

            const status = getExpirationStatus(item.useByDate, item.bestBeforeDate);
            if (status === 'RED') worstStatus = 'RED';
            else if (status === 'YELLOW' && worstStatus !== 'RED') worstStatus = 'YELLOW';
          }
        });

        const formatDate = (ms: number) => new Date(ms).toLocaleDateString();
        const expRange = hasExp 
          ? soonestExp === latestExp 
            ? formatDate(soonestExp) 
            : `${formatDate(soonestExp)} - ${formatDate(latestExp)}`
          : 'No Expiration Info';

        // Assume all items of a foodType share the same unit for display
        const unit = items.length > 0 ? items[0].unitType : 'unit';

        return {
          ...ft,
          totalBaseAmount,
          unit,
          totalValue,
          survival,
          expRange,
          worstStatus,
          itemCount: items.length
        };
      });

    // Handle orphan items
    const validFoodTypeIds = new Set(state.foodTypes.map(ft => ft.id));
    const orphanItems = state.items.filter(item => item.quantity > 0 && !validFoodTypeIds.has(item.foodTypeId));
    
    if (orphanItems.length > 0 && !tagFilter) {
      const orphansGrouped = new Map<string, Item[]>();
      orphanItems.forEach(item => {
        const arr = orphansGrouped.get(item.foodTypeId) || [];
        arr.push(item);
        orphansGrouped.set(item.foodTypeId, arr);
      });
      
      orphansGrouped.forEach((items, foodTypeId) => {
        const totalBaseAmount = items.reduce((sum, item) => sum + (item.baseAmount * item.quantity), 0);
        const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
        
        let soonestExp = Infinity;
        let latestExp = -Infinity;
        let hasExp = false;
        let worstStatus = 'GREEN';

        items.forEach(item => {
          const expDate = item.useByDate || item.bestBeforeDate;
          if (expDate) {
            hasExp = true;
            const t = new Date(expDate).getTime();
            if (t < soonestExp) soonestExp = t;
            if (t > latestExp) latestExp = t;

            const status = getExpirationStatus(item.useByDate, item.bestBeforeDate);
            if (status === 'RED') worstStatus = 'RED';
            else if (status === 'YELLOW' && worstStatus !== 'RED') worstStatus = 'YELLOW';
          }
        });

        const formatDate = (ms: number) => new Date(ms).toLocaleDateString();
        const expRange = hasExp 
          ? soonestExp === latestExp 
            ? formatDate(soonestExp) 
            : `${formatDate(soonestExp)} - ${formatDate(latestExp)}`
          : 'No Expiration Info';

        mappedFoodTypes.push({
          id: foodTypeId,
          name: items[0].name + " (Uncategorized)",
          tags: ["Uncategorized"],
          weeklyConsumptionRate: 0,
          totalBaseAmount,
          unit: items[0].unitType,
          totalValue,
          survival: null,
          expRange,
          worstStatus,
          itemCount: items.length
        } as any);
      });
    }

    return mappedFoodTypes.filter(data => data.itemCount > 0);
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
      <div className="space-y-3">
        {dashboardData.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500">No stock found.</p>
          </div>
        ) : (
          dashboardData.map(data => (
            <div 
              key={data.id}
              onClick={() => navigate(`/food/${data.id}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform flex flex-col relative overflow-hidden"
            >
              {data.worstStatus === 'RED' && (
                <div className="absolute top-0 right-0 w-2 h-full bg-danger"></div>
              )}
              {data.worstStatus === 'YELLOW' && (
                <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>
              )}

              <div className="flex justify-between items-start pr-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{data.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.tags.map(tag => {
                      const colors = getTagColor(tag);
                      return (
                        <span key={tag} className={`px-2 py-0.5 text-xs rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <ChevronRight className="text-slate-400 mt-1" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Total:</span>{' '}
                  <span className="font-medium">{formatBaseAmount(data.totalBaseAmount, data.unit)}</span>
                </div>
                {data.totalValue > 0 && (
                  <div>
                    <span className="text-slate-500">Value:</span>{' '}
                    <span className="font-medium">${data.totalValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-500 mr-1">Exp:</span>{' '}
                  <span className={`font-medium flex items-center gap-1 ${data.worstStatus === 'RED' ? 'text-danger' : data.worstStatus === 'YELLOW' ? 'text-warning' : ''}`}>
                    {data.expRange}
                    {data.worstStatus === 'RED' && <AlertTriangle size={14} />}
                  </span>
                </div>
                {data.survival && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Survival:</span>{' '}
                    <span className="font-semibold text-primary">
                      {data.survival.days} Days ({data.survival.weeks} Weeks)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
