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
import { Header } from './components/layout/Header';
import { PageTransition } from './components/layout/PageTransition';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  return (
    <>
      {!isAuthPage && <Header />}
      <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      
      {/* Auth routes */}
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><PageTransition><AdminDashboardPage /></PageTransition></ProtectedRoute>} />
      
      {/* Interview routes */}
      <Route path="/setup" element={<ProtectedRoute><PageTransition><SetupPage /></PageTransition></ProtectedRoute>} />
      <Route path="/warmup" element={<ProtectedRoute><PageTransition><WarmupPage /></PageTransition></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><PageTransition><InterviewPage /></PageTransition></ProtectedRoute>} />
      <Route path="/report/:sessionId" element={<ProtectedRoute><PageTransition><ReportPage /></PageTransition></ProtectedRoute>} />
      
      {/* Career Roadmap routes */}
      <Route path="/roadmap/start" element={<ProtectedRoute><PageTransition><RoadmapOnboardingPage /></PageTransition></ProtectedRoute>} />
      <Route path="/roadmap/:profileId" element={<ProtectedRoute><PageTransition><RoadmapViewPage /></PageTransition></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
      <RoadmapProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col relative">
               <AnimatedRoutes />
            </main>
          </div>
        </BrowserRouter>
      </RoadmapProvider>
    </InterviewProvider>
    </AuthProvider>
  );
}
