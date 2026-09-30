import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import { RoadmapProvider } from './context/RoadmapContext';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import WarmupPage from './pages/WarmupPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import RoadmapOnboardingPage from './pages/roadmap/RoadmapOnboardingPage';
import RoadmapViewPage from './pages/roadmap/RoadmapViewPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

/** Wrap a page in AppShell (authenticated layout) */
function ShellPage({ children, title }: { children: React.ReactNode; title?: string }) {
  return <AppShell pageTitle={title}>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Authenticated with Shell ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ShellPage title="Overview"><DashboardPage /></ShellPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <ShellPage title="Admin Panel"><AdminDashboardPage /></ShellPage>
          </ProtectedRoute>
        }
      />

      {/* Interview routes — shell-wrapped */}
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <ShellPage title="Mock Interviews"><SetupPage /></ShellPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warmup"
        element={
          <ProtectedRoute>
            <ShellPage title="Interview Warmup"><WarmupPage /></ShellPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <ShellPage title="Live Interview"><InterviewPage /></ShellPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/report/:sessionId"
        element={
          <ProtectedRoute>
            <ShellPage title="Interview Report"><ReportPage /></ShellPage>
          </ProtectedRoute>
        }
      />

      {/* Roadmap routes */}
      <Route
        path="/roadmap/start"
        element={
          <ProtectedRoute>
            <ShellPage title="My Roadmap"><RoadmapOnboardingPage /></ShellPage>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap/:profileId"
        element={
          <ProtectedRoute>
            <ShellPage title="My Roadmap"><RoadmapViewPage /></ShellPage>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RoadmapProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoadmapProvider>
      </InterviewProvider>
    </AuthProvider>
  );
}
