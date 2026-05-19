import styles from "./Dishcard.module.css"

export function DishCard({ nombre, descripcion, precio, imagen }) {
  return (
    <div className={styles.card}>
      <img src={imagen} alt={nombre} />

      <div className={styles.content}>
        <h3>{nombre}</h3>
        <p>{descripcion}</p>

        <div className={styles.footer}>
          <span>{precio}€</span>
         
        </div>
      </div>
    </div>
  )
}