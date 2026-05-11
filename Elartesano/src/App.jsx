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
import { Dashboard } from "./pages/Admin/dashboard"
import AdminRoute from "./util/AdminRoute"
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

            <Route element={<ProtectedRoutes />}>
              {/* Aquí van las rutas protegidas */}
              <Route path="/perfil" element={<Userpage />} />
              <Route path="/perfil/editar" element={<EditProfilePage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Dashboard />} />

            </Route>
          </Route>


        </Routes>


      </AuthProvider></BrowserRouter>
  )
}

export default App