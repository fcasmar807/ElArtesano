import styles from './Header.module.css'
import { Link } from "react-router-dom"
import { useAuth } from "../../pages/context_providers/AuthProvider"; // 👈 IMPORTANTE

export function Header() {

  const { isAuthenticated,  logout, user } = useAuth(); // 👈 sacas el estado
const isAdmin = user?.rol_id === 1; 
console.log(isAdmin);
  return (
    <header className={styles.header}>
      <h1>El Artesano</h1>

      <nav>
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>

          <li>
            <Link to="/about">Sobre Nosotros</Link>
          </li>

          <li>
            <Link to="/platos">Platos</Link>
          </li>

          <li>
            <Link to="/contact">Contacto</Link>
          </li>

          {/* 👇 SOLO si NO está logeado */}
          {!isAuthenticated && (
            <li>
              <Link to="/signin">Iniciar Sesión</Link>
            </li>
          )}

          {/* 👇 SOLO si está logeado */}
          {isAuthenticated && (
            <>
            {isAdmin && (
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            )}
            {!isAdmin && (
                <li>
                <Link to="/perfil">Mi Perfil</Link>
              </li>
           

            )}
               <li>
                <button onClick={logout}>Cerrar sesión</button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}