import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Auth() {
  const [view, setView] = useState("login");

  return (
    <div>
      <div>
        <button onClick={() => setView("login")}>Iniciar Sesión</button>
        <button onClick={() => setView("register")}>Registrarse</button>
      </div>
      {view === "login" ? <Login /> : <Register />}
    </div>
  );
}

export default Auth;
