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
import { redirect } from 'next/navigation'
import styles from '@/styles/stats.module.css'
import { getChatStats, getActiveUsersChartData } from '@/actions/chat-actions'
import { useUser } from '@clerk/nextjs'
import StatsChart from '@/components/stats-chart'

interface StatsData {
  totalUsers: number
  totalSessions: number
  totalMessages: number
  totalChats: number
  activeUsersToday: number
  activeUsersThisMonth: number
  activeUsersThisYear: number
  satisfactionStats: {
    overall: number
    helpfulness: number
    empathy: number
    clarity: number
  }
}

interface ChartDataPoint {
  time: string
  value: number
}

export default function ChatStats() {
  const { user } = useUser()

  const isAdminrole = user?.publicMetadata?.role === "admin"
  if (!isAdminrole) {
    redirect('/')
  }

  const [stats, setStats] = useState<StatsData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAllData = async () => {
    try {
      setError(null)
      
      // Obtener estadísticas generales
      const statsData = await getChatStats()
      
      // Obtener datos reales del gráfico
      const realChartData = await getActiveUsersChartData(7)
      
      setStats(statsData)
      setChartData(realChartData)
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
        <h3 style={{color:"rgb(9, 26, 68)"}}>Estadísticas del Chat</h3>
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

      {/* Estadísticas de usuarios activos */}
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
          <h4>Usuarios Activos Este Mes</h4>
          <p className={styles.statNumber}>{formatNumber(stats.activeUsersThisMonth)}</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiTrendingUp />
          </div>
          <h4>Usuarios Activos Este Año</h4>
          <p className={styles.statNumber}>{formatNumber(stats.activeUsersThisYear)}</p>
        </div>
      </div>

      {/* Gráfico de usuarios activos con datos reales */}
      <StatsChart
        data={chartData}
        title="Usuarios Activos por Día (Última Semana)"
        color="#2563eb"
      />

      {/* Estadísticas de satisfacción */}
      <div className={styles.satisfactionSection}>
        <h4 style={{color:"rgb(9, 26, 68)"}} className={styles.sectionTitle}>
          <FiHeart className={styles.sectionIcon} />
          Satisfacción del Usuario
        </h4>
        <div className={styles.satisfactionGrid}>
          <div className={styles.satisfactionCard}>
            <h5>General</h5>
            <p className={styles.satisfactionRating}>
              {stats.satisfactionStats.overall.toFixed(1)}/5
            </p>
          </div>
          <div className={styles.satisfactionCard}>
            <h5>Utilidad</h5>
            <p className={styles.satisfactionRating}>
              {stats.satisfactionStats.helpfulness.toFixed(1)}/5
            </p>
          </div>
          <div className={styles.satisfactionCard}>
            <h5>Empatía</h5>
            <p className={styles.satisfactionRating}>
              {stats.satisfactionStats.empathy.toFixed(1)}/5
            </p>
          </div>
          <div className={styles.satisfactionCard}>
            <h5>Claridad</h5>
            <p className={styles.satisfactionRating}>
              {stats.satisfactionStats.clarity.toFixed(1)}/5
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}