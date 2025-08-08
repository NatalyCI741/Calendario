"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./Login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const navigate = useNavigate()

  // Animation effect for background
  useEffect(() => {
    const interval = setInterval(() => {
      const root = document.documentElement
      const hue = Math.floor(Math.random() * 40) + 220 // Blue-purple range
      root.style.setProperty("--gradient-hue", `${hue}`)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost/eventosC/login.php", {
        email,
        password,
      })

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user))
        if (response.data.user.rol === "admin") {
          navigate("/RegistroEvento")
        } else {
          // Handle non-admin user navigation
        }
      } else {
        setError(response.data.message || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Intenta de nuevo.")
      console.error("Error en el inicio de sesión:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterRedirect = () => {
    navigate("/register")
  }

  const handleFocus = (field) => {
    setActiveField(field)
  }

  const handleBlur = () => {
    setActiveField(null)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-circle"></div>
            <div className="logo-text">EventosC</div>
          </div>
          <h2>Bienvenido</h2>
          <p className="subtitle">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="login-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${activeField === "email" ? "active" : ""} ${email ? "filled" : ""}`}>
            <div className="input-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
              required
              className="form-input"
            />
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <div className="input-highlight"></div>
          </div>

          <div className={`form-group ${activeField === "password" ? "active" : ""} ${password ? "filled" : ""}`}>
            <div className="input-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => handleFocus("password")}
              onBlur={handleBlur}
              required
              className="form-input"
            />
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-highlight"></div>
          </div>

          
          <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : <span>Iniciar Sesión</span>}
          </button>
        </form>

        <div className="login-divider">
          <span>o</span>
        </div>

        <button onClick={handleRegisterRedirect} className="register-button">
          <span>Crear una cuenta nueva</span>
        </button>
      </div>
    </div>
  )
}

export default Login

