import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap, TrendingUp, Download, Smartphone } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Efficient Tracking',
      description: 'Add items quickly using barcode scanning or manual entry. Track amounts in grams, milliliters, or units.'
    },
    {
      icon: TrendingUp,
      title: 'Inflation Analysis',
      description: 'Log current market prices to see how your pantry value changes over time compared to what you paid.'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy First',
      description: 'All data is stored locally in your browser. No accounts, no tracking, and no data leaves your device.'
    },
    {
      icon: Download,
      title: 'Data Portability',
      description: 'Export your entire inventory to a JSON file at any time for backups or transferring to other devices.'
    },
    {
      icon: Smartphone,
      title: 'Offline Ready',
      description: 'Works perfectly without an internet connection. Install it as a PWA for a full app experience.'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">About FoodRes</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 leading-relaxed mb-6">
          FoodRes is a modern Progressive Web App (PWA) designed to help households manage their food reserves, 
          track shelf-life, and analyze market inflation trends.
        </p>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <feature.icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-normal">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl text-white">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Zap size={18} className="text-primary" />
          How to use
        </h3>
        <ul className="space-y-3 text-sm text-slate-300 list-disc pl-4">
          <li>Add your first item by clicking <strong>Add Item</strong> and either scanning a barcode or entering details manually.</li>
          <li>Group similar items (e.g., "White Rice") to see your total <strong>Survival</strong> duration based on your consumption rate.</li>
          <li>Use <strong>FIFO Consumption</strong> (First-In-First-Out) to automatically remove the oldest items first.</li>
          <li>Periodically log <strong>Market Prices</strong> to visualize inflation and see your cost savings in the Detail view.</li>
          <li>Regularly <strong>Export Data</strong> in Settings to keep a safe backup of your inventory.</li>
        </ul>
      </div>

      <div className="text-center text-xs text-slate-400 pt-4">
        <p>FoodRes.MannanLive.com — Version 1.0.0</p>
      </div>
    </div>
  );
};

export default About;
