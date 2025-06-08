import { useState } from "react";
import { saveSatisfactionRating } from "@/actions/chat-actions";
import styles from "@/styles/satisfaction.module.css";

export default function SatisfactionForm({
  chatId,
  onSubmitted,
}: {
  chatId: string;
  onSubmitted?: () => void;
}) {
  const [ratings, setRatings] = useState({
    overallRating: 5,
    helpfulnessRating: 5,
    empathyRating: 5,
    clarityRating: 5,
    feedback: "",
    wouldRecommend: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setRatings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value) || value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveSatisfactionRating(chatId, ratings);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.log(err); 
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.formTitle}>Califica tu experiencia</h3>
      <label className={styles.label}>
        General:
        <input
          className={styles.input}
          type="number"
          name="overallRating"
          min={1}
          max={5}
          value={ratings.overallRating}
          onChange={handleChange}
        />
      </label>
      <label className={styles.label}>
        Utilidad:
        <input
          className={styles.input}
          type="number"
          name="helpfulnessRating"
          min={1}
          max={5}
          value={ratings.helpfulnessRating}
          onChange={handleChange}
        />
      </label>
      <label className={styles.label}>
        Empatía:
        <input
          className={styles.input}
          type="number"
          name="empathyRating"
          min={1}
          max={5}
          value={ratings.empathyRating}
          onChange={handleChange}
        />
      </label>
      <label className={styles.label}>
        Claridad:
        <input
          className={styles.input}
          type="number"
          name="clarityRating"
          min={1}
          max={5}
          value={ratings.clarityRating}
          onChange={handleChange}
        />
      </label>
      <label className={styles.label}>
        Comentarios:
        <textarea
          className={styles.textarea}
          name="feedback"
          value={ratings.feedback}
          onChange={handleChange}
        />
      </label>
      <label className={styles.label}>
        ¿Recomendarías este chat?
        <input
          type="checkbox"
          name="wouldRecommend"
          checked={ratings.wouldRecommend}
          onChange={handleChange}
        />
      </label>
      <button type="submit" className={styles.button} disabled={loading}>
        Enviar
      </button>
    </form>
  );
}
