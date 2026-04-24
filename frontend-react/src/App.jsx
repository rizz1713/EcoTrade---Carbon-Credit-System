import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import History from './pages/History'
import Network from './pages/Network'
import Companies from './pages/Companies'
import Layout from './components/Layout'
import './index.css'

function App() {
  const [user, setUser] = useState(null); // { role: 'admin' | 'company', id: string }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />} 
        />
        
        {user ? (
          <Route path="/" element={<Layout user={user} onLogout={() => setUser(null)} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="trading" element={<Trading user={user} />} />
            <Route path="history" element={<History />} />
            <Route path="network" element={<Network />} />
            {user.role === 'admin' && (
              <Route path="companies" element={<Companies />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
