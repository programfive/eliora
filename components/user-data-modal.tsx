// components/user-data-modal.tsx
"use client";
import { useState } from "react";
import { updateUserData } from "@/actions/chat-actions";
import Modal from "@/components/modal";
import styles from "@/styles/user-data-modal.module.css";

interface UserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function UserDataModal({ isOpen, onClose, onComplete }: UserDataModalProps) {
  const [formData, setFormData] = useState({
    career: "",
    birthDate: "",
    gender: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.career.trim()) {
      newErrors.career = "La carrera es requerida";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es requerida";
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        newErrors.birthDate = "Edad debe estar entre 13 y 120 años";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "El género es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUserData({
        career: formData.career.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender
      });

      onComplete();
    } catch (error) {
      console.error("Error actualizando datos del usuario:", error);
      alert("Error al guardar los datos. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Completa tu perfil"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Bienvenido a ELIORA</h3>
          <p className={styles.subtitle}>
            Para brindarte una mejor experiencia personalizada, necesitamos algunos datos básicos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="career" className={styles.label}>
              Carrera o área de estudio *
            </label>
            <select
              id="career"
              name="career"
              value={formData.career}
              onChange={handleInputChange}
              className={`${styles.select} ${errors.career ? styles.inputError : ''}`}
            >
              <option value="">Selecciona tu carrera</option>
              <option value="Psicología">Psicología</option>
              <option value="Teología">Teología</option>
              <option value="Trabajo Social">Trabajo Social</option>
              <option value="Ingeniería Comercial">Ingeniería Comercial</option>
              <option value="Ingeniería Informática">Ingeniería Informática</option>
              <option value="Administración de Empresas">Administración de Empresas</option>
            </select>
            {errors.career && <span className={styles.errorText}>{errors.career}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="birthDate" className={styles.label}>
              Fecha de nacimiento *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.birthDate ? styles.inputError : ''}`}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
            />
            {errors.birthDate && <span className={styles.errorText}>{errors.birthDate}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="gender" className={styles.label}>
              Género *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`${styles.select} ${errors.gender ? styles.inputError : ''}`}
            >
              <option value="">Selecciona tu género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
            {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
          </div>

          <div className={styles.footer}>
            <p className={styles.privacyNote}>
              💡 Estos datos nos ayudan a personalizar tu experiencia y son completamente confidenciales.
            </p>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Guardando..." : "Continuar al chat"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}