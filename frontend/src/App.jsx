import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./layout/Layout"
import { Home } from "./pages/Home/Home"
import { Platos } from "./pages/Platos/Platos"
import { About_Us } from "./pages/About_Us/About_Us"
import Login from "./pages/SignIn/Login"
import { AuthProvider } from "./pages/context_providers/AuthProvider"
import Contact from "./pages/Contact/contact"
import Userpage from "./pages/userPage/Userpage"
import ProtectedRoutes from "./util/ProtectedRoutes"
import EditProfilePage from "./pages/Edit_Profile/edit"
import AdminDashboard from "./pages/Admin/dashboard"
import AdminRoute from "./util/AdminRoute"
import { PlatoDetalle } from "./pages/Detalles_Plato/PlatoDetalle"
import Reservas from "./pages/Reservas/Reservas"
import SubirPlato from "./pages/Platos/SubirPlato";
import MisReservas from "./pages/Reservas/MisReservas"
import Register from "./pages/Register/Register";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/platos" element={<Platos />} />
            <Route path="/about" element={<About_Us />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/platos/:id" element={<PlatoDetalle />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoutes />}>
              {/* Aquí van las rutas protegidas */}
              <Route path="/perfil" element={<Userpage />} />
              <Route path="/perfil/editar" element={<EditProfilePage />} />
<Route path="/mis-reservas" element={<MisReservas />} />

            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/subir-plato" element={<SubirPlato />} />
            </Route>
          </Route>


        </Routes>


      </AuthProvider></BrowserRouter>
  )
}

export default App