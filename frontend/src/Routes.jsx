import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './components/landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import AdminDashboard from './pages/Admin/Admindashboard'
import ManageCustomer from './pages/Admin/ManageCustomer'
import CustomerDashboard from './pages/User/Customerdashboard'
import CustomerProfile from './pages/User/customerprofile'
import Menu from './pages/menu'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/customers" element={<ManageCustomer />} />
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />
    </Routes>
  )
}