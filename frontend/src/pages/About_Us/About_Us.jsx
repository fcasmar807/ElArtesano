import { useEffect, useRef, useState } from 'react'
import styles from './About_Us.module.css'

function useReveal(delay = 0) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, style: { transitionDelay: `${delay}ms` }, className: visible ? styles.visible : styles.hidden }
}

function Pillar({ svgPath, title, desc, delay }) {
  const { ref, style, className } = useReveal(delay)
  return (
    <div ref={ref} style={style} className={`${styles.pillar} ${className}`}>
      <div className={styles.pillarIcon}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fdfcf9" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
        </svg>
      </div>
      <h3 className={styles.pillarTitle}>{title}</h3>
      <p className={styles.pillarDesc}>{desc}</p>
    </div>
  )
}

function Tarjeta({ icon, title, desc, delay }) {
  const { ref, style, className } = useReveal(delay)
  return (
    <div ref={ref} style={style} className={`${styles.tarjeta} ${className}`}>
      <span className={styles.pezIcon}>{icon}</span>
      <h4 className={styles.tarjetaTitle}>{title}</h4>
      <p className={styles.tarjetaDesc}>{desc}</p>
    </div>
  )
}

function InfoCard({ label, title, children, delay }) {
  const { ref, style, className } = useReveal(delay)
  return (
    <div ref={ref} style={style} className={`${styles.infoCard} ${className}`}>
      <span className={styles.icLabel}>{label}</span>
      <h4 className={styles.infoCardTitle}>{title}</h4>
      {children}
    </div>
  )
}

function SeccionTitulo({ tag, title, desc, delay = 0 }) {
  const { ref, style, className } = useReveal(delay)
  return (
    <div ref={ref} style={style} className={`${styles.seccionTitulo} ${className}`}>
      <span className={styles.tag}>{tag}</span>
      <h2 className={styles.seccionH2} dangerouslySetInnerHTML={{ __html: title }} />
      {desc && <p className={styles.seccionDesc}>{desc}</p>}
    </div>
  )
}

export function About_Us() {
  const cita = useReveal(0)
  const citaP = useReveal(150)

  return (
    <div className={styles.home}>

      {/* ── HERO ─────────────────────────────────── */}
      <section className={styles.hero}>
        <svg className={styles.olas} viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#fdfcf9" opacity="0.08" />
          <path d="M0,55 C360,10 720,80 1080,30 C1260,5 1380,60 1440,55 L1440,80 L0,80 Z" fill="#fdfcf9" opacity="0.12" />
        </svg>
        <div className={styles.heroContenido}>
          <span className={styles.etiqueta}>📍 Nerja, Costa del Sol</span>
          <h1 className={styles.heroH1}>El <em>Artesano</em></h1>
          <p className={styles.subtitulo}>Pescadería fresca en el corazón de Nerja</p>
          <div className={styles.divider} />
          <p className={styles.heroP}>
            Donde el mar Mediterráneo llega directamente a tu mesa. Selección diaria de pescado
            y marisco fresco, traído por las mejores manos de la lonja. Calidad artesana,
            sabor auténtico, tradición marinera.
          </p>
          <a href="#contacto" className={styles.cta}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Encuéntranos en Nerja
          </a>
        </div>
      </section>

      {/* ── FILOSOFÍA ────────────────────────────── */}
      <section className={styles.intro}>
        <SeccionTitulo tag="Nuestra filosofía" title="Del mar a tu cocina,<br/>sin rodeos" />
        <div className={styles.introGrid}>
          <Pillar delay={0}   svgPath="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" title="Frescura del día"       desc="Cada mañana seleccionamos lo mejor de la lonja local. Si no está fresco, no lo vendemos." />
          <Pillar delay={100} svgPath="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"                                                                                                              title="Trato cercano"        desc="Somos gente de aquí. Te asesoramos sobre la mejor pieza según cómo la quieras cocinar." />
          <Pillar delay={200} svgPath="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" title="Calidad garantizada" desc="Pescado artesanal, trazabilidad completa y precios justos. Así trabajamos desde el principio." />
        </div>
      </section>

      {/* ── PRODUCTOS ────────────────────────────── */}
      <section className={styles.producto} id="productos">
        <SeccionTitulo tag="Lo que encontrarás" title="Selección fresca cada día" desc="El Mediterráneo ofrece lo mejor de cada temporada. Nuestro mostrador cambia con las mareas." />
        <div className={styles.catalogo}>
          <Tarjeta delay={0}   icon="🐟" title="Pescado azul"    desc="Boquerones, sardinas, caballa, atún… los sabores más auténticos de la costa malagueña." />
          <Tarjeta delay={80}  icon="🦑" title="Cefalópodos"     desc="Calamares, chipirones, pulpo y sepia de primera. Para guisos, plancha o fritura perfecta." />
          <Tarjeta delay={160} icon="🦐" title="Marisco"         desc="Gambas, langostinos, coquinas y chirlas. El mar en estado puro sobre tu mesa." />
          <Tarjeta delay={240} icon="🐠" title="Pescado blanco"  desc="Dorada, lubina, merluza, besugo... Piezas enteras o preparadas a tu gusto al momento." />
        </div>
      </section>

      {/* ── CITA ─────────────────────────────────── */}
      <section className={styles.historia}>
        <div className={styles.divider} style={{ marginBottom: '2.5rem' }} />
        <blockquote ref={cita.ref} style={cita.style} className={`${styles.cita} ${cita.className}`}>
          El buen pescado no necesita adornos, solo manos que sepan elegirlo
        </blockquote>
        <p ref={citaP.ref} style={citaP.style} className={`${styles.citaP} ${citaP.className}`}>
          En El Artesano creemos que la mejor cocina empieza en la pescadería.
          Por eso nos tomamos muy en serio cada pieza que ponemos en el mostrador:
          origen conocido, captura responsable y mimo en cada detalle.
        </p>
        <div className={styles.divider} style={{ marginTop: '2.5rem' }} />
      </section>

      {/* ── CONTACTO ─────────────────────────────── */}
      <section className={styles.contacto} id="contacto">
        <SeccionTitulo tag="Dónde estamos" title="Visítanos en Nerja" desc="Estamos aquí para ayudarte a elegir el mejor pescado. No dudes en llamarnos o pasarte por la tienda." />
        <div className={styles.contactoGrid}>
          <InfoCard label="Ubicación" title="Nerja, Málaga" delay={0}>
            <p className={styles.infoCardP}>En el centro de Nerja, cerca del mercado. Fácil aparcamiento en los alrededores.</p>
          </InfoCard>
          <InfoCard label="Horario" title="Lunes a Sábado" delay={100}>
            <p className={styles.infoCardP}>
              Mañanas: 08:00 – 14:00<br />
              Tardes: 17:00 – 20:30<br />
              <span className={styles.cerrado}>Domingo cerrado</span>
            </p>
          </InfoCard>
          <InfoCard label="Contacto" title="Llámanos" delay={200}>
            <p className={styles.infoCardP}>
              ¿Quieres reservar una pieza especial?<br />
              <a href="tel:+34600000000" className={styles.tel}>+34 600 000 000</a>
            </p>
          </InfoCard>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className={styles.footer}>
        <p><strong>El Artesano</strong> · Pescadería · Nerja, Málaga &nbsp;|&nbsp; © 2025 Todos los derechos reservados</p>
      </footer>

    </div>
  )
}
