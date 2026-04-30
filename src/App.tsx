import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings as SettingsIcon, TrendingUp, Info } from 'lucide-react';
import { StateProvider } from './context/StateContext';
import Dashboard from './views/Dashboard';
import AddItem from './views/AddItem';
import Settings from './views/Settings';
import FoodTypeDetail from './views/FoodTypeDetail';
import EditItem from './views/EditItem';
import EditFoodType from './views/EditFoodType';
import LogPrice from './views/LogPrice';
import About from './views/About';
import { ReloadPrompt } from './components/ReloadPrompt';

const Navigation = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Stock' },
    { to: '/add', icon: PlusCircle, label: 'Add Item' },
    { to: '/log-price', icon: TrendingUp, label: 'Market' },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <StateProvider>
      <Router>
        <div className="min-h-screen pb-20 bg-slate-50">
          <header className="bg-primary text-white shadow-md sticky top-0 z-10 pt-safe">
            <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2">
              <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/pwa-512x512.png" alt="FoodRes" className="w-8 h-8 rounded-lg shadow-sm" />
                <h1 className="text-xl font-bold tracking-tight">FoodRes</h1>
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `p-2 rounded-full transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
                }
                title="About FoodRes"
              >
                <Info size={20} />
              </NavLink>
            </div>
          </header>

          <main className="max-w-md mx-auto p-4 space-y-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddItem />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/food/:id" element={<FoodTypeDetail />} />
              <Route path="/edit-item/:id" element={<EditItem />} />
              <Route path="/edit-food-type/:id" element={<EditFoodType />} />
              <Route path="/log-price" element={<LogPrice />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>

          <Navigation />
          <ReloadPrompt />
        </div>
      </Router>
    </StateProvider>
  );
};

export default App;
