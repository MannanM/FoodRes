import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useStateContext } from '../context/StateContext';
import type { FoodType, Item, UnitType } from '../lib/types';
import { Scanner } from '../components/Scanner';
import { Camera, Plus, Search } from 'lucide-react';

const AddItem = () => {
  const navigate = useNavigate();
  const { state, addFoodType, addItem } = useStateContext();
  const [showScanner, setShowScanner] = useState(false);

  // Form State
  const [isNewFoodType, setIsNewFoodType] = useState(false);
  const [foodTypeId, setFoodTypeId] = useState<string>('');
  
  // New Food Type
  const [newFoodTypeName, setNewFoodTypeName] = useState('');
  const [newFoodTypeTags, setNewFoodTypeTags] = useState('');
  const [consumptionRate, setConsumptionRate] = useState<number>(0);
  const [consumptionPeriod, setConsumptionPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  // Item fields
  const [upc, setUpc] = useState('');
  const [name, setName] = useState('');
  const [uiAmount, setUiAmount] = useState<number>(0);
  const [uiUnit, setUiUnit] = useState<'g' | 'kg' | 'ml' | 'l' | 'unit'>('g');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bestBeforeDate, setBestBeforeDate] = useState('');
  const [useByDate, setUseByDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const handleLookup = async (code: string) => {
    if (!code) return;

    // Step 1: Check local history
    const historyItem = state.items.find(item => item.upc === code);
    if (historyItem) {
      setName(historyItem.name);
      
      const isValidType = state.foodTypes.some(ft => ft.id === historyItem.foodTypeId);
      if (isValidType) {
        setFoodTypeId(historyItem.foodTypeId);
        setIsNewFoodType(false);
      } else {
        setFoodTypeId('');
        setIsNewFoodType(true);
      }
      
      setQuantity(1);
      
      if (historyItem.imageUrl) setImageUrl(historyItem.imageUrl);

      // Attempt to map baseAmount back to UI amount
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
      setIsNewFoodType(false);
      return;
    }

    // Step 2: Offline check
    if (!navigator.onLine) {
      alert("Offline: Cannot lookup new product. Please enter manually.");
      return;
    }

    // Step 3 & 4: API Lookup
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const brand = p.brands ? p.brands.split(',')[0] : '';
        const productName = p.product_name || '';
        setName(brand ? `${brand} ${productName}`.trim() : productName);
        
        setImageUrl(p.image_front_small_url || p.image_url || '');

        if (p.quantity) {
          // Attempt to parse "500 g", "1.5 kg", "200ml"
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

    let targetFoodTypeId = foodTypeId;

    // Handle New Food Type
    if (isNewFoodType || !state.foodTypes.length) {
      targetFoodTypeId = uuidv4();
      
      let weeklyRate = consumptionRate;
      if (consumptionPeriod === 'month') weeklyRate = consumptionRate / (365 / 12 / 7);
      if (consumptionPeriod === 'year') weeklyRate = consumptionRate / 52.14;

      const newFoodType: FoodType = {
        id: targetFoodTypeId,
        name: newFoodTypeName,
        tags: newFoodTypeTags.split(',').map(t => t.trim()).filter(Boolean),
        weeklyConsumptionRate: weeklyRate
      };
      addFoodType(newFoodType);
    }

    // Calculate Base Amount & Base Unit
    let baseAmount = uiAmount;
    let baseUnit: UnitType = 'unit';
    
    if (uiUnit === 'kg') {
      baseAmount = uiAmount * 1000;
      baseUnit = 'g';
    } else if (uiUnit === 'l') {
      baseAmount = uiAmount * 1000;
      baseUnit = 'ml';
    } else {
      baseUnit = uiUnit as UnitType;
    }

    const newItem: Item = {
      id: uuidv4(),
      foodTypeId: targetFoodTypeId,
      name,
      baseAmount,
      unitType: baseUnit,
      quantity,
      purchaseDate: new Date(purchaseDate).toISOString(),
      bestBeforeDate: bestBeforeDate ? new Date(bestBeforeDate).toISOString() : null,
      useByDate: useByDate ? new Date(useByDate).toISOString() : null,
      price: price ? Number(price) : null,
      batchNumber: batchNumber || null,
      upc: upc || null,
      imageUrl: imageUrl || null
    };

    addItem(newItem);
    navigate('/');
  };

  return (
    <div className="space-y-4">
      {showScanner && <Scanner onResult={handleScan} onCancel={() => setShowScanner(false)} />}
      
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Add Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">UPC Barcode</label>
              <input
                type="text"
                value={upc}
                onChange={(e) => setUpc(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button 
                type="button" 
                onClick={() => handleLookup(upc)}
                className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                title="Lookup UPC"
              >
                <Search size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => setShowScanner(true)}
                className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                title="Scan Barcode"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Food Type Group <span className="text-danger">*</span>
            </label>
            {state.foodTypes.length > 0 && !isNewFoodType ? (
              <div className="flex space-x-2">
                <select 
                  className="flex-1 rounded-lg border-slate-300 border p-2 text-slate-900"
                  value={foodTypeId}
                  onChange={(e) => setFoodTypeId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Type...</option>
                  {state.foodTypes.map(ft => (
                    <option key={ft.id} value={ft.id}>{ft.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsNewFoodType(true)}
                  className="p-2 border border-slate-300 rounded-lg text-primary hover:bg-slate-50"
                  title="Create New Food Type"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-800">New Food Type</span>
                  {state.foodTypes.length > 0 && (
                    <button type="button" onClick={() => setIsNewFoodType(false)} className="text-xs text-primary font-medium">Cancel</button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. White Rice"
                  value={newFoodTypeName}
                  onChange={(e) => setNewFoodTypeName(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Tags (comma-separated, e.g. Bob, Staples)"
                  value={newFoodTypeTags}
                  onChange={(e) => setNewFoodTypeTags(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2"
                />
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Consumption Rate (Base Units) <span className="text-danger">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={consumptionRate || ''}
                      onChange={(e) => setConsumptionRate(Number(e.target.value))}
                      className="flex-1 rounded-lg border-slate-300 border p-2"
                      placeholder="Amount"
                      required
                    />
                    <span className="self-center text-sm text-slate-500">per</span>
                    <select 
                      value={consumptionPeriod}
                      onChange={(e) => setConsumptionPeriod(e.target.value as any)}
                      className="w-24 rounded-lg border-slate-300 border p-2"
                    >
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Specific Item Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900"
              placeholder="e.g. Sunbeam Medium White Rice"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount per Unit <span className="text-danger">*</span>
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={uiAmount || ''}
                  onChange={(e) => setUiAmount(Number(e.target.value))}
                  className="w-full rounded-l-lg border-slate-300 border p-2 z-10"
                  required
                />
                <select 
                  value={uiUnit}
                  onChange={(e) => setUiUnit(e.target.value as any)}
                  className="w-20 rounded-r-lg border-slate-300 border-y border-r p-2 bg-slate-50"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="unit">unit</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border-slate-300 border p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900"
              placeholder="https://example.com/image.jpg (Optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Price Paid ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Purchase Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Best Before</label>
              <input
                type="date"
                value={bestBeforeDate}
                onChange={(e) => setBestBeforeDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Use By (Strict)</label>
              <input
                type="date"
                value={useByDate}
                onChange={(e) => setUseByDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 mt-4 bg-primary text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
