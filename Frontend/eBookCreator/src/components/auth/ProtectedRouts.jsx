import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRouts = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRouts
