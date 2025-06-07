// components/ChatStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { 
  FiUsers, 
  FiLogIn, 
  FiMessageCircle, 
  FiMessageSquare,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiHeart,
  FiRefreshCw
} from 'react-icons/fi'

import styles from '@/styles/stats.module.css'
import { getChatStats, getEmotionalTrends } from '@/actions/chat-actions'

interface StatsData {
  totalUsers: number
  totalSessions: number
  totalMessages: number
  totalChats: number
  emotionalStats: Array<{
    emotion: string
    _count: { emotion: number }
  }>
  avgSessionTime: number
  activeUsersToday: number
}

interface EmotionalTrend {
  emotion: string
  count: number
  percentage: number
}

const emotionTranslations = {
  'HAPPY': 'Feliz',
  'SAD': 'Triste',
  'ANXIOUS': 'Ansioso',
  'CALM': 'Tranquilo',
  'EXCITED': 'Emocionado',
  'ANGRY': 'Enojado',
  'CONFUSED': 'Confundido',
  'GRATEFUL': 'Agradecido'
} as const

export default function ChatStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [emotionalTrends, setEmotionalTrends] = useState<EmotionalTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAllData = async () => {
    try {
      setError(null)
      
      const [statsData, trendsData] = await Promise.all([
        getChatStats(),
        getEmotionalTrends()
      ])
      
      setStats(statsData)
      setEmotionalTrends(trendsData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchAllData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className={`${styles.statsContainer} ${styles.loading}`}>
        <div className={styles.loadingSpinner}>
          <FiRefreshCw className={styles.spinIcon} />
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={handleRefresh} 
            className={styles.retryButton}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ''} />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className={styles.statsContainer}>
      <div className={styles.header}>
        <h3>Estadísticas del Chat</h3>
        <button 
          onClick={handleRefresh} 
          className={styles.refreshButton}
          disabled={refreshing}
          title="Actualizar estadísticas"
        >
          <FiRefreshCw className={refreshing ? styles.spinning : ''} />
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers />
          </div>
          <h4>Total Usuarios</h4>
          <p className={styles.statNumber}>{formatNumber(stats.totalUsers)}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiLogIn />
          </div>
          <h4>Total Sesiones</h4>
          <p className={styles.statNumber}>{formatNumber(stats.totalSessions)}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiMessageCircle />
          </div>
          <h4>Total Mensajes</h4>
          <p className={styles.statNumber}>{formatNumber(stats.totalMessages)}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiMessageSquare />
          </div>
          <h4>Total Chats</h4>
          <p className={styles.statNumber}>{formatNumber(stats.totalChats)}</p>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className={styles.additionalStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiActivity />
          </div>
          <h4>Usuarios Activos Hoy</h4>
          <p className={styles.statNumber}>{formatNumber(stats.activeUsersToday)}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock />
          </div>
          <h4>Tiempo Promedio de Sesión</h4>
          <p className={styles.statNumber}>{formatTime(stats.avgSessionTime)}</p>
        </div>
      </div>

      {/* Estadísticas emocionales */}
      {stats.emotionalStats.length > 0 && (
        <div className={styles.emotionalSection}>
          <h4 className={styles.sectionTitle}>
            <FiHeart className={styles.sectionIcon} />
            Estados Emocionales Registrados
          </h4>
          <div className={styles.emotionalGrid}>
            {stats.emotionalStats.map((emotion, index) => (
              <div key={index} className={styles.emotionalCard}>
                <h5>{emotionTranslations[emotion.emotion as keyof typeof emotionTranslations] || emotion.emotion}</h5>
                <p className={styles.emotionalCount}>{formatNumber(emotion._count.emotion)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendencias emocionales de la semana */}
      {emotionalTrends.length > 0 && (
        <div className={styles.trendsSection}>
          <h4 className={styles.sectionTitle}>
            <FiTrendingUp className={styles.sectionIcon} />
            Tendencias Emocionales (Última Semana)
          </h4>
          <div className={styles.trendsGrid}>
            {emotionalTrends.map((trend) => (
              <div key={trend.emotion} className={styles.trendCard}>
                <div className={styles.trendHeader}>
                  <h5>{emotionTranslations[trend.emotion as keyof typeof emotionTranslations] || trend.emotion}</h5>
                  <span className={styles.trendPercentage}>{trend.percentage.toFixed(1)}%</span>
                </div>
                <div className={styles.trendBar}>
                  <div 
                    className={styles.trendProgress}
                    style={{ width: `${trend.percentage}%` }}
                  ></div>
                </div>
                <p className={styles.trendCount}>{formatNumber(trend.count)} registros</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}