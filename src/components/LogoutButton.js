import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Hacer una solicitud al endpoint de logout
      await axios.post('http://localhost/eventosC/logout.php');

      // Limpiar el estado de autenticación
      localStorage.removeItem('user');

      // Redirigir al usuario a la página de login
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '10px 20px',
        backgroundColor: '#6c5ce7',
        color: 'white',
        border: '16px',
        cursor: 'pointer',
        borderRadius: '5px',
        
        
      }}
    >
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;