import styles from "./Home.module.css"

export function Home() {
  return (
    <div className={styles.home}>
      
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.overlay}>
          <h1>EL ARTESANO</h1>
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about}>
        <div className={styles.aboutContainer}>
          
          <div className={styles.aboutTitle}>
            <h2>¿Quiénes somos?</h2>
          </div>

          <div className={styles.aboutText}>
            <p>
              En el corazón de Nerja, el Restaurante El Artesano es todo un
              referente en cocina tradicional, pescados frescos y mariscos de
              calidad. Fundado en 2010 por Juan Francisco Castro Díaz, pionero
              de las marisquerías en la ciudad, el negocio ha mantenido intacta
              su esencia durante más de 50 años.
            </p>

            <p>
              Ofrecemos a nuestros clientes una experiencia gastronómica única
              basada en el producto fresco del mar, el sabor auténtico y la
              tradición de la cocina mediterránea.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
} 