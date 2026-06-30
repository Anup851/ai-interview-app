import { Navigate, Route, Routes } from 'react-router-dom'
import AuthRedirectHandler from './components/common/AuthRedirectHandler.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ResumeAnalysisPage from './pages/ResumeAnalysisPage.jsx'
import InterviewGeneratorPage from './pages/InterviewGeneratorPage.jsx'
import MockInterviewPage from './pages/MockInterviewPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PracticePlanPage from './pages/PracticePlanPage.jsx'
import StoryBankPage from './pages/StoryBankPage.jsx'
import JobTrackerPage from './pages/JobTrackerPage.jsx'
import DrillLabPage from './pages/DrillLabPage.jsx'
import DSAPracticePage from './pages/DSAPracticePage.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthRedirectHandler />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="resume" element={<ResumeAnalysisPage />} />
              <Route path="generator" element={<InterviewGeneratorPage />} />
              <Route path="mock" element={<MockInterviewPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="plan" element={<PracticePlanPage />} />
              <Route path="stories" element={<StoryBankPage />} />
              <Route path="jobs" element={<JobTrackerPage />} />
              <Route path="drills" element={<DrillLabPage />} />
              <Route path="dsa" element={<DSAPracticePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
