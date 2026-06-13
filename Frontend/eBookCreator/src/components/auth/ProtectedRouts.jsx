import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRouts = ({ children }) => {
    const isAuthenticated = true
    const loading = false // Replace with your loading state logic
    const location = useLocation()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRouts
