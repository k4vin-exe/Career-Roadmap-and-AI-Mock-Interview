import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';
import { Header } from './components/layout/Header';
import { PageTransition } from './components/layout/PageTransition';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/setup" element={<PageTransition><SetupPage /></PageTransition>} />
      <Route path="/interview" element={<PageTransition><InterviewPage /></PageTransition>} />
      <Route path="/report/:sessionId" element={<PageTransition><ReportPage /></PageTransition>} />
    </Routes>
  );
}

export default function App() {
  return (
    <InterviewProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex flex-col relative">
             <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </InterviewProvider>
  );
}
