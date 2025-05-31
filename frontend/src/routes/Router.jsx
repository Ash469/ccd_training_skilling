import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/login'
import UserDashboard from '../pages/user/userDashboard'
import Registration from '../pages/user/registration'
import Profile from '../pages/user/profile'
import CompleteProfile from '../pages/user/completeProfile'
import AdminDashboard from '../pages/admin/adminDashboard'
import CreateEvent from '../pages/admin/createEvents'
import EventRegistrations from '../pages/admin/eventRegistrations'
import StudentAnalytics from '../pages/admin/studentAnalytics'


export default function Router({ darkMode, toggleDarkMode }) {
  return (
    <Routes>
      <Route path="/" element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/login" element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/user/dashboard" element={<UserDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />  
      <Route path="/user/registration" element={<Registration darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/user/profile" element={<Profile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/user/complete-profile" element={<CompleteProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />  
      <Route path="/admin/create-event" element={<CreateEvent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/admin/events/:eventId/registrations" element={<EventRegistrations darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/admin/student-analytics" element={<StudentAnalytics darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
    </Routes>
  )
}
