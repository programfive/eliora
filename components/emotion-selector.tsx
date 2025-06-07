'use client'

import { useState } from 'react'
import { EmotionType } from '@prisma/client'
import styles from '@/styles/emotion.module.css'

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType, intensity: number, description?: string) => void
  onClose: () => void
}

const emotions = [
  { type: 'EXCELLENT' as EmotionType, emoji: '😊', label: 'Muy bien / Excelente', color: '#4CAF50' },
  { type: 'NORMAL' as EmotionType, emoji: '😐', label: 'Normal / Regular', color: '#FFC107' },
  { type: 'SAD' as EmotionType, emoji: '😔', label: 'Triste / Decaído', color: '#2196F3' },
  { type: 'ANXIOUS' as EmotionType, emoji: '😰', label: 'Ansioso / Preocupado', color: '#FF9800' },
  { type: 'ANGRY' as EmotionType, emoji: '😡', label: 'Enojado / Frustrado', color: '#F44336' },
  { type: 'TIRED' as EmotionType, emoji: '😴', label: 'Cansado / Agotado', color: '#9C27B0' },
  { type: 'CONFUSED' as EmotionType, emoji: '😕', label: 'Confundido / Perdido', color: '#607D8B' }
]

export default function EmotionSelector({ onEmotionSelect, onClose }: EmotionSelectorProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (selectedEmotion) {
      onEmotionSelect(selectedEmotion, intensity, description || undefined)
      onClose()
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>¿Cómo te sientes hoy?</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <div className={styles.emotionsGrid}>
          {emotions.map((emotion) => (
            <button
              key={emotion.type}
              className={`${styles.emotionCard} ${selectedEmotion === emotion.type ? styles.selected : ''}`}
              onClick={() => setSelectedEmotion(emotion.type)}
              style={{ '--emotion-color': emotion.color } as React.CSSProperties}
            >
              <div className={styles.emotionEmoji}>{emotion.emoji}</div>
              <div className={styles.emotionLabel}>{emotion.label}</div>
            </button>
          ))}
        </div>

        {selectedEmotion && (
          <div className={styles.intensitySection}>
            <label>Intensidad (1-10)</label>
            <div className={styles.intensitySlider}>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
              />
              <span className={styles.intensityValue}>{intensity}</span>
            </div>
          </div>
        )}

        <div className={styles.descriptionSection}>
          <label>¿Qué te ha llevado a sentirte así? (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos un poco más sobre cómo te sientes..."
            className={styles.descriptionInput}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!selectedEmotion}
            className={styles.confirmBtn}
          >
            Continuar al Chat
          </button>
        </div>
      </div>
    </div>
  )
}