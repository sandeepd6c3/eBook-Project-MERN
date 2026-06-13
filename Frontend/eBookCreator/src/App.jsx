import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRouts from './components/auth/ProtectedRouts'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import ProfilePage from './pages/ProfilePage'
import ViewBookPage from './pages/ViewBookPage'


const App = () => {
  return (
    <div>

      <Routes>
        {/* Public Routes  */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/view-book/:bookId" element={<ViewBookPage />} />


        {/* Protected Routes */}

        <Route path="/dashboard" element={<ProtectedRouts><DashboardPage /></ProtectedRouts>} />


        <Route path="/editor" element={<ProtectedRouts><EditorPage /></ProtectedRouts>} />

        <Route path="/profile" element={<ProtectedRouts><ProfilePage /></ProtectedRouts>} />
        <Route path="/view-book/:bookId" element={<ProtectedRouts><ViewBookPage /></ProtectedRouts>} />

      </Routes>

    </div>
  )
}

export default App
