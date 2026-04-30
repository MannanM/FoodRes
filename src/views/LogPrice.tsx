import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import { Scanner } from '../components/Scanner';
import { Camera, Search, Save, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PriceLog, UnitType } from '../lib/types';

const LogPrice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state as { upc?: string, name?: string, baseAmount?: number, unitType?: UnitType } | null;

  const { state, addPriceLog } = useStateContext();

  const [showScanner, setShowScanner] = useState(false);
  const [upc, setUpc] = useState(prefilled?.upc || '');
  const [name, setName] = useState(prefilled?.name || '');
  const [price, setPrice] = useState<number | ''>('');
  
  // Logic to handle conversion for display units (kg/L)
  const getInitialAmount = () => {
    if (!prefilled) return '';
    if (prefilled.unitType === 'g' && prefilled.baseAmount! >= 1000) return prefilled.baseAmount! / 1000;
    if (prefilled.unitType === 'ml' && prefilled.baseAmount! >= 1000) return prefilled.baseAmount! / 1000;
    return prefilled.baseAmount!;
  };

  const getInitialUnit = () => {
    if (!prefilled) return 'g';
    if (prefilled.unitType === 'g' && prefilled.baseAmount! >= 1000) return 'kg';
    if (prefilled.unitType === 'ml' && prefilled.baseAmount! >= 1000) return 'l';
    return (prefilled.unitType as any) || 'g';
  };

  const [uiAmount, setUiAmount] = useState<number | ''>(getInitialAmount());
  const [uiUnit, setUiUnit] = useState<UnitType | 'kg' | 'l'>(getInitialUnit());

  const handleLookup = async (code: string) => {
    if (!code) return;

    // Check local history first
    const historyItem = state.items.find(item => item.upc === code);
    if (historyItem) {
      setName(historyItem.name);
      if (historyItem.unitType === 'g' && historyItem.baseAmount >= 1000) {
        setUiAmount(historyItem.baseAmount / 1000);
        setUiUnit('kg');
      } else if (historyItem.unitType === 'ml' && historyItem.baseAmount >= 1000) {
        setUiAmount(historyItem.baseAmount / 1000);
        setUiUnit('l');
      } else {
        setUiAmount(historyItem.baseAmount);
        setUiUnit(historyItem.unitType as any);
      }
      return;
    }

    if (!navigator.onLine) {
      alert("Offline: Cannot lookup new product. Please enter manually.");
      return;
    }

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const brand = p.brands ? p.brands.split(',')[0] : '';
        const productName = p.product_name || '';
        setName(brand ? `${brand} ${productName}`.trim() : productName);

        if (p.quantity) {
          const qStr = p.quantity.toLowerCase().trim();
          const match = qStr.match(/([\d.]+)\s*(g|kg|ml|l)/);
          if (match) {
            setUiAmount(Number(match[1]));
            setUiUnit(match[2] as any);
          }
        }
      } else {
        alert("Product not found in online database. Please enter manually.");
      }
    } catch (err) {
      alert("API request failed. Please enter manually.");
    }
  };

  const handleScan = (code: string) => {
    setUpc(code);
    setShowScanner(false);
    handleLookup(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!upc) {
      alert("UPC is required to log a market price.");
      return;
    }

    let baseAmount = Number(uiAmount);
    let unitType: UnitType = uiUnit as UnitType;

    if (uiUnit === 'kg') {
      baseAmount = baseAmount * 1000;
      unitType = 'g';
    } else if (uiUnit === 'l') {
      baseAmount = baseAmount * 1000;
      unitType = 'ml';
    }

    const newLog: PriceLog = {
      id: uuidv4(),
      upc,
      price: Number(price),
      baseAmount,
      unitType,
      dateLogged: new Date().toISOString()
    };

    addPriceLog(newLog);
    alert('Market price logged successfully!');
    navigate(-1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Log Market Price</h2>
      </div>

      {showScanner ? (
        <Scanner onResult={handleScan} onCancel={() => setShowScanner(false)} />
      ) : (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">UPC Barcode</label>
                <input
                  type="text"
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
                  placeholder="Required for tracking"
                  required
                />
              </div>
              <div className="flex items-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => handleLookup(upc)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Lookup UPC"
                >
                  <Search size={20} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowScanner(true)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Scan Barcode"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount per Unit</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={uiAmount}
                    onChange={(e) => setUiAmount(Number(e.target.value))}
                    className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
                    required
                  />
                  <select 
                    value={uiUnit}
                    onChange={(e) => setUiUnit(e.target.value as any)}
                    className="w-24 rounded-lg border-slate-300 border p-2 bg-white focus:ring-primary focus:border-primary"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="unit">unit</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-6 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} /> Save Market Price
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LogPrice;
