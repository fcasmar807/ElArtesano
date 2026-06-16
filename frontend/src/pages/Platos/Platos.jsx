import styles from "./Platos.module.css"
import { DishCard } from "../../components/Dishcard/Dishcard"
import { GET_PLATOS_ENDPOINT } from '../../util/config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ME_ENDPOINT  = "http://localhost:8080/gestor-pescaderia/public/api/me";
const ADMIN_ROL_ID = 2; // cambia si tu admin tiene otro rol_id

export function Platos() {
  const [platos,   setPlatos]   = useState([]);
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [deleting, setDeleting] = useState(null); // id del plato que se está borrando
  const [toast,    setToast]    = useState(null);
  const navigate = useNavigate();

  /* ── Comprobar si el usuario es admin ── */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(ME_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (!user) return;
        const rol = user.rol_id ?? user.role_id;
        if (rol === ADMIN_ROL_ID) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  /* ── Cargar platos ── */
  const fetchPlatos = async () => {
    try {
      const res  = await fetch(GET_PLATOS_ENDPOINT);
      const data = await res.json();
      setPlatos(data);
    } catch (err) {
      console.error("Error al cargar los platos:", err);
    }
  };

  useEffect(() => { fetchPlatos(); }, []);

  /* ── Borrar plato ── */
  const handleDelete = async (plato) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${plato.nombre}"?`)) return;

    setDeleting(plato.id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${GET_PLATOS_ENDPOINT}/${plato.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      setPlatos((prev) => prev.filter((p) => p.id !== plato.id));
      showToast("Plato eliminado correctamente", "success");
    } catch (err) {
      showToast(`No se pudo eliminar: ${err.message}`, "error");
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Render ── */
  return (
    <div className={styles.container}>
      <h1>Nuestros Platos</h1>

      <div className={styles.grid}>
        {platos.map((dish, index) => (
          <div key={index} className={styles.cardWrapper}>  
          <DishCard
  {...dish}
imagen={dish.imagen ?? "/placeholder.jpg"}/>
            <button                                         
              className={styles.detalleBtn}
              onClick={() => navigate(`/platos/${dish.id}`)}
            >
              Ver detalles →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}