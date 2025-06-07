// components/ChatStats.tsx
'use client'

import { useEffect, useState } from 'react'

import styles from '@/styles/stats.module.css'
import { getChatStats } from '@/actions/chat-actions'

interface StatsData {
  totalEntrances: number
  totalMessages: number
  totalUsers: number
  totalChats: number
}

export default function ChatStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getChatStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Cargando estadísticas...</div>
  if (!stats) return <div>Error cargando estadísticas</div>

  return (
    <div className={styles.statsContainer}>
      <h3>Estadísticas del Chat</h3>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Usuarios</h4>
          <p className={styles.statNumber}>{stats.totalUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h4>Total Entradas</h4>
          <p className={styles.statNumber}>{stats.totalEntrances}</p>
        </div>
        <div className={styles.statCard}>
          <h4>Total Mensajes</h4>
          <p className={styles.statNumber}>{stats.totalMessages}</p>
        </div>
        <div className={styles.statCard}>
          <h4>Total Chats</h4>
          <p className={styles.statNumber}>{stats.totalChats}</p>
        </div>
      </div>
    </div>
  )
}