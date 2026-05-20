import styles from './userPage.module.css'
import { useAuth } from '../context_providers/AuthProvider'
import { Link, Navigate } from 'react-router-dom'

export default function UserPage() {
  const { user, logout } = useAuth()
  const roleId = Number(user?.rol_id)
  const isClient = roleId === 2

  console.log("User data in UserPage:", user)
  if (!isClient) {
    return <Navigate to="/" replace />
  }

  const roleLabel = 
     roleId === 2
      ? 'Rol: Cliente'
      : 'Rol: Usuario'
  const profile = {
    nombre: user?.name ?? user?.nombre ?? 'Usuario',
    email: user?.email ?? 'Sin email',
    telefono: user?.telefono ?? 'Sin telefono',
    fecha_registro: user?.fecha_registro ?? 'Sin fecha de registro',
    estado: user?.estado ?? 'Activo',
  }

  const campos = [
    { label: 'Nombre',             value: profile.nombre },
    { label: 'Correo electrónico', value: profile.email },
    { label: 'Contraseña',         value: '••••••••' },
    { label: 'Teléfono',           value: profile.telefono },
    { label: 'Fecha de registro',  value: profile.fecha_registro },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Cabecera */}
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            {(profile.nombre ?? 'AR').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.nombre}>{profile.nombre}</h1>
            <p className={styles.rol}>{roleLabel}</p>
          </div>
        </div>

        {/* Lista de datos */}
        <ul className={styles.lista}>
          {campos.map(({ label, value }) => (
            <li key={label} className={styles.fila}>
              <span className={styles.label}>{label}</span>
              <span className={styles.value}>{value}</span>
              
            </li>
          ))}
        </ul>

        {/* Botones */}
        <div className={styles.acciones}>
          <Link to="/perfil/editar" className={styles.editBtn}>Editar perfil</Link>
          <button className={styles.logoutBtn} onClick={logout}> Cerrar sesión</button>
        </div>

      </div>
    </div>
  )
}