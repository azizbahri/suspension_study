import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ImportPage from './pages/ImportPage';
import CalibratePage from './pages/CalibratePage';
import AnalyzePage from './pages/AnalyzePage';
import ComparePage from './pages/ComparePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/calibrate" element={<CalibratePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
