import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context_providers/AuthProvider";
import { UPDATE_ME_ENDPOINT } from "../../util/config";
import styles from "./editProfile.module.css";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.name ?? user?.nombre ?? "",
    email: user?.email ?? "",
    telefono: user?.telefono ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("No hay sesion activa. Inicia sesion de nuevo.");
      return;
    }

    const payload = {
      name: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
    };

    try {
      setIsSaving(true);
      const response = await fetch(UPDATE_ME_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el perfil");
      }

      await refreshUser();
      navigate("/perfil");
    } catch (error) {
      setErrorMessage(error.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <h1>Editar perfil</h1>
          <p>Actualiza tu información personal y de acceso.</p>
        </div>

        <div className={styles.fields}>
          <label className={styles.field}>
            Nombre completo
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.field}>
            Correo electrónico
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.field}>
            Teléfono
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <div className={styles.actions}>
          <Link to="/perfil" className={styles.cancelBtn}>
            Cancelar
          </Link>
          <button type="submit" className={styles.saveBtn} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}