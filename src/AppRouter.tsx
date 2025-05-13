import { Routes, Route } from 'react-router-dom';
import MentalHealthPage from './components/MentalHealthPage';
import DASS21TestPage from './components/DASS21TestPage';
// Import other pages as needed

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/mental-health" element={<MentalHealthPage />} />
      <Route path="/mental-health/dass21-test" element={<DASS21TestPage />} />
      {/* Add other routes as needed */}
    </Routes>
  );
}
