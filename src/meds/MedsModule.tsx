import { Routes, Route } from 'react-router-dom';
import { MedsProvider } from './context/MedsContext';
import MedsDashboard from './views/MedsDashboard';
import AddEditMedication from './views/AddEditMedication';
import AddBatch from './views/AddBatch';
import DailyRoutine from './views/DailyRoutine';
import MedicationDetail from './views/MedicationDetail';

const MedsModule = () => {
  return (
    <MedsProvider>
      <Routes>
        <Route index element={<MedsDashboard />} />
        <Route path="routine" element={<DailyRoutine />} />
        <Route path="detail/:id" element={<MedicationDetail />} />
        <Route path="add" element={<AddEditMedication />} />
        <Route path="edit/:id" element={<AddEditMedication />} />
        <Route path="add-batch/:medId" element={<AddBatch />} />
      </Routes>
    </MedsProvider>
  );
};

export default MedsModule;
