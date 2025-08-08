import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const root = document.documentElement;
      const hue = Math.floor(Math.random() * 40) + 220;
      root.style.setProperty("--gradient-hue", `${hue}`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost/eventosC/register.php", {
        nombre,
        email,
        password,
      });

      if (response.data.success) {
        setSuccess("Registro exitoso. ¡Ahora puedes iniciar sesión!");
        setError(null);
      } else {
        setError(response.data.message || "Error al registrarse");
        setSuccess(null);
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Intenta de nuevo.");
      setSuccess(null);
      console.error("Error en el registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className="logo-circle"></div>
            <div className="logo-text">EventosC</div>
          </div>
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Completa tus datos para registrarte</p>
        </div>

        {error && (
          <div className="register-error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="register-success">
            <span>{success}</span>
            <button onClick={handleLoginRedirect} className="login-redirect-button">
              Iniciar sesión
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="register-form">
            <div className={`form-group ${activeField === "nombre" ? "active" : ""} ${nombre ? "filled" : ""}`}>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onFocus={() => handleFocus("nombre")}
                onBlur={handleBlur}
                required
                className="form-input"
              />
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
            </div>

            <div className={`form-group ${activeField === "email" ? "active" : ""} ${email ? "filled" : ""}`}>
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
            </div>

            <div className={`form-group ${activeField === "password" ? "active" : ""} ${password ? "filled" : ""}`}>
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
            </div>

            <button type="submit" className={`register-submit-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : <span>Registrarse</span>}
            </button>
          </form>
        )}

        {!success && (
          <div className="register-divider">
            <span>¿Ya tienes una cuenta?</span>
          </div>
        )}

        {!success && (
          <button onClick={handleLoginRedirect} className="login-redirect-button">
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Register;
