import styles from "./Platos.module.css"
import { DishCard } from  "../../components/Dishcard/Dishcard"
import { GET_PLATOS_ENDPOINT} from '../../util/config';
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";          // 👈 añadir

export function Platos() {
  const [platos, setPlatos] = useState([]);
  const navigate = useNavigate();                        // 👈 añadir

  const fetchPlatos = async () => {
    try {
      const response = await fetch(`${GET_PLATOS_ENDPOINT}`);
      const data = await response.json();
      setPlatos(data);
    } catch (error) {
      console.error("Error al cargar los platos:", error);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Nuestros Platos</h1>

      <div className={styles.grid}>
        {platos.map((dish, index) => (
          <div key={index} className={styles.cardWrapper}>  
            <DishCard {...dish} />
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