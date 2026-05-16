import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import SellerDashboard from './pages/seller/SellerDashboard'
import AddListing from './pages/seller/AddListing'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import FoodbankDashboard from './pages/foodbank/FoodbankDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

function DashboardRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'seller')   return <SellerDashboard />
  if (user.role === 'buyer')    return <BuyerDashboard />
  if (user.role === 'foodbank') return <FoodbankDashboard />
  if (user.role === 'admin')    return <AdminDashboard />
  return <Navigate to="/" />
}

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/listings"    element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/login"       element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register"    element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard"   element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/seller/add"  element={<ProtectedRoute roles={['seller']}><AddListing /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
