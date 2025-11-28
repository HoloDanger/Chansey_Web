import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ProviderDashboard from './ProviderDashboard'
import TriageScreen from './screens/TriageScreen'
import VideoCallApp from './screens/VideoCallApp'
import ComingSoon from './screens/ComingSoon'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/triage" element={<TriageScreen />} />
            <Route path="/doctor-dashboard" element={<ProviderDashboard />} />
            <Route path="/video" element={<VideoCallApp />} />
            <Route path="/health-journal" element={<ComingSoon title="Health Journal" description="Access your medical history, prescriptions, and vaccinations." />} />
            <Route path="/doctor-availability" element={<ComingSoon title="Doctor Availability" description="View real-time availability of our healthcare professionals." />} />
            <Route path="/lab-test-booking" element={<ComingSoon title="Lab Test Booking" description="Order lab tests with sample collection at your doorstep." />} />
            <Route path="/health-plan" element={<ComingSoon title="Health Plan" description="Browse available health plans to find the perfect coverage." />} />
            <Route path="/notifications" element={<ComingSoon title="Notifications & Alerts" description="Stay updated with reminders and health alerts." />} />
            <Route path="/about" element={<ComingSoon title="About Us" description="Learn more about our mission for accessible healthcare." />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
