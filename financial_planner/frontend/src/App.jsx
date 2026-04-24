import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './components/auth/Login'
import Dashboard from './components/Dashboard'
import Register from './components/auth/Register';

function App() {

  const AuthCheck = () => {
    const navigate = useNavigate()

    useEffect(() => {
      fetch('/api/check-auth')
        .then(res => res.json())
        .then(data => {
          if (data.isAuthenticated) {
            navigate('/dashboard')
          } else {
            navigate('/login')
          }
        })
    }, [])

    return null
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthCheck />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )


}

export default App
