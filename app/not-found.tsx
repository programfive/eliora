import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>
            Página no encontrada
          </h2>
          <p className={styles.message}>
            Lo sentimos, la página que buscas no existe.
          </p>
          <Link 
            href="/"
            className={styles.button}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }