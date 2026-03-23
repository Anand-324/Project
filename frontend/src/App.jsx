import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './hooks/useAppContext';
import Sidebar from './components/Sidebar';
import Dashboard    from './pages/Dashboard';
import ProfilePage  from './pages/ProfilePage';
import AptitudePage from './pages/AptitudePage';
import CodingPage   from './pages/CodingPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage  from './pages/ResultsPage';
import AdminPage    from './pages/AdminPage';
import RecruiterPage from './pages/RecruiterPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/profile"   element={<ProfilePage />} />
              <Route path="/aptitude"  element={<AptitudePage />} />
              <Route path="/coding"    element={<CodingPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/results"   element={<ResultsPage />} />
              <Route path="/admin"     element={<AdminPage />} />
              <Route path="/recruiter" element={<RecruiterPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
