import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { PlannerProvider, usePlanner } from './context/PlannerContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import TripsPage from './pages/TripsPage.jsx';
import TripDetailPage from './pages/TripDetailPage.jsx';

function ProtectedTripRoute() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, notify } = usePlanner();
  const trip = trips.find((item) => item.id === tripId);

  useEffect(() => {
    if (!trip) {
      notify('That trip could not be found.');
      navigate('/trips', { replace: true });
    }
  }, [navigate, notify, trip]);

  return trip ? <TripDetailPage trip={trip} /> : null;
}

function RouteTree() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="destinations" element={<ExplorePage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:tripId" element={<ProtectedTripRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <PlannerProvider><BrowserRouter><RouteTree /></BrowserRouter></PlannerProvider>;
}