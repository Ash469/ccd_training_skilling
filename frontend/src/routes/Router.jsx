import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/home'
import Login from '../pages/login'
import Register from '../pages/register'
import UserDashboard from '../pages/user/userDashboard'
import AdminDashboard from '../pages/admin/adminDashboard'
// import RegisteredEvents from '../pages/dashboard/registered'

export default function Router({ darkMode, toggleDarkMode }) {
  return (
    <Routes>
      <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/login" element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/register" element={<Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/user/dashboard" element={<UserDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />  
      <Route path="/admin/dashboard" element={<AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />  
    </Routes>
  )
}