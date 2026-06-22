import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRouts from './components/auth/ProtectedRouts'
import ScrollToTop from './components/layout/ScrollToTop'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import ProfilePage from './pages/ProfilePage'
import ViewBookPage from './pages/ViewBookPage'
import DiscoverPage from './pages/DiscoverPage'
import PricingPage from './pages/PricingPage'


import ThemeSwitcher from './components/ui/ThemeSwitcher'

const App = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-250 flex flex-col">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRouts>
              <DashboardPage />
            </ProtectedRouts>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRouts>
              <EditorPage />
            </ProtectedRouts>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRouts>
              <ProfilePage />
            </ProtectedRouts>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRouts>
              <PricingPage />
            </ProtectedRouts>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRouts>
              <DiscoverPage />
            </ProtectedRouts>
          }
        />
        <Route
          path="/view-book/:bookId"
          element={
            <ProtectedRouts>
              <ViewBookPage />
            </ProtectedRouts>
          }
        />
      </Routes>
    </div>
  );
};

export default App
