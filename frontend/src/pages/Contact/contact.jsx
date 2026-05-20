import { useState } from 'react'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí conectarías con tu API / servicio de email
    console.log('Formulario enviado:', form)
    setEnviado(true)
    setForm({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>

        {/* ── Columna izquierda: info de la empresa ── */}
        <aside className={styles.info}>
          <p className={styles.eyebrow}>Estamos aquí para ayudarte</p>
          <h1 className={styles.titulo}>Contacto</h1>
          <p className={styles.subtitulo}>
            Escríbenos o visítanos. Estaremos encantados de atenderte.
          </p>

          <div className={styles.datosLista}>
            <div className={styles.datoItem}>
              <span className={styles.datoIcono}>📍</span>
              <div>
                <p className={styles.datoLabel}>Dirección</p>
                <p className={styles.datoValor}>C. la Cruz, 25</p>
                <p className={styles.datoValor}>29780 Nerja, Málaga</p>
              </div>
            </div>

            <div className={styles.datoItem}>
              <span className={styles.datoIcono}>📞</span>
              <div>
                <p className={styles.datoLabel}>Teléfono</p>
                <a href="tel:+34630585322" className={styles.datoLink}>
                  630 585 322
                </a>
              </div>
            </div>
          </div>

          <div className={styles.decorLine} />
        </aside>

        {/* ── Columna derecha: formulario ── */}
        <div className={styles.formWrap}>
          {enviado ? (
            <div className={styles.exito}>
              <span className={styles.exitoIcono}>✦</span>
              <h2 className={styles.exitoTitulo}>Mensaje enviado</h2>
              <p className={styles.exitoTexto}>
                Gracias por contactar con nosotros. Te responderemos en breve.
              </p>
              <button
                className={styles.btnVolver}
                onClick={() => setEnviado(false)}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>

              <div className={styles.campo}>
                <label className={styles.labelForm} htmlFor="nombre">
                  Nombre y apellidos
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className={styles.input}
                  placeholder="Ej. María García López"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.labelForm} htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.labelForm} htmlFor="mensaje">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="¿En qué podemos ayudarte?"
                  rows={5}
                  value={form.mensaje}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.btnEnviar}>
                Enviar mensaje
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  )
}