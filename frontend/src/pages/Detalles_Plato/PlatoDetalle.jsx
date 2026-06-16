import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Añade STORAGE_URL al import
import { GET_PLATOS_ENDPOINT, FILTER_PLATO_INGREDIENTES_ENDPOINT } from "../../util/config"; import styles from "./PlatoDetalle.module.css";

export function PlatoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plato, setPlato] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [loadingPlato, setLoadingPlato] = useState(true);
  const [loadingIngredientes, setLoadingIngredientes] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlato = async () => {
    try {
      const response = await fetch(`${GET_PLATOS_ENDPOINT}/${id}`);
      if (!response.ok) throw new Error("Plato no encontrado");
      const data = await response.json();
      setPlato(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlato(false);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const response = await fetch(`${FILTER_PLATO_INGREDIENTES_ENDPOINT}/${id}`);
      if (!response.ok) throw new Error("Error al cargar ingredientes");
      const data = await response.json();
      setIngredientes(data);
    } catch (err) {
      console.error("Error al cargar los ingredientes:", err);
    } finally {
      setLoadingIngredientes(false);
    }
  };

  useEffect(() => {
    fetchPlato();
    fetchIngredientes();
  }, [id]);

  if (loadingPlato) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Cargando plato...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <span className={styles.errorIcon}>⚠</span>
        <p>{error}</p>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className={styles.card}>
        {/* Imagen */}
        <div className={styles.imageWrapper}>
          {plato.imagen ? (
            <img
              src={plato.imagen ?? "/placeholder.jpg"}
              alt={plato.nombre}
              className={styles.image}
            />) : (
            <div className={styles.imagePlaceholder}>Sin imagen</div>
          )}
          {/* Badge de estado */}
          <span className={`${styles.estadoBadge} ${plato.estado ? styles.activo : styles.inactivo}`}>
            {plato.estado ? "Disponible" : "No disponible"}
          </span>
        </div>

        {/* Info principal */}
        <div className={styles.info}>
          <h1 className={styles.nombre}>{plato.nombre}</h1>

          <p className={styles.descripcion}>{plato.descripcion}</p>

          <div className={styles.precio}>
            {parseFloat(plato.precio).toFixed(2)} €
          </div>

          {/* Ingredientes */}
          <div className={styles.ingredientesSection}>
            <h2 className={styles.ingredientesTitle}>Ingredientes</h2>

            {loadingIngredientes ? (
              <p className={styles.loadingText}>Cargando ingredientes...</p>
            ) : ingredientes.length > 0 ? (
              <ul className={styles.ingredientesList}>
                {ingredientes.map((item, index) => (
                  <li key={index} className={styles.ingredienteItem}>
                    <span className={styles.ingredienteDot} />
                    {/* Ajusta el campo según tu respuesta de la API */}
                    {item.ingrediente?.nombre ?? item.ingrediente_id}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>Este plato no tiene ingredientes registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}