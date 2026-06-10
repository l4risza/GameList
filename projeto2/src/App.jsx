import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Listas from './pages/Listas'
import DetalheLista from './pages/DetalheLista'

function RotaProtegida({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function RotaPublica({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/listas" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/listas" replace />} />
          <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
          <Route path="/signup" element={<RotaPublica><SignUp /></RotaPublica>} />
          <Route path="/listas" element={<RotaProtegida><Listas /></RotaProtegida>} />
          <Route path="/listas/:id" element={<RotaProtegida><DetalheLista /></RotaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
