import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ChatPage } from './pages/ChatPage';
import { ChartPage } from './pages/ChartPage';
import { DailyGuidance } from './pages/DailyGuidance';
import { TransitsPage } from './pages/TransitsPage';
import { Journal } from './pages/Journal';
import { LearningHub } from './pages/LearningHub';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { CosmicEvents } from './pages/CosmicEvents';
import { DevDashboard } from './pages/DevDashboard';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/daily-guidance" element={<DailyGuidance />} />
              <Route path="/transits" element={<TransitsPage />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/learning" element={<LearningHub />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/cosmic-events" element={<CosmicEvents />} />
              <Route path="/dev" element={<DevDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <ToastContainer />
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
