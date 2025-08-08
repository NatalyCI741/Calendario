import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import Register from "./paginas/Register";
import RegistroEvento from "./paginas/RegistroEvento";  // Asegúrate de importar esto

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/RegistroEvento" element={<RegistroEvento />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
