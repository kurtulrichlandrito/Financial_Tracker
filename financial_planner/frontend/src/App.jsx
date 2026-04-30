import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import AccountsPage from './pages/AccountsPage'
import AccountDetailPage from './pages/AccountDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionImportPage from './pages/TransactionImportPage'
import CategoriesPage from './pages/CategoriesPage'
import AssetsPage from './pages/AssetsPage'
import LiabilitiesPage from './pages/LiabilitiesPage'
import NetWorthPage from './pages/NetWorthPage'
import ReportsPage from './pages/ReportsPage'
import ChartsPage from './pages/ChartsPage'

function useAuthStatus() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch('/api/check-auth/', {
      method: 'GET',
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((data) => setStatus(data.isAuthenticated ? 'authenticated' : 'guest'))
      .catch(() => setStatus('guest'))
  }, [])

  return status
}

function ProtectedRoutes() {
  const status = useAuthStatus()

  if (status === 'loading') {
    return (
      <div className="app-loading">
        Loading...
      </div>
    )
  }

  if (status === 'guest') return <Navigate to="/login" replace />

  return <AppShell />
}

function HomeRedirect() {
  const status = useAuthStatus()

  if (status === 'loading') {
    return (
      <div className="app-loading">
        Loading...
      </div>
    )
  }

  return <Navigate to={status === 'authenticated' ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/import" element={<TransactionImportPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/liabilities" element={<LiabilitiesPage />} />
          <Route path="/net-worth" element={<NetWorthPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/charts" element={<ChartsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
