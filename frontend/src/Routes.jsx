import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} /> 
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}