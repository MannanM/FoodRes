import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import type { Item, UnitType } from '../lib/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateItem, deleteItem } = useStateContext();
  
  const [item, setItem] = useState<Item | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [uiAmount, setUiAmount] = useState<number | ''>('');
  const [uiUnit, setUiUnit] = useState<UnitType | 'kg' | 'l'>('g');
  const [price, setPrice] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [bestBeforeDate, setBestBeforeDate] = useState('');
  const [useByDate, setUseByDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [upc, setUpc] = useState('');

  useEffect(() => {
    const foundItem = state.items.find(i => i.id === id);
    if (foundItem) {
      setItem(foundItem);
      setName(foundItem.name);
      setQuantity(foundItem.quantity);
      setPrice(foundItem.price || '');
      setPurchaseDate(foundItem.purchaseDate ? new Date(foundItem.purchaseDate).toISOString().split('T')[0] : '');
      setBestBeforeDate(foundItem.bestBeforeDate ? new Date(foundItem.bestBeforeDate).toISOString().split('T')[0] : '');
      setUseByDate(foundItem.useByDate ? new Date(foundItem.useByDate).toISOString().split('T')[0] : '');
      setImageUrl(foundItem.imageUrl || '');
      setUpc(foundItem.upc || '');

      // De-normalize baseAmount back to UI
      if (foundItem.unitType === 'g' && foundItem.baseAmount >= 1000) {
        setUiAmount(foundItem.baseAmount / 1000);
        setUiUnit('kg');
      } else if (foundItem.unitType === 'ml' && foundItem.baseAmount >= 1000) {
        setUiAmount(foundItem.baseAmount / 1000);
        setUiUnit('l');
      } else {
        setUiAmount(foundItem.baseAmount);
        setUiUnit(foundItem.unitType as any);
      }
    }
  }, [state.items, id]);

  if (!item) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">Item not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium">Go Back</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let baseAmount = Number(uiAmount);
    let unitType: UnitType = uiUnit as UnitType;

    if (uiUnit === 'kg') {
      baseAmount = baseAmount * 1000;
      unitType = 'g';
    } else if (uiUnit === 'l') {
      baseAmount = baseAmount * 1000;
      unitType = 'ml';
    }

    const updatedItem: Item = {
      ...item,
      name,
      baseAmount,
      unitType,
      quantity: Number(quantity),
      purchaseDate: new Date(purchaseDate).toISOString(),
      bestBeforeDate: bestBeforeDate ? new Date(bestBeforeDate).toISOString() : null,
      useByDate: useByDate ? new Date(useByDate).toISOString() : null,
      price: price ? Number(price) : null,
      upc: upc || null,
      imageUrl: imageUrl || null
    };

    updateItem(updatedItem);
    navigate(-1);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      deleteItem(item.id);
      navigate(-1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 flex-1">Edit Item</h2>
        <button onClick={handleDelete} className="p-2 rounded-full text-danger hover:bg-red-50" title="Delete Item">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
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
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              placeholder="https://example.com/image.jpg (Optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">UPC Barcode</label>
            <input
              type="text"
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
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
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-warning">Best Before</label>
              <input
                type="date"
                value={bestBeforeDate}
                onChange={(e) => setBestBeforeDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-danger">Use By</label>
              <input
                type="date"
                value={useByDate}
                onChange={(e) => setUseByDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-primary focus:border-primary"
              />
            </div>
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

export default EditItem;
