import type { LocalStorageState } from './types';
import { v4 as uuidv4 } from 'uuid';

export const exampleData: LocalStorageState = {
  foodTypes: [
    {
      id: 'ft-1',
      name: 'Jasmine Rice',
      tags: ['Staples', 'Pantry'],
      weeklyConsumptionRate: 500, // 500g per week
    },
    {
      id: 'ft-2',
      name: 'Canned Tomatoes',
      tags: ['Canned', 'Cooking'],
      weeklyConsumptionRate: 1.5, // 1.5 units per week
    }
  ],
  items: [
    {
      id: uuidv4(),
      foodTypeId: 'ft-1',
      name: 'SunRice Jasmine',
      baseAmount: 5000,
      unitType: 'g',
      quantity: 2,
      purchaseDate: new Date().toISOString(),
      bestBeforeDate: new Date(Date.now() + 31536000000 * 2).toISOString(), // +2 years
      price: 15.50,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&q=80',
    },
    {
      id: uuidv4(),
      foodTypeId: 'ft-2',
      name: 'Mutti Polpa',
      baseAmount: 400,
      unitType: 'g',
      quantity: 12,
      purchaseDate: new Date().toISOString(),
      bestBeforeDate: new Date(Date.now() + 31536000000).toISOString(), // +1 year
      price: 2.20,
    }
  ]
};
