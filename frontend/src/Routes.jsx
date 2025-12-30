import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './components/landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}