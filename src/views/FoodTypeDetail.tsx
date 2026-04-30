import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import { getExpirationStatus, formatBaseAmount, getTagColor } from '../lib/utils';
import { ArrowLeft, AlertCircle, TrendingUp, Edit, PlusCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FoodTypeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, consumeItem } = useStateContext();

  const foodType = useMemo(() => {
    let ft = state.foodTypes.find(f => f.id === id);
    if (!ft) {
      const orphanItems = state.items.filter(item => item.foodTypeId === id && item.quantity > 0);
      if (orphanItems.length > 0) {
        ft = {
          id: id!,
          name: orphanItems[0].name + " (Uncategorized)",
          tags: ["Uncategorized"],
          weeklyConsumptionRate: 0
        };
      }
    }
    return ft;
  }, [state, id]);
  
  const items = useMemo(() => {
    return state.items
      .filter(item => item.foodTypeId === id)
      .sort((a, b) => {
        // Active stock first
        if (a.quantity > 0 && b.quantity === 0) return -1;
        if (a.quantity === 0 && b.quantity > 0) return 1;

        if (a.quantity > 0 && b.quantity > 0) {
          // RED items pushed to the top within active stock
          const statA = getExpirationStatus(a.useByDate, a.bestBeforeDate);
          const statB = getExpirationStatus(b.useByDate, b.bestBeforeDate);
          
          if (statA === 'RED' && statB !== 'RED') return -1;
          if (statA !== 'RED' && statB === 'RED') return 1;

          // Then by expiration soonest
          const expA = a.useByDate || a.bestBeforeDate || '9999-12-31';
          const expB = b.useByDate || b.bestBeforeDate || '9999-12-31';
          return new Date(expA).getTime() - new Date(expB).getTime();
        }

        // For both quantity 0, sort by purchase date (newest first)
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      });
  }, [state, id]);

  const priceData = useMemo(() => {
    const foodTypeUpcs = new Set<string>();
    const itemsWithPrice = state.items.filter(item => {
      if (item.foodTypeId === id) {
        if (item.upc) foodTypeUpcs.add(item.upc);
        return item.price && item.price > 0;
      }
      return false;
    });

    const dataPoints: { date: string, timestamp: number, purchasePrice?: number, marketPrice?: number, unit: string }[] = [];

    itemsWithPrice.forEach(item => {
      const unitPrice = (item.price! / item.baseAmount) * 100;
      dataPoints.push({
        date: new Date(item.purchaseDate).toLocaleDateString(),
        timestamp: new Date(item.purchaseDate).getTime(),
        purchasePrice: +unitPrice.toFixed(2),
        unit: item.unitType
      });
    });

    if (state.priceLogs) {
      state.priceLogs.forEach(log => {
        const isUpcMatch = log.upc && foodTypeUpcs.has(log.upc);
        const isNameMatch = log.name && items.some(i => i.name === log.name);
        
        if (isUpcMatch || isNameMatch) {
          const unitPrice = (log.price / log.baseAmount) * 100;
          dataPoints.push({
            date: new Date(log.dateLogged).toLocaleDateString(),
            timestamp: new Date(log.dateLogged).getTime(),
            marketPrice: +unitPrice.toFixed(2),
            unit: log.unitType || 'unit'
          });
        }
      });
    }

    dataPoints.sort((a, b) => a.timestamp - b.timestamp);
    return dataPoints;
  }, [state, id]);

  const replacementMetrics = useMemo(() => {
    if (!state.priceLogs || state.priceLogs.length === 0) return null;

    let totalPaid = 0;
    let replacementCost = 0;
    let hasMarketData = false;

    const currentItems = state.items.filter(item => item.foodTypeId === id && item.quantity > 0 && item.price && item.price > 0 && item.upc);

    currentItems.forEach(item => {
      const logs = state.priceLogs!.filter(log => 
        (item.upc && log.upc === item.upc) || (!item.upc && log.name === item.name)
      ).sort((a, b) => new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime());
      
      if (logs.length > 0) {
        hasMarketData = true;
        const latestLog = logs[0];
        const marketUnitPrice = latestLog.price / latestLog.baseAmount;
        const currentAmount = item.baseAmount * item.quantity;
        const itemReplacementCost = marketUnitPrice * currentAmount;
        
        totalPaid += (item.price! * item.quantity);
        replacementCost += itemReplacementCost;
      }
    });

    if (!hasMarketData) return null;

    const difference = replacementCost - totalPaid;
    return {
      totalPaid,
      replacementCost,
      difference,
      isSavings: difference > 0
    };
  }, [state, id]);

  const mostRecentItem = useMemo(() => {
    return state.items
      .filter(item => item.foodTypeId === id)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())[0];
  }, [state.items, id]);

  if (!foodType) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">Food Type not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Go Back</button>
      </div>
    );
  }

  const handleConsume = () => {
    if (window.confirm(`Consume 1 unit of ${foodType.name}?`)) {
      consumeItem(foodType.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 flex-1">{foodType.name}</h2>
        {foodType.tags[0] !== 'Uncategorized' && (
          <button 
            onClick={() => navigate(`/edit-food-type/${foodType.id}`)} 
            className="p-2 -mr-2 rounded-full text-slate-500 hover:bg-slate-200"
            title="Edit Food Type"
          >
            <Edit size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {foodType.tags.map(tag => {
          const colors = getTagColor(tag);
          return (
            <span key={tag} className={`px-2 py-0.5 text-xs rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              {tag}
            </span>
          );
        })}
      </div>

      <button 
        onClick={handleConsume}
        disabled={items.length === 0}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Consume 1 Unit (FIFO)
      </button>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800 mt-2">Individual Items</h3>
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No items added to this group yet.</p>
        ) : (
          items.map(item => {
            const isOutOfStock = item.quantity === 0;
            const status = isOutOfStock ? 'GREEN' : getExpirationStatus(item.useByDate, item.bestBeforeDate);
            
            return (
              <div 
                key={item.id} 
                className={`bg-white p-4 rounded-xl shadow-sm border transition-opacity ${
                  isOutOfStock ? 'opacity-60 border-dashed border-slate-300' :
                  status === 'RED' ? 'border-danger bg-red-50' : 
                  status === 'YELLOW' ? 'border-warning bg-yellow-50' : 
                  'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-medium ${isOutOfStock ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.name}</h4>
                    {isOutOfStock ? (
                      <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-1">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium inline-block mt-1">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/edit-item/${item.id}`)}
                    className="p-2 -mr-2 rounded-md text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                
                {item.imageUrl && (
                  <div className={`mb-3 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>
                    <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  </div>
                )}
                
                <div className={`grid grid-cols-2 gap-2 text-sm ${isOutOfStock ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div>Amount: {formatBaseAmount(item.baseAmount, item.unitType)}</div>
                  {item.price && <div>Price/Unit: ${item.price.toFixed(2)}</div>}
                  
                  <div className="col-span-2 flex items-center mt-1">
                    {!isOutOfStock && status === 'RED' && <AlertCircle size={14} className="text-danger mr-1" />}
                    <span className={!isOutOfStock && status === 'RED' ? 'text-danger font-medium' : !isOutOfStock && status === 'YELLOW' ? 'text-warning font-medium' : ''}>
                      {item.useByDate ? `Use by: ${new Date(item.useByDate).toLocaleDateString()}` : 
                       item.bestBeforeDate ? `Best before: ${new Date(item.bestBeforeDate).toLocaleDateString()}` : 
                       'No Expiration'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-xs text-slate-400 mt-1">
                    Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                    {item.upc && ` • UPC: ${item.upc}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {priceData.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} /> Inflation Visualizer (per 100 {items[0]?.unitType || 'unit'})
            </div>
            {mostRecentItem && (
              <button 
                onClick={() => navigate('/log-price', { state: { 
                  upc: mostRecentItem.upc, 
                  name: mostRecentItem.name, 
                  baseAmount: mostRecentItem.baseAmount, 
                  unitType: mostRecentItem.unitType 
                }})}
                className="p-1.5 bg-slate-100 text-primary rounded-md hover:bg-blue-50 transition-colors"
                title="Log Market Price"
              >
                <PlusCircle size={18} />
              </button>
            )}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(val) => `$${val}`} width={40} />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === 'purchasePrice') return [`$${value}`, 'Purchase Price'];
                    if (name === 'marketPrice') return [`$${value}`, 'Market Price'];
                    return [`$${value}`, name];
                  }} 
                />
                <Line type="monotone" dataKey="purchasePrice" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} name="purchasePrice" />
                <Line type="monotone" dataKey="marketPrice" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} name="marketPrice" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Purchase Price</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Market Price</span>
          </div>
        </div>
      )}

      {replacementMetrics && (
        <div className="bg-slate-900 p-4 rounded-xl shadow-sm text-white">
          <h3 className="text-sm font-semibold mb-3">Replacement Cost Analysis</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-slate-400 text-xs mb-1">Total Paid (Current Stock)</p>
              <p className="text-xl font-bold">${replacementMetrics.totalPaid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Current Market Value</p>
              <p className="text-xl font-bold">${replacementMetrics.replacementCost.toFixed(2)}</p>
            </div>
          </div>
          <div className={`p-3 rounded-lg flex items-start gap-2 ${replacementMetrics.isSavings ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-snug">
              You paid ${replacementMetrics.totalPaid.toFixed(2)} for this stock. Buying it today would cost ${replacementMetrics.replacementCost.toFixed(2)}. 
              {replacementMetrics.isSavings ? ` You saved $${replacementMetrics.difference.toFixed(2)}!` : ` It's cheaper today by $${Math.abs(replacementMetrics.difference).toFixed(2)}.`}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default FoodTypeDetail;
