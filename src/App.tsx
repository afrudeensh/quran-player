import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import Login from './pages/Login'
import Library from './pages/Library'
import Player from './pages/Player'

function Protected({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <p className="p-8">Loading...</p>
  return session ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Library /></Protected>} />
            <Route path="/player/:id" element={<Protected><Player /></Protected>} />
            
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}